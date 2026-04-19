package com.duwniy.toolsly.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class UserFinancesResponse {
    private BigDecimal totalSpent;
    private BigDecimal activeRentalsCost;
    private BigDecimal potentialFines;
    private List<OrderSummary> recentPayments;

    @Data
    @Builder
    public static class OrderSummary {
        private String id;
        private String toolName;
        private String startDate;
        private String endDate;
        private BigDecimal finalPrice;
        private String status;
    }
}
