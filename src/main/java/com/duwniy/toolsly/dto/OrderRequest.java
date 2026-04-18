package com.duwniy.toolsly.dto;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

@Data
public class OrderRequest {
    @Schema(example = "u1111111-u111-u111-u111-u11111111111")
    private UUID renterId;
    
    @Schema(example = "b1111111-b111-b111-b111-b11111111111")
    private UUID branchStartId;
    
    @Schema(example = "2026-12-31T23:59:59Z")
    private OffsetDateTime plannedEndDate;
}
