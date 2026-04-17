package com.duwniy.toolsly.dto;

import com.duwniy.toolsly.entity.Condition;
import com.duwniy.toolsly.entity.ItemStatus;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class EquipmentItemResponse {
    private UUID id;
    private UUID modelId;
    private String modelName;
    private UUID branchId;
    private String branchName;
    private String categoryName;
    private java.math.BigDecimal dailyRate;
    private String serialNumber;
    private ItemStatus status;
    private Condition condition;
    private OffsetDateTime reservedUntil;
}
