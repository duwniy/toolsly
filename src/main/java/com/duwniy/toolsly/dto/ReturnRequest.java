package com.duwniy.toolsly.dto;

import com.duwniy.toolsly.entity.Condition;
import lombok.Data;
import java.util.Map;
import java.util.UUID;

@Data
public class ReturnRequest {
    private UUID branchId;
    private Map<UUID, Condition> itemConditions;
}
