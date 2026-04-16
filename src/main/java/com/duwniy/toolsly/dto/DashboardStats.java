package com.duwniy.toolsly.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardStats {
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Double averageOccupancy;
    private Double damageRate;
    private List<TopModel> topModels;
    private List<RevenuePoint> revenueTrend;

    @Data
    @Builder
    public static class TopModel {
        private String modelName;
        private Long rentalCount;
    }

    @Data
    @Builder
    public static class RevenuePoint {
        private String date;
        private BigDecimal amount;
    }
}
