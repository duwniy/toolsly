package com.duwniy.toolsly.dto;

import com.duwniy.toolsly.entity.Condition;
import lombok.Data;
import java.util.Map;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

public class ReturnRequest {
    @Schema(example = "b1111111-b111-b111-b111-b11111111111")
    private UUID branchId;
    
    @Schema(example = "{\"i1111111-i111-i111-i111-i11111111111\": \"NEW\"}")
    private Map<UUID, Condition> itemConditions;

    @Schema(example = "Customer dropped the tool.")
    private String staffComment;

    private Boolean isIncident;

    public UUID getBranchId() { return branchId; }
    public Map<UUID, Condition> getItemConditions() { return itemConditions; }
    public String getStaffComment() { return staffComment; }
    public Boolean getIsIncident() { return isIncident; }

    public void setBranchId(UUID branchId) { this.branchId = branchId; }
    public void setItemConditions(Map<UUID, Condition> itemConditions) { this.itemConditions = itemConditions; }
    public void setStaffComment(String staffComment) { this.staffComment = staffComment; }
    public void setIsIncident(Boolean isIncident) { this.isIncident = isIncident; }
}
