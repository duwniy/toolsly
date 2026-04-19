package com.duwniy.toolsly.repository;

import com.duwniy.toolsly.entity.Branch;
import com.duwniy.toolsly.entity.EquipmentItem;
import com.duwniy.toolsly.entity.ItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public interface EquipmentItemRepository extends JpaRepository<EquipmentItem, UUID> {
    long countByBranch(Branch branch);
    List<EquipmentItem> findByBranchId(UUID branchId);

    @Query("SELECT i FROM EquipmentItem i LEFT JOIN FETCH i.model m LEFT JOIN FETCH i.branch LEFT JOIN FETCH m.category")
    List<EquipmentItem> findAllWithDetails();

    @Query("SELECT i FROM EquipmentItem i LEFT JOIN FETCH i.model m LEFT JOIN FETCH i.branch b LEFT JOIN FETCH m.category WHERE b.id = :branchId")
    List<EquipmentItem> findByBranchIdWithDetails(@Param("branchId") UUID branchId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM EquipmentItem i WHERE i.model.id = :modelId AND i.branch.id = :branchId AND i.status = :status")
    List<EquipmentItem> findFirstByModelIdAndBranchIdAndStatus(
            @Param("modelId") UUID modelId,
            @Param("branchId") UUID branchId,
            @Param("status") ItemStatus status);

    @Query("SELECT i FROM EquipmentItem i WHERE i.status = 'RESERVED' AND i.reservedUntil < :now")
    List<EquipmentItem> findReservedExpired(@Param("now") OffsetDateTime now);
}
