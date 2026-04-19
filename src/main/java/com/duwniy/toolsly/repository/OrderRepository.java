package com.duwniy.toolsly.repository;

import com.duwniy.toolsly.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    @EntityGraph(attributePaths = {"renter", "staff", "branchStart", "items", "items.model"})
    @Query("select o from Order o where o.id = :id")
    Optional<Order> findDetailedById(@Param("id") UUID id);

    java.util.List<Order> findByItemsContainingAndStatus(com.duwniy.toolsly.entity.EquipmentItem item, com.duwniy.toolsly.entity.OrderStatus status);

    java.util.List<Order> findByItemsContainingAndStatusIn(com.duwniy.toolsly.entity.EquipmentItem item, java.util.Collection<com.duwniy.toolsly.entity.OrderStatus> statuses);

    @EntityGraph(attributePaths = {"renter", "staff", "branchStart", "branchEnd", "items", "items.model"})
    java.util.List<Order> findAllByRenterIdOrderByCreatedAtDesc(UUID renterId);

    java.util.List<Order> findByStatusAndReservedUntilBefore(com.duwniy.toolsly.entity.OrderStatus status, java.time.OffsetDateTime time);

    @EntityGraph(attributePaths = {"renter", "items", "items.model"})
    java.util.List<Order> findTop20ByBranchEndIdAndStatusInOrderByActualEndDateDesc(UUID branchId, java.util.Collection<com.duwniy.toolsly.entity.OrderStatus> statuses);
}
