package com.duwniy.toolsly.mapper;

import com.duwniy.toolsly.dto.OrderRequest;
import com.duwniy.toolsly.dto.OrderResponse;
import com.duwniy.toolsly.entity.EquipmentItem;
import com.duwniy.toolsly.entity.EquipmentModel;
import com.duwniy.toolsly.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "renterId", source = "renter.id")
    @Mapping(target = "renterEmail", source = "renter.email")
    @Mapping(target = "staffId", source = "staff.id")
    @Mapping(target = "staffEmail", source = "staff.email")
    @Mapping(target = "branchStartId", source = "branchStart.id")
    @Mapping(target = "branchStartName", source = "branchStart.name")
    @Mapping(target = "branchEndName", source = "branchEnd.name")
    @Mapping(target = "targetBranchId", source = "targetBranch.id")
    @Mapping(target = "targetBranchName", source = "targetBranch.name")
    OrderResponse toResponse(Order entity);

    @Mapping(target = "renter.id", source = "renterId")
    @Mapping(target = "branchStart.id", source = "branchStartId")
    Order toEntity(OrderRequest request);

    OrderResponse.OrderItemSummary toItemSummary(EquipmentItem item);

    OrderResponse.ModelSummary toModelSummary(EquipmentModel model);
}
