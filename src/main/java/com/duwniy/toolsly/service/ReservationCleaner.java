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

    @Scheduled(fixedRate = 60000) // Every minute
    @Transactional
    public void cleanupExpiredReservations() {
        OffsetDateTime now = OffsetDateTime.now();
        List<EquipmentItem> expiredItems = itemRepository.findReservedExpired(now);

        if (expiredItems.isEmpty()) {
            return;
        }

        log.info("Found {} expired reservations. Releasing items...", expiredItems.size());

        for (EquipmentItem item : expiredItems) {
            item.setStatus(ItemStatus.AVAILABLE);
            item.setReservedUntil(null);
            itemRepository.save(item);

            // Cancel associated CREATED orders
            List<Order> associatedOrders = orderRepository.findByItemsContainingAndStatus(item, OrderStatus.CREATED);
            for (Order order : associatedOrders) {
                log.info("Cancelling expired order {}", order.getId());
                order.setStatus(OrderStatus.CANCELLED);
                orderRepository.save(order);
            }
        }
    }
}
