package com.duwniy.toolsly.service;

import com.duwniy.toolsly.entity.EquipmentItem;
import com.duwniy.toolsly.entity.ItemStatus;
import com.duwniy.toolsly.entity.Order;
import com.duwniy.toolsly.entity.OrderStatus;
import com.duwniy.toolsly.repository.EquipmentItemRepository;
import com.duwniy.toolsly.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationCleaner {

    private final EquipmentItemRepository itemRepository;
    private final OrderRepository orderRepository;

    @Scheduled(fixedRate = 600000) // Every 10 minutes
    @Transactional
    public void cleanupExpiredReservations() {
        OffsetDateTime now = OffsetDateTime.now();
        
        // 1. Clean up expired ORDERS
        List<Order> expiredOrders = orderRepository.findByStatusAndReservedUntilBefore(OrderStatus.RESERVED, now);
        for (Order order : expiredOrders) {
            log.info("Cleaning up expired order {}", order.getId());
            order.setStatus(OrderStatus.CANCELLED);
            order.getItems().forEach(item -> {
                item.setStatus(ItemStatus.AVAILABLE);
                item.setReservedUntil(null);
                itemRepository.save(item);
            });
            orderRepository.save(order);
        }

        // 2. Clean up orphaned expired Items (Safety check)
        List<EquipmentItem> expiredItems = itemRepository.findReservedExpired(now);
        for (EquipmentItem item : expiredItems) {
            log.info("Cleaning up orphaned expired item reservation {}", item.getId());
            item.setStatus(ItemStatus.AVAILABLE);
            item.setReservedUntil(null);
            itemRepository.save(item);
            
            // Also cancel any CREATED orders if they exist for this item
            List<Order> createdOrders = orderRepository.findByItemsContainingAndStatusIn(
                item, List.of(OrderStatus.CREATED));
            for (Order order : createdOrders) {
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
            }
        }
    }
}
