package com.duwniy.toolsly.service;

import com.duwniy.toolsly.entity.Branch;
import com.duwniy.toolsly.entity.Condition;
import com.duwniy.toolsly.entity.EquipmentItem;
import com.duwniy.toolsly.entity.ItemStatus;
import com.duwniy.toolsly.repository.EquipmentItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final EquipmentItemRepository itemRepository;

    @Transactional
    public void updateStatus(UUID itemId, ItemStatus newStatus) {
        EquipmentItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setStatus(newStatus);
        itemRepository.save(item);
    }

    @Transactional
    public void updateLocation(UUID itemId, Branch newBranch) {
        // Need to check storage capacity here in OrderService or here
        EquipmentItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setBranch(newBranch);
        itemRepository.save(item);
    }

    @Transactional
    public void setSoftLock(UUID itemId, int minutes) {
        EquipmentItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setReservedUntil(OffsetDateTime.now().plusMinutes(minutes));
        item.setStatus(ItemStatus.AVAILABLE); // Keep available but with lock logic in queries
        itemRepository.save(item);
    }
    
    @Transactional
    public void updateCondition(UUID itemId, Condition condition) {
        EquipmentItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        item.setCondition(condition);
        itemRepository.save(item);
    }
}
