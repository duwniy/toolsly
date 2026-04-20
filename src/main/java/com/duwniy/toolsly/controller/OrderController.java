package com.duwniy.toolsly.controller;

import com.duwniy.toolsly.dto.*;
import com.duwniy.toolsly.entity.Order;
import com.duwniy.toolsly.repository.OrderRepository;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.UUID;
import java.util.Collection;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Endpoints for tool rental order lifecycle management")
@RequiredArgsConstructor
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;
    private final OrderMapper orderMapper;
    private final PricingEngineService pricingEngine;
    private final EquipmentModelRepository modelRepository;
    private final OrderRepository orderRepository;

    @PostMapping("/calculate-quote")
    @Operation(summary = "Calculate order price breakdown", description = "Returns base price, markups, and discounts")
    public ResponseEntity<PriceQuote> calculateQuote(@RequestBody QuoteRequest request) {
        log.info("REST request to calculate order price quote for model: {}", request.getModelId());
        EquipmentModel model = modelRepository.findById(request.getModelId())
                .orElseThrow(() -> new BusinessException("Model not found", "MODEL_NOT_FOUND"));
        return ResponseEntity.ok(pricingEngine.calculatePrice(model, request.getStartDate(), request.getEndDate()));
    }

    @PostMapping("/wizard-reserve")
    @Operation(summary = "Start rental flow from wizard", description = "Finds available item, locks it for 15m, and creates order")
    public ResponseEntity<OrderResponse> wizardReserve(@RequestBody QuoteRequest request) {
        log.info("REST request to wizard-reserve tools for model: {}, branch: {}", request.getModelId(), request.getBranchId());
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
        log.info("REST request to create a new rental order");
        Order order = orderMapper.toEntity(request);
        Order saved = orderService.createOrder(order);
        return ResponseEntity.ok(orderMapper.toResponse(saved));
    }

    @PostMapping("/{id}/reserve")
    @Operation(summary = "Reserve tools for the order", description = "Moves order to RESERVED status and applies price calculation")
    public ResponseEntity<Void> reserveOrder(@PathVariable UUID id) {
        log.info("REST request to reserve tools for order ID: {}", id);
        orderService.reserveOrder(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details", description = "Returns an order view tailored for issue and return flows")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable UUID id) {
        log.info("REST request to get order details for ID: {}", id);
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PostMapping("/{id}/issue")
    @PreAuthorize("hasRole('STAFF')")
    @Operation(summary = "Выдача инструментов клиенту (требуется верификация для дорогих позиций)", description = "Moves order to ISSUED status. Requires staffId.")
    public ResponseEntity<Void> issueOrder(@PathVariable UUID id, @RequestParam UUID staffId) {
        log.info("REST request to issue tools for order ID: {}, staff ID: {}", id, staffId);
        orderService.issueOrder(id, staffId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/return")
    @PreAuthorize("hasRole('STAFF')")
    @Operation(summary = "Прием инструментов и автоматический расчет штрафов за повреждения", description = "Moves order to RETURNED status and sets actual end date")
    public ResponseEntity<Void> returnOrder(@PathVariable UUID id, @RequestBody ReturnRequest request) {
        log.info("REST request to return tools for order ID: {}", id);
        orderService.returnOrder(id, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's order history", description = "Returns all orders where the authenticated user is the renter")
    public ResponseEntity<java.util.List<OrderResponse>> getMyOrders() {
        log.info("REST request to get current user's orders");
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID renterId = null;
        if (auth != null && auth.getPrincipal() instanceof ToolslyUserPrincipal principal) {
            renterId = principal.getUserId();
        } else {
            throw new BusinessException("User must be authenticated", "AUTH_REQUIRED");
        }
        return ResponseEntity.ok(orderService.getOrdersByRenter(renterId));
    }

    @PatchMapping("/{id}/request-return")
    @Operation(summary = "Initial return request by user", description = "Moves order to RETURN_PENDING status and validates branch capacity")
    public ResponseEntity<Void> requestReturn(@PathVariable UUID id, @RequestBody RequestReturnRequest request) {
        log.info("Return requested for order {} to branch {}", id, request.getTargetBranchId());
        orderService.requestReturn(id, request.getTargetBranchId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/finances")
    @Operation(summary = "Get current user's financial overview", description = "Returns total spent, active costs, and potential fines")
    public ResponseEntity<UserFinancesResponse> getUserFinances() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof ToolslyUserPrincipal principal) {
            return ResponseEntity.ok(orderService.getUserFinances(principal.getUserId()));
        }
        throw new BusinessException("User must be authenticated", "AUTH_REQUIRED");
    }

    @GetMapping("/returned")
    @Operation(summary = "Get recent returns", description = "Returns last 20 orders returned to the branch")
    public ResponseEntity<java.util.List<OrderResponse>> getReturnedOrders(
            @RequestParam UUID branchId
    ) {
        log.info("REST request to get recent returns for branch: {}", branchId);
        java.util.List<com.duwniy.toolsly.entity.OrderStatus> returnStatuses = java.util.List.of(
                com.duwniy.toolsly.entity.OrderStatus.RETURNED,
                com.duwniy.toolsly.entity.OrderStatus.CLOSED
        );
        return ResponseEntity.ok(orderRepository.findTop20ByBranchEndIdAndStatusInOrderByActualEndDateDesc(branchId, returnStatuses)
                .stream()
                .map(orderMapper::toResponse)
                .toList());
    }

    @GetMapping("/reserved")
    @Operation(summary = "Get active reservations", description = "Returns active RESERVED orders for the branch")
    public ResponseEntity<java.util.List<OrderResponse>> getReservedOrders(
            @RequestParam UUID branchId
    ) {
        log.info("REST request to get active reserved orders for branch: {}", branchId);
        java.util.List<com.duwniy.toolsly.entity.OrderStatus> reservedStatuses = java.util.List.of(
                com.duwniy.toolsly.entity.OrderStatus.RESERVED
        );
        return ResponseEntity.ok(orderRepository.findTop20ByBranchStartIdAndStatusInOrderByCreatedAtDesc(branchId, reservedStatuses)
                .stream()
                .map(orderMapper::toResponse)
                .toList());
    }

    @GetMapping("/ready-to-issue")
    @PreAuthorize("hasRole('STAFF')")
    @Operation(summary = "Get orders ready to issue", description = "Returns all RESERVED orders for the authenticated staff member's branch")
    public ResponseEntity<java.util.List<OrderResponse>> getReadyToIssueOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof ToolslyUserPrincipal principal)) {
            throw new BusinessException("User must be authenticated", "AUTH_REQUIRED");
        }
        UUID branchId = principal.getBranchId();
        if (branchId == null) {
            throw new BusinessException("Staff must be assigned to a branch", "NO_BRANCH");
        }
        log.info("REST request to get ready-to-issue orders for staff branch: {}", branchId);
        java.util.List<com.duwniy.toolsly.entity.OrderStatus> reservedStatuses = java.util.List.of(
                com.duwniy.toolsly.entity.OrderStatus.RESERVED
        );
        return ResponseEntity.ok(orderRepository.findTop20ByBranchStartIdAndStatusInOrderByCreatedAtDesc(branchId, reservedStatuses)
                .stream()
                .map(orderMapper::toResponse)
                .toList());
    }
}
