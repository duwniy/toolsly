package com.duwniy.toolsly.service;

import com.duwniy.toolsly.dto.OrderResponse;
import com.duwniy.toolsly.entity.EquipmentItem;
import com.duwniy.toolsly.entity.ItemStatus;
import com.duwniy.toolsly.entity.Order;
import com.duwniy.toolsly.entity.OrderStatus;
import com.duwniy.toolsly.repository.OrderRepository;
import com.duwniy.toolsly.repository.BranchRepository;
import com.duwniy.toolsly.repository.EquipmentItemRepository;
import com.duwniy.toolsly.repository.UserRepository;
import com.duwniy.toolsly.dto.ReturnRequest;
import com.duwniy.toolsly.exception.BusinessException;
import com.duwniy.toolsly.entity.Condition;
import com.duwniy.toolsly.entity.Branch;
import com.duwniy.toolsly.entity.EquipmentModel;
import com.duwniy.toolsly.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final PricingEngineService pricingEngineService;
    private final BranchRepository branchRepository;
    private final EquipmentItemRepository itemRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId) {
        Order order = orderRepository.findDetailedById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found", "ORDER_NOT_FOUND"));
        return toResponse(order);
    }

    @Transactional
    public Order createOrder(Order order) {
        order.setStatus(OrderStatus.CREATED);
        return orderRepository.save(order);
    }

    @Transactional
    public void reserveOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found", "ORDER_NOT_FOUND"));
        
        if (order.getStatus() != OrderStatus.CREATED) {
            throw new BusinessException("Order must be in CREATED status to reserve", "INVALID_STATUS");
        }

        // Validate items are available and not damaged
        order.getItems().forEach(item -> {
            if (item.getStatus() != ItemStatus.AVAILABLE) {
                throw new BusinessException("Item " + item.getModel().getName() + " is already reserved or issued", "ITEM_UNAVAILABLE");
            }
            if (item.getCondition() == Condition.DAMAGED) {
                throw new BusinessException("Item " + item.getModel().getName() + " is damaged", "ITEM_DAMAGED");
            }
        });

        order.setStatus(OrderStatus.RESERVED);
        // Assuming first item's model for base price or we need a more complex logic if items differ
        // For simplicity using first item's model as model is usually consistent in an order
        EquipmentModel firstModel = order.getItems().iterator().next().getModel();
        
        order.setTotalPrice(pricingEngineService.calculatePrice(
                firstModel,
                OffsetDateTime.now(), 
                order.getPlannedEndDate()
        ));
        
        orderRepository.save(order);
    }

    @Transactional
    public void issueOrder(UUID orderId, UUID staffId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found", "ORDER_NOT_FOUND"));
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new BusinessException("Staff user not found", "STAFF_NOT_FOUND"));
        
        if (order.getStatus() != OrderStatus.RESERVED) {
            throw new BusinessException("Order must be RESERVED to be issued", "INVALID_STATUS");
        }

        if (!order.getRenter().isVerified() && order.getTotalPrice().doubleValue() > 5000) {
            throw new BusinessException("User verification required for high-value items (>5000 RUB)", "VERIFICATION_REQUIRED");
        }

        order.setStatus(OrderStatus.ISSUED);
        order.setStaff(staff);
        for (EquipmentItem item : order.getItems()) {
            item.setStatus(ItemStatus.RENTED);
            itemRepository.save(item);
        }
        orderRepository.save(order);
    }

    @Transactional
    public void returnOrder(UUID orderId, ReturnRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BusinessException("Order not found", "ORDER_NOT_FOUND"));
        
        if (order.getStatus() != OrderStatus.ISSUED) {
            throw new BusinessException("Order must be ISSUED to be returned", "INVALID_STATUS");
        }

        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new BusinessException("Branch not found", "BRANCH_NOT_FOUND"));

        long currentItemsCount = itemRepository.countByBranch(branch);
        if (currentItemsCount >= branch.getStorageCapacity()) {
            throw new BusinessException("Target branch is at full capacity (" + branch.getStorageCapacity() + ")", "CAPACITY_EXCEEDED");
        }

        OffsetDateTime now = OffsetDateTime.now();
        BigDecimal totalFine = BigDecimal.ZERO;

        // 1. Overdue Penalty Calculation
        if (now.isAfter(order.getPlannedEndDate())) {
            long overdueDays = java.time.temporal.ChronoUnit.DAYS.between(order.getPlannedEndDate(), now);
            if (overdueDays == 0) overdueDays = 1;

            for (EquipmentItem item : order.getItems()) {
                // +50% markup for overdue days (1.5x daily rate)
                BigDecimal dailyRate = pricingEngineService.calculatePrice(item.getModel(), order.getPlannedEndDate(), order.getPlannedEndDate().plusDays(1));
                BigDecimal itemFine = dailyRate.multiply(BigDecimal.valueOf(1.5)).multiply(BigDecimal.valueOf(overdueDays));
                totalFine = totalFine.add(itemFine);
            }
        }

        // 2. Damage Penalty & Item Update
        for (EquipmentItem item : order.getItems()) {
            Condition updatedCondition = request.getItemConditions().get(item.getId());
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
            itemRepository.save(item);
        }

        order.setStatus(OrderStatus.RETURNED);
        order.setActualEndDate(now);
        order.setBranchEnd(branch);
        order.setTotalPrice(order.getTotalPrice().add(totalFine));
        orderRepository.save(order);
    }

    private OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setRenterId(order.getRenter().getId());
        response.setRenterEmail(order.getRenter().getEmail());
        response.setStaffId(order.getStaff() != null ? order.getStaff().getId() : null);
        response.setStatus(order.getStatus());
        response.setTotalPrice(order.getTotalPrice());
        response.setPlannedEndDate(order.getPlannedEndDate());
        response.setActualEndDate(order.getActualEndDate());
        response.setBranchStartId(order.getBranchStart() != null ? order.getBranchStart().getId() : null);
        response.setBranchStartName(order.getBranchStart() != null ? order.getBranchStart().getName() : null);
        response.setItems(order.getItems().stream().map(item -> {
            OrderResponse.OrderItemSummary itemSummary = new OrderResponse.OrderItemSummary();
            itemSummary.setId(item.getId());
            itemSummary.setSerialNumber(item.getSerialNumber());
            itemSummary.setCondition(item.getCondition());

            OrderResponse.ModelSummary modelSummary = new OrderResponse.ModelSummary();
            modelSummary.setName(item.getModel().getName());
            modelSummary.setMarketValue(item.getModel().getMarketValue());
            itemSummary.setModel(modelSummary);
            return itemSummary;
        }).toList());
        return response;
    }
}
