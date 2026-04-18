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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Endpoints for managing tools, branches, and availability")
@Slf4j
public class InventoryController {

    private final InventoryService inventoryService;
    private final EquipmentItemRepository itemRepository;
    private final BranchRepository branchRepository;
    private final EquipmentItemMapper itemMapper;

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

            // For STAFF with an assigned branch, scope results to their branch
            if (principal != null && principal.getRole() == Role.STAFF && principal.getBranchId() != null) {
                effectiveBranchId = principal.getBranchId();
            }

            log.info("REST request to get inventory items. Branch filter: {}, Principal: {}", 
                effectiveBranchId,
                principal != null ? principal.getUsername() : "anonymous");

            // If we have a branch filter, apply it; otherwise return all items
            // Using WithDetails queries with LEFT JOIN to eagerly and safely load relationships
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
}
