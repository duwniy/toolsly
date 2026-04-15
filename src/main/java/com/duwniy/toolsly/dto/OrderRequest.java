package com.duwniy.toolsly.dto;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class OrderRequest {
    private UUID renterId;
    private UUID branchStartId;
    private OffsetDateTime plannedEndDate;
}
