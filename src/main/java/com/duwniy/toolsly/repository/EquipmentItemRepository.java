package com.duwniy.toolsly.repository;

import com.duwniy.toolsly.entity.EquipmentItem;
import com.duwniy.toolsly.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface EquipmentItemRepository extends JpaRepository<EquipmentItem, UUID> {
    long countByBranch(Branch branch);
    java.util.List<EquipmentItem> findByBranchId(UUID branchId);
}
