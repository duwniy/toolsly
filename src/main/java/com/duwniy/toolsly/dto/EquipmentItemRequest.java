package com.duwniy.toolsly.dto;

import com.duwniy.toolsly.entity.Condition;
import com.duwniy.toolsly.entity.ItemStatus;
import lombok.Data;

import java.util.UUID;

@Data
public class EquipmentItemRequest {
    private UUID modelId;
    private UUID branchId;
    private String serialNumber;
    private ItemStatus status;
    private Condition condition;
}
