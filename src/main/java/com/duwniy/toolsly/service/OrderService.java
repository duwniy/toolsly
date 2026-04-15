package com.duwniy.toolsly.service;

import com.duwniy.toolsly.entity.EquipmentItem;
import com.duwniy.toolsly.entity.ItemStatus;
import com.duwniy.toolsly.entity.Order;
import com.duwniy.toolsly.entity.OrderStatus;
import com.duwniy.toolsly.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import com.duwniy.toolsly.dto.ReturnRequest;
import com.duwniy.toolsly.entity.Condition;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryService inventoryService;
    private final PricingEngineService pricingEngineService;
    private final com.duwniy.toolsly.repository.BranchRepository branchRepository;
    private final com.duwniy.toolsly.repository.EquipmentItemRepository itemRepository;

    @Transactional
    public Order createOrder(Order order) {
        order.setStatus(OrderStatus.CREATED);
        return orderRepository.save(order);
    }

    @Transactional
    public void reserveOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (order.getStatus() != OrderStatus.CREATED) {
            throw new RuntimeException("Order must be in CREATED status to reserve");
        }

        // Apply Soft Lock (15 min) logic would go here for each item in order
        // For simplicity, assuming order has one item reference in this phase
        // or a list of items is managed.
        
        order.setStatus(OrderStatus.RESERVED);
        order.setTotalPrice(pricingEngineService.calculatePrice(
                null, // Should get model from items
                OffsetDateTime.now(), 
                order.getPlannedEndDate()
        ));
        
        orderRepository.save(order);
    }

    @Transactional
    public void issueOrder(UUID orderId, UUID staffId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (order.getStatus() != OrderStatus.RESERVED) {
            throw new RuntimeException("Order must be RESERVED to be issued");
        }

        if (!order.getRenter().isVerified() && order.getTotalPrice().doubleValue() > 5000) {
            throw new RuntimeException("User verification required for high-value items");
        }

        order.setStatus(OrderStatus.ISSUED);
        // Update item status to RENTED via inventoryService
        orderRepository.save(order);
    }

    @Transactional
    public void returnOrder(UUID orderId, ReturnRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (order.getStatus() != OrderStatus.ISSUED) {
            throw new RuntimeException("Order must be ISSUED to be returned");
        }

        com.duwniy.toolsly.entity.Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        long currentItemsCount = itemRepository.countByBranch(branch);
        if (currentItemsCount >= branch.getStorageCapacity()) {
            throw new RuntimeException("Target branch is at full capacity (" + branch.getStorageCapacity() + ")");
        }

        // Update items in the order
        for (EquipmentItem item : order.getItems()) {
            Condition updatedCondition = request.getItemConditions().get(item.getId());
            if (updatedCondition != null) {
                item.setCondition(updatedCondition);
            }
            item.setBranch(branch);
            item.setStatus(ItemStatus.AVAILABLE);
            itemRepository.save(item);
        }

        order.setStatus(OrderStatus.RETURNED);
        order.setActualEndDate(OffsetDateTime.now());
        order.setBranchEnd(branch);
        orderRepository.save(order);
    }
}
