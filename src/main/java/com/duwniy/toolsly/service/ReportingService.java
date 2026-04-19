package com.duwniy.toolsly.service;

import com.duwniy.toolsly.dto.DashboardStats;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportingService {

    private final EntityManager entityManager;

    public DashboardStats getDashboardStats(UUID branchId) {
        log.info("Generating dashboard statistics for branch ID: {}", branchId != null ? branchId : "GLOBAL");
        return DashboardStats.builder()
                .totalRevenue(calculateTotalRevenue(branchId))
                .totalOrders(countTotalOrders(branchId))
                .occupancyRate(calculateOccupancyRate(branchId))
                .damageRate(calculateDamageRate(branchId))
                .topModels(getTopModels(branchId))
                .revenueTrend(getRevenueTrendLast30Days(branchId))
                .build();
    }

    private BigDecimal calculateTotalRevenue(UUID branchId) {
        String query = "SELECT SUM(total_price) FROM orders WHERE status IN ('RETURNED', 'CLOSED')";
        if (branchId != null) {
            query += " AND branch_start_id = :branchId";
        }
        var nativeQuery = entityManager.createNativeQuery(query);
        if (branchId != null) nativeQuery.setParameter("branchId", branchId);
        Object result = nativeQuery.getSingleResult();
        return result != null ? (BigDecimal) result : BigDecimal.ZERO;
    }

    private Long countTotalOrders(UUID branchId) {
        String query = "SELECT COUNT(*) FROM orders";
        if (branchId != null) {
            query += " WHERE branch_start_id = :branchId";
        }
        var nativeQuery = entityManager.createNativeQuery(query);
        if (branchId != null) nativeQuery.setParameter("branchId", branchId);
        Object result = nativeQuery.getSingleResult();
        return ((Number) result).longValue();
    }

    private Double calculateOccupancyRate(UUID branchId) {
        if (branchId == null) return 0.0; // Global occupancy requires summing capacities, keeping it simple for now

        String itemsQuery = "SELECT COUNT(*) FROM equipment_items WHERE branch_id = :branchId " +
                "AND status IN ('AVAILABLE', 'RESERVED', 'MAINTENANCE')";
        String capacityQuery = "SELECT storage_capacity FROM branches WHERE id = :branchId";
        
        var nItems = entityManager.createNativeQuery(itemsQuery).setParameter("branchId", branchId);
        var nCapacity = entityManager.createNativeQuery(capacityQuery).setParameter("branchId", branchId);

        long itemsCount = ((Number) nItems.getSingleResult()).longValue();
        int capacity = ((Number) nCapacity.getSingleResult()).intValue();

        if (capacity == 0) return 0.0;
        return (double) itemsCount / capacity * 100.0;
    }

    private Double calculateDamageRate(UUID branchId) {
        String damagedQuery = "SELECT COUNT(*) FROM equipment_items WHERE (status = 'BROKEN' OR condition = 'DAMAGED')";
        String totalQuery = "SELECT COUNT(*) FROM equipment_items";
        
        if (branchId != null) {
            damagedQuery += " AND branch_id = :branchId";
            totalQuery += " WHERE branch_id = :branchId";
        }
        
        var nDamaged = entityManager.createNativeQuery(damagedQuery);
        var nTotal = entityManager.createNativeQuery(totalQuery);
        if (branchId != null) {
            nDamaged.setParameter("branchId", branchId);
            nTotal.setParameter("branchId", branchId);
        }

        long damaged = ((Number) nDamaged.getSingleResult()).longValue();
        long total = ((Number) nTotal.getSingleResult()).longValue();
        
        if (total == 0) return 0.0;
        return (double) damaged / total * 100.0;
    }

    private List<DashboardStats.TopModel> getTopModels(UUID branchId) {
        String query = "SELECT m.name, COUNT(oi.item_id) as rent_count " +
                "FROM equipment_models m " +
                "JOIN equipment_items i ON i.model_id = m.id " +
                "JOIN order_items oi ON oi.item_id = i.id ";
        if (branchId != null) {
            query += " WHERE i.branch_id = :branchId ";
        }
        query += "GROUP BY m.name " +
                "ORDER BY rent_count DESC LIMIT 5";
        
        var nativeQuery = entityManager.createNativeQuery(query);
        if (branchId != null) nativeQuery.setParameter("branchId", branchId);
        List<Object[]> results = nativeQuery.getResultList();
        
        return results.stream()
                .map(row -> DashboardStats.TopModel.builder()
                        .modelName((String) row[0])
                        .rentalCount(((Number) row[1]).longValue())
                        .build())
                .toList();
    }

    private List<DashboardStats.RevenuePoint> getRevenueTrendLast30Days(UUID branchId) {
        LocalDate start = LocalDate.now().minusDays(29);
        String query = "SELECT date_trunc('day', actual_end_date) as day, COALESCE(SUM(total_price), 0) as amount " +
                "FROM orders " +
                "WHERE status = 'RETURNED' AND actual_end_date >= :start ";
        if (branchId != null) {
            query += " AND branch_start_id = :branchId ";
        }
        query += "GROUP BY day " +
                "ORDER BY day ASC";

        var nativeQuery = entityManager.createNativeQuery(query)
                .setParameter("start", start.atStartOfDay());
        if (branchId != null) nativeQuery.setParameter("branchId", branchId);
        List<Object[]> rows = nativeQuery.getResultList();

        return rows.stream()
                .map(r -> DashboardStats.RevenuePoint.builder()
                        .date(String.valueOf(r[0]))
                        .amount((BigDecimal) r[1])
                        .build())
                .toList();
    }
}
