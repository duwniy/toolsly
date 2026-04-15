package com.duwniy.toolsly.service;

import com.duwniy.toolsly.dto.DashboardStats;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private final EntityManager entityManager;

    public DashboardStats getDashboardStats() {
        return DashboardStats.builder()
                .monthlyRevenue(calculateMonthlyRevenue())
                .totalOrders(countMonthlyOrders())
                .damageRate(calculateDamageRate())
                .topModels(getTopModels())
                .build();
    }

    private BigDecimal calculateMonthlyRevenue() {
        Object result = entityManager.createNativeQuery(
                "SELECT SUM(total_price) FROM orders WHERE status = 'RETURNED' " +
                "AND actual_end_date >= date_trunc('month', now())")
                .getSingleResult();
        return result != null ? (BigDecimal) result : BigDecimal.ZERO;
    }

    private Long countMonthlyOrders() {
        Object result = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM orders WHERE actual_end_date >= date_trunc('month', now())")
                .getSingleResult();
        return ((Number) result).longValue();
    }

    private Double calculateDamageRate() {
        Object damaged = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM equipment_items WHERE condition = 'DAMAGED'")
                .getSingleResult();
        Object total = entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM equipment_items")
                .getSingleResult();
        
        long t = ((Number) total).longValue();
        if (t == 0) return 0.0;
        return (((Number) damaged).doubleValue() / t) * 100;
    }

    private Map<String, Long> getTopModels() {
        List<Object[]> results = entityManager.createNativeQuery(
                "SELECT m.name, COUNT(oi.item_id) as rent_count " +
                "FROM equipment_models m " +
                "JOIN equipment_items i ON i.model_id = m.id " +
                "JOIN order_items oi ON oi.item_id = i.id " +
                "GROUP BY m.name " +
                "ORDER BY rent_count DESC LIMIT 5")
                .getResultList();
        
        Map<String, Long> topModels = new HashMap<>();
        for (Object[] row : results) {
            topModels.put((String) row[0], ((Number) row[1]).longValue());
        }
        return topModels;
    }
}
