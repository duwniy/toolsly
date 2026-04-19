package com.duwniy.toolsly.dto;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

public class QuoteRequest {
    private UUID modelId;
    private OffsetDateTime startDate;
    private OffsetDateTime endDate;
    private UUID branchId;

    public UUID getModelId() { return modelId; }
    public OffsetDateTime getStartDate() { return startDate; }
    public OffsetDateTime getEndDate() { return endDate; }
    public UUID getBranchId() { return branchId; }

    public void setModelId(UUID modelId) { this.modelId = modelId; }
    public void setStartDate(OffsetDateTime startDate) { this.startDate = startDate; }
    public void setEndDate(OffsetDateTime endDate) { this.endDate = endDate; }
    public void setBranchId(UUID branchId) { this.branchId = branchId; }
}
