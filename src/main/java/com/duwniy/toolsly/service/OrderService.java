package com.duwniy.toolsly.service;

import com.duwniy.toolsly.dto.OrderResponse;
import com.duwniy.toolsly.entity.EquipmentItem;
import com.duwniy.toolsly.entity.ItemStatus;
import com.duwniy.toolsly.entity.Order;
import com.duwniy.toolsly.entity.OrderStatus;
import com.duwniy.toolsly.entity.Role;
import com.duwniy.toolsly.repository.OrderRepository;
import com.duwniy.toolsly.repository.BranchRepository;
import com.duwniy.toolsly.repository.EquipmentItemRepository;
import com.duwniy.toolsly.repository.EquipmentModelRepository;
import com.duwniy.toolsly.repository.UserRepository;
import com.duwniy.toolsly.dto.ReturnRequest;
import com.duwniy.toolsly.exception.BusinessException;
import com.duwniy.toolsly.entity.Condition;
import com.duwniy.toolsly.entity.Branch;
import com.duwniy.toolsly.entity.EquipmentModel;
import com.duwniy.toolsly.entity.User;
import com.duwniy.toolsly.security.ToolslyUserPrincipal;
import com.duwniy.toolsly.mapper.OrderMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private static final int RESERVATION_LOCK_MINUTES = 15;

    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final PricingEngineService pricingEngineService;
    private final BranchRepository branchRepository;
    private final EquipmentItemRepository itemRepository;
    private final UserRepository userRepository;
    private final EquipmentModelRepository modelRepository;
    private final OrderMapper orderMapper;
    private final com.duwniy.toolsly.repository.AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findDetailedById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found", "ORDER_NOT_FOUND"));
        enforceOrderAccess(order);
        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public java.util.List<OrderResponse> getOrdersByRenter(UUID renterId) {
        return orderRepository.findAllByRenterIdOrderByCreatedAtDesc(renterId)
                .stream()
                .map(this::toResponseWithAccrued)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public Order createOrder(Order order) {
        // 1. Validation
        OffsetDateTime now = OffsetDateTime.now();
        if (order.getPlannedEndDate() == null || !order.getPlannedEndDate().isAfter(now)) {
            throw new BusinessException("Invalid return date", "INVALID_DATES");
        }

        if (order.getItems() == null || order.getItems().isEmpty()) {
            // If items are not provided, we must have a modelId to search for
            // For now, let's assume the request comes with specific items or we need to find them
            // In the new flow, the user selects a MODEL, and we find an ITEM.
            throw new BusinessException("Items must be selected", "ITEMS_REQUIRED");
        }

        order.setStatus(OrderStatus.CREATED);
        Order saved = orderRepository.save(order);
        log.info("New order created: ID={}, renter={}", saved.getId(), saved.getRenter().getEmail());
        return saved;
    }

    @Transactional
    public Order createOrderFromModel(UUID renterId, UUID modelId, UUID branchId, OffsetDateTime endDate) {
        User renter = userRepository.findById(renterId)
                .orElseThrow(() -> new BusinessException("Renter not found", "USER_NOT_FOUND"));
        
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new BusinessException("Branch not found", "BRANCH_NOT_FOUND"));
        
        EquipmentModel model = modelRepository.findById(modelId)
                .orElseThrow(() -> new BusinessException("Model not found", "MODEL_NOT_FOUND"));

        // Find available item
        EquipmentItem item = itemRepository.findFirstByModelIdAndBranchIdAndStatus(modelId, branchId, ItemStatus.AVAILABLE)
                .stream()
                .filter(i -> i.getReservedUntil() == null || i.getReservedUntil().isBefore(OffsetDateTime.now()))
                .findFirst()
                .orElseThrow(() -> new BusinessException("No available items for this model in the selected branch", "NO_ITEMS_AVAILABLE"));

        // Atomic soft-lock
        OffsetDateTime reservedUntil = OffsetDateTime.now().plusMinutes(RESERVATION_LOCK_MINUTES);
        item.setStatus(ItemStatus.RESERVED);
        item.setReservedUntil(reservedUntil);
        itemRepository.save(item);

        Order order = new Order();
        order.setRenter(renter);
        order.setBranchStart(branch);
        order.setPlannedEndDate(endDate);
        order.setStatus(OrderStatus.RESERVED);
        order.setReservedUntil(reservedUntil);
        item.setReservedUntil(reservedUntil);
        order.setItems(List.of(item));
        
        order.setTotalPrice(pricingEngineService.calculatePrice(model, OffsetDateTime.now(), endDate).getTotalPrice());
        Order savedOrder = orderRepository.save(order);
        log.info("User [{}] created a reservation for [{}] in Branch [{}]", renter.getEmail(), model.getName(), branch.getName());
        return savedOrder;
    }

    @Transactional
    public void reserveOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found", "ORDER_NOT_FOUND"));

        if (order.getStatus() != OrderStatus.CREATED) {
            throw new BusinessException("Order must be in CREATED status to reserve", "INVALID_STATUS");
        }

        OffsetDateTime now = OffsetDateTime.now();

        if (order.getPlannedEndDate() == null) {
            throw new BusinessException("Planned end date is required to reserve order", "PLANNED_END_DATE_REQUIRED");
        }

        if (!order.getPlannedEndDate().isAfter(now)) {
            throw new BusinessException("Planned end date must be in the future", "INVALID_PLANNED_END_DATE");
        }

        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new BusinessException("Order must contain at least one item to reserve", "EMPTY_ORDER_ITEMS");
        }

        // Validate items are available, not damaged and without active soft lock
        order.getItems().forEach(item -> {
            if (item.getStatus() != ItemStatus.AVAILABLE) {
                throw new BusinessException("Item " + item.getModel().getName() + " is already reserved or issued", "ITEM_UNAVAILABLE");
            }
            if (item.getCondition() == Condition.DAMAGED) {
                throw new BusinessException("Item " + item.getModel().getName() + " is damaged", "ITEM_DAMAGED");
            }
            if (item.getReservedUntil() != null && item.getReservedUntil().isAfter(now)) {
                throw new BusinessException("Item " + item.getModel().getName() + " is temporarily reserved", "ITEM_SOFT_LOCKED");
            }
        });

        // Apply soft lock for all items in the order
        order.getItems().forEach(item ->
                inventoryService.setSoftLock(item.getId(), RESERVATION_LOCK_MINUTES)
        );

        // Assuming first item's model for base price; models are usually consistent within an order
        EquipmentModel firstModel = order.getItems().iterator().next().getModel();

        order.setTotalPrice(pricingEngineService.calculatePrice(
                firstModel,
                now,
                order.getPlannedEndDate()
        ).getTotalPrice());

        OffsetDateTime reservedUntil = now.plusMinutes(RESERVATION_LOCK_MINUTES);
        order.setReservedUntil(reservedUntil);
        order.getItems().forEach(item -> item.setReservedUntil(reservedUntil));
        order.setStatus(OrderStatus.RESERVED);
        Order saved = orderRepository.save(order);
        log.info("Order [{}] successfully reserved for user [{}]. Total price: {}", saved.getId(), saved.getRenter().getEmail(), saved.getTotalPrice());
    }

    @Transactional
    public void issueOrder(UUID orderId, UUID staffId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found", "ORDER_NOT_FOUND"));

        if (order.getStatus() != OrderStatus.RESERVED) {
            throw new BusinessException("Order must be RESERVED to be issued", "INVALID_STATUS");
        }

        if (staffId == null) {
            throw new BusinessException("staffId is required", "STAFF_ID_REQUIRED");
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof ToolslyUserPrincipal principal) {
            if (principal.getRole() != Role.STAFF) {
                throw new BusinessException("Only staff members can issue orders", "ACCESS_DENIED");
            }
            if (!principal.getUserId().equals(staffId)) {
                throw new BusinessException("staffId must match authenticated staff user", "STAFF_ID_MISMATCH");
            }
        }

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new BusinessException("Staff user not found", "STAFF_NOT_FOUND"));
        if (staff.getRole() != Role.STAFF) {
            throw new BusinessException("Only staff members can issue orders", "ACCESS_DENIED");
        }

        boolean highValue = order.getItems().stream()
                .anyMatch(item -> item.getModel().getMarketValue() != null 
                        && item.getModel().getMarketValue().compareTo(BigDecimal.valueOf(5000)) > 0);

        if (!order.getRenter().isVerified() && highValue) {
            throw new BusinessException("User verification required for orders containing high-value items (>5000 RUB market value)", "VERIFICATION_REQUIRED");
        }

        order.setStatus(OrderStatus.ISSUED);
        order.setStaff(staff);
        order.setIssuedAt(OffsetDateTime.now());
        
        // Transition items to RENTED status
        order.getItems().forEach(item -> {
            item.setStatus(ItemStatus.RENTED);
            item.setReservedUntil(null);
            itemRepository.save(item);
        });
        
        orderRepository.save(order);
        log.info("Staff [{}] issued Order [{}] to User [{}]", staff.getEmail(), order.getId(), order.getRenter().getEmail());
    }

    @Transactional
    public void requestReturn(UUID orderId, UUID targetBranchId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found", "ORDER_NOT_FOUND"));

        if (order.getStatus() != OrderStatus.ISSUED) {
            throw new BusinessException("Only issued orders can initiate return", "INVALID_STATUS");
        }

        Branch targetBranch = branchRepository.findById(targetBranchId)
                .orElseThrow(() -> new BusinessException("Branch not found", "BRANCH_NOT_FOUND"));

        long currentItemsCount = itemRepository.countByBranch(targetBranch);
        int incomingItemsCount = order.getItems().size();

        if (currentItemsCount + incomingItemsCount > targetBranch.getStorageCapacity()) {
            throw new BusinessException("Target branch is full", "BRANCH_FULL");
        }

        order.setStatus(OrderStatus.RETURN_PENDING);
        order.setTargetBranch(targetBranch);
        orderRepository.save(order);
        log.info("User requested return for Order [{}] to Branch [{}]", order.getId(), targetBranch.getName());
    }

    @Transactional
    public void returnOrder(UUID orderId, ReturnRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found", "ORDER_NOT_FOUND"));
        
        if (order.getStatus() != OrderStatus.ISSUED && order.getStatus() != OrderStatus.RETURN_PENDING) {
            throw new BusinessException("Order must be ISSUED or RETURN_PENDING to be returned", "INVALID_STATUS");
        }

        if (request == null || request.getBranchId() == null) {
            throw new BusinessException("Branch ID is required for return", "BRANCH_ID_REQUIRED");
        }

        if (order.getPlannedEndDate() == null) {
            throw new BusinessException("Planned end date is required to return order", "PLANNED_END_DATE_REQUIRED");
        }

        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new BusinessException("Branch not found", "BRANCH_NOT_FOUND"));

        long currentItemsCount = itemRepository.countByBranch(branch);
        int returningItemsCount = (order.getItems() == null) ? 0 : order.getItems().size();
        int capacity = (branch.getStorageCapacity() == null) ? 0 : branch.getStorageCapacity();
        if (returningItemsCount <= 0) {
            throw new BusinessException("Order must contain at least one item to return", "EMPTY_ORDER_ITEMS");
        }
        if (currentItemsCount + returningItemsCount > capacity) {
            throw new BusinessException("Target branch capacity exceeded (" + capacity + ")", "CAPACITY_EXCEEDED");
        }

        OffsetDateTime now = OffsetDateTime.now();
        BigDecimal totalPenalty = BigDecimal.ZERO;
        Map<UUID, Condition> itemConditions = (request.getItemConditions() == null) ? Map.of() : request.getItemConditions();

        // 1. Overdue Penalty Calculation
        if (now.isAfter(order.getPlannedEndDate())) {
            long overdueDays = java.time.temporal.ChronoUnit.DAYS.between(order.getPlannedEndDate(), now);
            if (overdueDays == 0) overdueDays = 1;

            for (EquipmentItem item : order.getItems()) {
                // +50% markup for overdue days (1.5x daily rate)
                BigDecimal dailyRate = pricingEngineService.calculatePrice(item.getModel(), order.getPlannedEndDate(), order.getPlannedEndDate().plusDays(1)).getTotalPrice();
                BigDecimal itemFine = dailyRate.multiply(BigDecimal.valueOf(1.5)).multiply(BigDecimal.valueOf(overdueDays));
                totalPenalty = totalPenalty.add(itemFine);
            }
        }

        // Duration calculation: from ISSUE to NOW
        OffsetDateTime rentalStart = order.getIssuedAt() != null ? order.getIssuedAt() : order.getCreatedAt();
        long minutes = java.time.temporal.ChronoUnit.MINUTES.between(rentalStart, now);
        long actualRentalDays = (long) Math.ceil((double) minutes / (24 * 60));
        if (actualRentalDays <= 0) actualRentalDays = 1;

        // 2. Damage Penalty & Item Update & Maintenance logic
        for (EquipmentItem item : order.getItems()) {
            Condition updatedCondition = itemConditions.get(item.getId());
            Condition oldCondition = item.getCondition();
            
            if (updatedCondition != null) {
                // Penalties: DAMAGED: 30%, BROKEN: 50% of Market Value
                if (updatedCondition == Condition.DAMAGED && oldCondition != Condition.DAMAGED) {
                    BigDecimal damageFine = item.getModel().getMarketValue().multiply(BigDecimal.valueOf(0.3));
                    totalPenalty = totalPenalty.add(damageFine);
                    log.info("FINES_APPLIED: Penalty of {} RUB applied to order {} for DAMAGED item {}", damageFine, order.getId(), item.getId());
                } else if (updatedCondition == Condition.BROKEN && oldCondition != Condition.BROKEN) {
                    BigDecimal damageFine = item.getModel().getMarketValue().multiply(BigDecimal.valueOf(0.5));
                    totalPenalty = totalPenalty.add(damageFine);
                    log.info("FINES_APPLIED: Penalty of {} RUB applied to order {} for BROKEN item {}", damageFine, order.getId(), item.getId());
                }
                item.setCondition(updatedCondition);

                // Manual Audit Log for condition change
                String staffName = "System";
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof ToolslyUserPrincipal principal) {
                    staffName = principal.getUsername();
                }

                auditLogRepository.save(com.duwniy.toolsly.entity.AuditLog.builder()
                        .entityName("EquipmentItem")
                        .entityId(item.getId())
                        .action("CONDITION_CHANGE")
                        .oldValue(Map.of("condition", oldCondition != null ? oldCondition.name() : "NEW"))
                        .newValue(Map.of(
                                "condition", updatedCondition.name(),
                                "staffName", staffName,
                                "comment", request.getStaffComment() != null ? request.getStaffComment() : "Condition updated during return"
                        ))
                        .timestamp(OffsetDateTime.now())
                        .build());
            }
            
            // Update total rental days of the physical item
            int currentTotalDays = item.getTotalRentalDays() != null ? item.getTotalRentalDays() : 0;
            item.setTotalRentalDays(currentTotalDays + (int) actualRentalDays);
            
            item.setBranch(branch);
            
            // Maintenance logic: if > 50 days, auto-maintenance
            if (item.getTotalRentalDays() > 50) {
                log.info("Item {} exceeded 50 rental days (total: {}). Setting status to MAINTENANCE", item.getId(), item.getTotalRentalDays());
                item.setStatus(ItemStatus.MAINTENANCE);
            } else {
                item.setStatus(ItemStatus.AVAILABLE);
            }
            
            item.setReservedUntil(null);
            itemRepository.save(item);
        }

        order.setStatus(OrderStatus.RETURNED);
        order.setActualEndDate(now);
        order.setBranchEnd(branch);
        order.setStaffComment(request.getStaffComment());
        
        // Automated incident detection: If DAMAGED/BROKEN or manually flagged
        boolean hasDamagedItems = request.getItemConditions() != null && request.getItemConditions().values().stream()
                .anyMatch(c -> c == Condition.DAMAGED || c == Condition.BROKEN);
        order.setIsIncident(Boolean.TRUE.equals(request.getIsIncident()) || hasDamagedItems);

        BigDecimal baseTotal = (order.getTotalPrice() == null) ? BigDecimal.ZERO : order.getTotalPrice();
        order.setTotalPrice(baseTotal.add(totalPenalty));
        orderRepository.save(order);
        log.info("Order [{}] returned to Branch [{}]. Penalty: {}. Total Price: {}. Incident: {}", 
                order.getId(), branch.getName(), totalPenalty, order.getTotalPrice(), order.getIsIncident());
    }

    private void enforceOrderAccess(Order order) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof ToolslyUserPrincipal principal)) {
            throw new BusinessException("Access denied", "ACCESS_DENIED");
        }

        if (principal.getRole() == Role.RENTER && !order.getRenter().getId().equals(principal.getUserId())) {
            throw new BusinessException("Access denied", "ACCESS_DENIED");
        }
    }

    private OrderResponse toResponseWithAccrued(Order order) {
        OrderResponse response = orderMapper.toResponse(order);
        if (order.getStatus() == OrderStatus.ISSUED && order.getIssuedAt() != null) {
            response.setCurrentAccruedPrice(calculateCurrentAccruedPrice(order.getId()));
        }
        return response;
    }

    public BigDecimal calculateCurrentAccruedPrice(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found", "ORDER_NOT_FOUND"));
        
        if (order.getStatus() != OrderStatus.ISSUED || order.getIssuedAt() == null) {
            return BigDecimal.ZERO;
        }

        OffsetDateTime start = order.getIssuedAt();
        OffsetDateTime now = OffsetDateTime.now();
        
        // Use pricing engine to calculate what was already used
        EquipmentModel model = order.getItems().iterator().next().getModel();
        return pricingEngineService.calculatePrice(model, start, now).getTotalPrice();
    }

    @Transactional(readOnly = true)
    public com.duwniy.toolsly.dto.UserFinancesResponse getUserFinances(UUID userId) {
        List<Order> allOrders = orderRepository.findAllByRenterIdOrderByCreatedAtDesc(userId);
        
        BigDecimal totalSpent = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.CLOSED || o.getStatus() == OrderStatus.RETURNED)
                .map(o -> o.getTotalPrice() != null ? o.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal activeRentalsCost = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.ISSUED)
                .map(o -> calculateCurrentAccruedPrice(o.getId()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal potentialFines = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.RESERVED)
                .map(o -> o.getTotalPrice() != null ? o.getTotalPrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<com.duwniy.toolsly.dto.UserFinancesResponse.OrderSummary> recentSub = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.CLOSED || o.getStatus() == OrderStatus.RETURNED)
                .limit(10)
                .map(o -> com.duwniy.toolsly.dto.UserFinancesResponse.OrderSummary.builder()
                        .id(o.getId().toString())
                        .toolName(o.getItems().isEmpty() ? "N/A" : o.getItems().get(0).getModel().getName())
                        .createdAt(o.getCreatedAt())
                        .plannedEndDate(o.getActualEndDate())
                        .finalPrice(o.getTotalPrice())
                        .status(o.getStatus().name())
                        .build())
                .collect(java.util.stream.Collectors.toList());

        return com.duwniy.toolsly.dto.UserFinancesResponse.builder()
                .totalSpent(totalSpent)
                .activeRentalsCost(activeRentalsCost)
                .potentialFines(potentialFines)
                .recentPayments(recentSub)
                .build();
    }
}
