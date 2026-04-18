package com.duwniy.toolsly.mapper;

import com.duwniy.toolsly.dto.EquipmentItemResponse;
import com.duwniy.toolsly.entity.EquipmentItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EquipmentItemMapper {

    @Mapping(target = "modelId", source = "model.id")
    @Mapping(target = "modelName", source = "model.name")
    @Mapping(target = "branchId", source = "branch.id")
    @Mapping(target = "branchName", source = "branch.name", defaultValue = "At Client / Maintenance")
    @Mapping(target = "categoryName", source = "model.category.name")
    @Mapping(target = "dailyRate", source = "model.baseDailyPrice")
    EquipmentItemResponse toResponse(EquipmentItem entity);
}
