package com.duwniy.toolsly.controller;

import com.duwniy.toolsly.dto.*;
import com.duwniy.toolsly.entity.Order;
import com.duwniy.toolsly.mapper.OrderMapper;
import com.duwniy.toolsly.service.OrderService;
import com.duwniy.toolsly.service.PricingEngineService;
import com.duwniy.toolsly.repository.EquipmentModelRepository;
import com.duwniy.toolsly.entity.EquipmentModel;
import com.duwniy.toolsly.exception.BusinessException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import com.duwniy.toolsly.security.ToolslyUserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Endpoints for tool rental order lifecycle management")
public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;
    private final PricingEngineService pricingEngine;
    private final EquipmentModelRepository modelRepository;

    @PostMapping("/calculate-quote")
    @Operation(summary = "Calculate order price breakdown", description = "Returns base price, markups, and discounts")
    public ResponseEntity<PriceQuote> calculateQuote(@RequestBody QuoteRequest request) {
        EquipmentModel model = modelRepository.findById(request.getModelId())
                .orElseThrow(() -> new BusinessException("Model not found", "MODEL_NOT_FOUND"));
        return ResponseEntity.ok(pricingEngine.calculatePrice(model, request.getStartDate(), request.getEndDate()));
    }

    @PostMapping("/wizard-reserve")
    @Operation(summary = "Start rental flow from wizard", description = "Finds available item, locks it for 15m, and creates order")
    public ResponseEntity<OrderResponse> wizardReserve(@RequestBody QuoteRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID renterId = null;
        if (auth != null && auth.getPrincipal() instanceof ToolslyUserPrincipal principal) {
            renterId = principal.getUserId();
        } else {
            throw new BusinessException("User must be authenticated", "AUTH_REQUIRED");
        }

        Order saved = orderService.createOrderFromModel(
                renterId,
                request.getModelId(),
                request.getBranchId(),
                request.getEndDate());
        return ResponseEntity.ok(orderMapper.toResponse(saved));
    }

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
    @Operation(summary = "Выдача инструментов клиенту (требуется верификация для дорогих позиций)", description = "Moves order to ISSUED status. Requires staffId.")
    public ResponseEntity<Void> issueOrder(@PathVariable UUID id, @RequestParam UUID staffId) {
        orderService.issueOrder(id, staffId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/return")
    @Operation(summary = "Прием инструментов и автоматический расчет штрафов за повреждения", description = "Moves order to RETURNED status and sets actual end date")
    public ResponseEntity<Void> returnOrder(@PathVariable UUID id, @RequestBody ReturnRequest request) {
        orderService.returnOrder(id, request);
        return ResponseEntity.ok().build();
    }
}
