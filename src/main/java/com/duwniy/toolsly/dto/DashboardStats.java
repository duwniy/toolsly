package com.duwniy.toolsly.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class DashboardStats {
    private BigDecimal monthlyRevenue;
    private Long totalOrders;
    private Double damageRate;
    private Map<String, Long> topModels;
}
