package com.duwniy.toolsly.dto;

import com.duwniy.toolsly.entity.Condition;
import lombok.Data;
import java.util.Map;
import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;

@Data
public class ReturnRequest {
    @Schema(example = "b1111111-b111-b111-b111-b11111111111")
    private UUID branchId;
    
    @Schema(example = "{\"i1111111-i111-i111-i111-i11111111111\": \"NEW\"}")
    private Map<UUID, Condition> itemConditions;
}
