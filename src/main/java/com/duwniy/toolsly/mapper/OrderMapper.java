package com.duwniy.toolsly.mapper;

import com.duwniy.toolsly.dto.OrderRequest;
import com.duwniy.toolsly.dto.OrderResponse;
import com.duwniy.toolsly.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "renterId", source = "renter.id")
    @Mapping(target = "renterEmail", source = "renter.email")
    @Mapping(target = "staffId", source = "staff.id")
    OrderResponse toResponse(Order entity);

    @Mapping(target = "renter.id", source = "renterId")
    @Mapping(target = "branchStart.id", source = "branchStartId")
    Order toEntity(OrderRequest request);
}
