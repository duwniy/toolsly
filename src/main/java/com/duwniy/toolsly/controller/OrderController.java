package com.duwniy.toolsly.controller;

import com.duwniy.toolsly.dto.OrderRequest;
import com.duwniy.toolsly.dto.OrderResponse;
import com.duwniy.toolsly.entity.Order;
import com.duwniy.toolsly.mapper.OrderMapper;
import com.duwniy.toolsly.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Endpoints for tool rental order lifecycle management")
public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;

    @PostMapping
    @Operation(summary = "Create a new rental order", description = "Initializes an order in CREATED status")
    public ResponseEntity<OrderResponse> createOrder(@RequestBody OrderRequest request) {
        Order order = orderMapper.toEntity(request);
        Order saved = orderService.createOrder(order);
        return ResponseEntity.ok(orderMapper.toResponse(saved));
    }

    @PostMapping("/{id}/reserve")
    @Operation(summary = "Reserve tools for the order", description = "Moves order to RESERVED status and applies price calculation")
    public ResponseEntity<Void> reserveOrder(@PathVariable UUID id) {
        orderService.reserveOrder(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details", description = "Returns an order view tailored for issue and return flows")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable UUID id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PostMapping("/{id}/issue")
    @Operation(summary = "Issue tools to the renter", description = "Moves order to ISSUED status. Requires staffId in context.")
    public ResponseEntity<Void> issueOrder(@PathVariable UUID id, @RequestParam UUID staffId) {
        orderService.issueOrder(id, staffId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/return")
    @Operation(summary = "Return tools to a branch", description = "Moves order to RETURNED status and sets actual end date")
    public ResponseEntity<Void> returnOrder(@PathVariable UUID id, @RequestBody com.duwniy.toolsly.dto.ReturnRequest request) {
        orderService.returnOrder(id, request);
        return ResponseEntity.ok().build();
    }
}
