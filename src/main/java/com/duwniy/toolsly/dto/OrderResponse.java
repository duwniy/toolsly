package com.duwniy.toolsly.dto;

import com.duwniy.toolsly.entity.OrderStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class OrderResponse {
    private UUID id;
    private UUID renterId;
    private String renterEmail;
    private UUID staffId;
    private OrderStatus status;
    private BigDecimal totalPrice;
    private OffsetDateTime plannedEndDate;
    private OffsetDateTime actualEndDate;
}
