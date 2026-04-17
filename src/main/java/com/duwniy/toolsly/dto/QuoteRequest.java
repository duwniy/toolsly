package com.duwniy.toolsly.dto;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class QuoteRequest {
    private UUID modelId;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private UUID branchId;
}
