package com.duwniy.toolsly.service;

import com.duwniy.toolsly.dto.DashboardStats;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private final EntityManager entityManager;

    public DashboardStats getDashboardStats(java.util.UUID branchId) {
        return DashboardStats.builder()
                .totalRevenue(calculateMonthlyRevenue(branchId))
                .totalOrders(countMonthlyOrders(branchId))
                .averageOccupancy(calculateAverageOccupancy(branchId))
                .damageRate(calculateDamageRate(branchId))
                .topModels(getTopModels(branchId))
                .revenueTrend(getRevenueTrendLast30Days(branchId))
                .build();
    }

    private BigDecimal calculateMonthlyRevenue(java.util.UUID branchId) {
        String query = "SELECT SUM(total_price) FROM orders WHERE status = 'RETURNED' " +
                "AND actual_end_date >= date_trunc('month', now())";
        if (branchId != null) {
            query += " AND branch_start_id = :branchId";
        }
        var nativeQuery = entityManager.createNativeQuery(query);
        if (branchId != null) nativeQuery.setParameter("branchId", branchId);
        Object result = nativeQuery.getSingleResult();
        return result != null ? (BigDecimal) result : BigDecimal.ZERO;
    }

    private Long countMonthlyOrders(java.util.UUID branchId) {
        String query = "SELECT COUNT(*) FROM orders WHERE actual_end_date >= date_trunc('month', now())";
        if (branchId != null) {
            query += " AND branch_start_id = :branchId";
        }
        var nativeQuery = entityManager.createNativeQuery(query);
        if (branchId != null) nativeQuery.setParameter("branchId", branchId);
        Object result = nativeQuery.getSingleResult();
        return ((Number) result).longValue();
    }

    private Double calculateAverageOccupancy(java.util.UUID branchId) {
        String rentedQuery = "SELECT COUNT(*) FROM equipment_items WHERE status = 'RENTED'";
        String totalQuery = "SELECT COUNT(*) FROM equipment_items";
        if (branchId != null) {
            rentedQuery += " AND branch_id = :branchId";
            totalQuery += " WHERE branch_id = :branchId";
        }
        
        var nRented = entityManager.createNativeQuery(rentedQuery);
        var nTotal = entityManager.createNativeQuery(totalQuery);
        if (branchId != null) {
            nRented.setParameter("branchId", branchId);
            nTotal.setParameter("branchId", branchId);
        }

        Object rented = nRented.getSingleResult();
        Object total = nTotal.getSingleResult();

        long t = ((Number) total).longValue();
        if (t == 0) return 0.0;
        return (((Number) rented).doubleValue() / t) * 100;
    }

    private Double calculateDamageRate(java.util.UUID branchId) {
        String damagedQuery = "SELECT COUNT(*) FROM equipment_items WHERE condition = 'DAMAGED'";
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

        Object damaged = nDamaged.getSingleResult();
        Object total = nTotal.getSingleResult();
        
        long t = ((Number) total).longValue();
        if (t == 0) return 0.0;
        return (((Number) damaged).doubleValue() / t) * 100;
    }

    private List<DashboardStats.TopModel> getTopModels(java.util.UUID branchId) {
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

    private List<DashboardStats.RevenuePoint> getRevenueTrendLast30Days(java.util.UUID branchId) {
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
