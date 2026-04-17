package com.duwniy.toolsly.dto;

import com.duwniy.toolsly.entity.Condition;
import com.duwniy.toolsly.entity.OrderStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class OrderResponse {
    private UUID id;
    private UUID renterId;
    private String renterEmail;
    private UUID staffId;
    private String staffEmail;
    private OrderStatus status;
    private BigDecimal totalPrice;
    private OffsetDateTime plannedEndDate;
    private OffsetDateTime actualEndDate;
    private UUID branchStartId;
    private String branchStartName;
    private UUID branchEndId;
    private String branchEndName;
    private List<OrderItemSummary> items;

    @Data
    public static class OrderItemSummary {
        private UUID id;
        private String serialNumber;
        private Condition condition;
        private ModelSummary model;
    }

    @Data
    public static class ModelSummary {
        private String name;
        private BigDecimal marketValue;
    }
}
