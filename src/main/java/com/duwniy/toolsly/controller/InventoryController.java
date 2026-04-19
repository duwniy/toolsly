package com.duwniy.toolsly.controller;

import com.duwniy.toolsly.dto.EquipmentItemResponse;
import com.duwniy.toolsly.entity.Branch;
import com.duwniy.toolsly.entity.EquipmentItem;
import com.duwniy.toolsly.entity.Role;
import com.duwniy.toolsly.mapper.EquipmentItemMapper;
import com.duwniy.toolsly.repository.BranchRepository;
import com.duwniy.toolsly.repository.EquipmentItemRepository;
import com.duwniy.toolsly.security.ToolslyUserPrincipal;
import com.duwniy.toolsly.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.duwniy.toolsly.repository.AuditLogRepository;
import com.duwniy.toolsly.dto.ItemHistoryResponse;
import java.time.OffsetDateTime;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/inventory")
@Tag(name = "Inventory", description = "Endpoints for managing tools, branches, and availability")
public class InventoryController {

    private static final Logger log = LoggerFactory.getLogger(InventoryController.class);

    private final InventoryService inventoryService;
    private final EquipmentItemRepository itemRepository;
    private final BranchRepository branchRepository;
    private final EquipmentItemMapper itemMapper;
    private final AuditLogRepository auditLogRepository;

    public InventoryController(InventoryService inventoryService,
                               EquipmentItemRepository itemRepository,
                               BranchRepository branchRepository,
                               EquipmentItemMapper itemMapper,
                               AuditLogRepository auditLogRepository) {
        this.inventoryService = inventoryService;
        this.itemRepository = itemRepository;
        this.branchRepository = branchRepository;
        this.itemMapper = itemMapper;
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping("/items")
    @Operation(summary = "List equipment items", description = "Filter by branch or status")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<List<EquipmentItemResponse>> getAllItems(
            @AuthenticationPrincipal ToolslyUserPrincipal principal,
            @RequestParam(required = false) UUID branchId
    ) {
        try {
            List<EquipmentItem> items;
            UUID effectiveBranchId = branchId;

            if (principal != null && principal.getRole() == Role.STAFF && principal.getBranchId() != null) {
                effectiveBranchId = principal.getBranchId();
            }

            log.info("REST request to get inventory items. Branch filter: {}, Principal: {}", 
                effectiveBranchId,
                principal != null ? principal.getUsername() : "anonymous");

            if (effectiveBranchId != null) {
                items = itemRepository.findByBranchIdWithDetails(effectiveBranchId);
            } else {
                items = itemRepository.findAllWithDetails();
            }
            return ResponseEntity.ok(items.stream().map(itemMapper::toResponse).toList());
        } catch (Exception e) {
            log.error("Error fetching inventory items: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/branches")
    @Operation(summary = "Get all branches", description = "Returns active branches for starting/ending rentals")
    public ResponseEntity<List<Branch>> getAllBranches() {
        log.info("REST request to get all branches");
        return ResponseEntity.ok(branchRepository.findAll());
    }

    @PostMapping("/items/{itemId}/maintenance/complete")
    @Operation(summary = "Complete maintenance", description = "Returns item to AVAILABLE status and resets rental days counter")
    public ResponseEntity<Void> completeMaintenance(@PathVariable UUID itemId) {
        log.info("REST request to complete maintenance for item: {}", itemId);
        inventoryService.completeMaintenance(itemId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/items/{id}/history")
    @Operation(summary = "Get item condition history", description = "Returns timeline of condition changes from audit logs")
    public ResponseEntity<List<com.duwniy.toolsly.dto.ItemHistoryResponse>> getItemHistory(@PathVariable UUID id) {
        log.info("REST request to get history for item: {}", id);
        List<com.duwniy.toolsly.dto.ItemHistoryResponse> history = auditLogRepository.findByEntityNameAndEntityIdOrderByTimestampDesc("EquipmentItem", id)
                .stream()
                .filter(log -> "CONDITION_CHANGE".equals(log.getAction()))
                .map(log -> com.duwniy.toolsly.dto.ItemHistoryResponse.builder()
                        .timestamp(log.getTimestamp())
                        .oldCondition((String) log.getOldValue().get("condition"))
                        .newCondition((String) log.getNewValue().get("condition"))
                        .staffName((String) log.getNewValue().get("staffName"))
                        .comment((String) log.getNewValue().get("comment"))
                        .build())
                .toList();
        return ResponseEntity.ok(history);
    }
}
