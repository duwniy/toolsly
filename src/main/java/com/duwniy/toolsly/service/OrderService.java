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

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findDetailedById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found", "ORDER_NOT_FOUND"));
        enforceOrderAccess(order);
        return orderMapper.toResponse(order);
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
        item.setStatus(ItemStatus.RESERVED);
        item.setReservedUntil(OffsetDateTime.now().plusMinutes(RESERVATION_LOCK_MINUTES));
        itemRepository.save(item);

        Order order = new Order();
        order.setRenter(renter);
        order.setBranchStart(branch);
        order.setPlannedEndDate(endDate);
        order.setStatus(OrderStatus.CREATED);
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

        if (!order.getRenter().isVerified()
                && order.getTotalPrice() != null
                && order.getTotalPrice().compareTo(BigDecimal.valueOf(5000)) > 0) {
            throw new BusinessException("User verification required for high-value items (>5000 RUB)", "VERIFICATION_REQUIRED");
        }

        order.setStatus(OrderStatus.ISSUED);
        order.setStaff(staff);
        orderRepository.save(order);
        log.info("Staff [{}] issued Order [{}] to User [{}]", staff.getEmail(), order.getId(), order.getRenter().getEmail());
    }

    @Transactional
    public void returnOrder(UUID orderId, ReturnRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found", "ORDER_NOT_FOUND"));
        
        if (order.getStatus() != OrderStatus.ISSUED) {
            throw new BusinessException("Order must be ISSUED to be returned", "INVALID_STATUS");
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
        BigDecimal totalFine = BigDecimal.ZERO;
        Map<UUID, Condition> itemConditions = (request.getItemConditions() == null) ? Map.of() : request.getItemConditions();

        // 1. Overdue Penalty Calculation
        if (now.isAfter(order.getPlannedEndDate())) {
            long overdueDays = java.time.temporal.ChronoUnit.DAYS.between(order.getPlannedEndDate(), now);
            if (overdueDays == 0) overdueDays = 1;

            for (EquipmentItem item : order.getItems()) {
                // +50% markup for overdue days (1.5x daily rate)
                BigDecimal dailyRate = pricingEngineService.calculatePrice(item.getModel(), order.getPlannedEndDate(), order.getPlannedEndDate().plusDays(1)).getTotalPrice();
                BigDecimal itemFine = dailyRate.multiply(BigDecimal.valueOf(1.5)).multiply(BigDecimal.valueOf(overdueDays));
                totalFine = totalFine.add(itemFine);
            }
        }

        // 2. Damage Penalty & Item Update
        for (EquipmentItem item : order.getItems()) {
            Condition updatedCondition = itemConditions.get(item.getId());
            if (updatedCondition != null) {
                // USED: 10%, DAMAGED: 50% of Market Value when condition degrades
                if (updatedCondition == Condition.USED && item.getCondition() == Condition.NEW) {
                    BigDecimal damageFine = item.getModel().getMarketValue().multiply(BigDecimal.valueOf(0.1));
                    totalFine = totalFine.add(damageFine);
                } else if (updatedCondition == Condition.DAMAGED && item.getCondition() != Condition.DAMAGED) {
                    BigDecimal damageFine = item.getModel().getMarketValue().multiply(BigDecimal.valueOf(0.5));
                    totalFine = totalFine.add(damageFine);
                }
                item.setCondition(updatedCondition);
            }
            item.setBranch(branch);
            item.setStatus(ItemStatus.AVAILABLE);
            item.setReservedUntil(null);
            itemRepository.save(item);
        }

        order.setStatus(OrderStatus.RETURNED);
        order.setActualEndDate(now);
        order.setBranchEnd(branch);
        BigDecimal baseTotal = (order.getTotalPrice() == null) ? BigDecimal.ZERO : order.getTotalPrice();
        order.setTotalPrice(baseTotal.add(totalFine));
        orderRepository.save(order);
        log.info("Order [{}] returned to Branch [{}]. Total price updated to {}", order.getId(), branch.getName(), order.getTotalPrice());
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

}
