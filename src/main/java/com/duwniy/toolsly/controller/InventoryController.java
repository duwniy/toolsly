package com.duwniy.toolsly.controller;

import com.duwniy.toolsly.dto.EquipmentItemResponse;
import com.duwniy.toolsly.entity.Branch;
import com.duwniy.toolsly.entity.EquipmentItem;
import com.duwniy.toolsly.mapper.EquipmentItemMapper;
import com.duwniy.toolsly.repository.BranchRepository;
import com.duwniy.toolsly.repository.EquipmentItemRepository;
import com.duwniy.toolsly.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Endpoints for managing tools, branches, and availability")
public class InventoryController {

    private final InventoryService inventoryService;
    private final EquipmentItemRepository itemRepository;
    private final BranchRepository branchRepository;
    private final EquipmentItemMapper itemMapper;

    @GetMapping("/items")
    @Operation(summary = "List all equipment items", description = "Filter by branch or status (internal use)")
    public ResponseEntity<List<EquipmentItemResponse>> getAllItems() {
        List<EquipmentItem> items = itemRepository.findAll();
        return ResponseEntity.ok(items.stream().map(itemMapper::toResponse).toList());
    }

    @GetMapping("/branches")
    @Operation(summary = "Get all branches", description = "Returns active branches for starting/ending rentals")
    public ResponseEntity<List<Branch>> getAllBranches() {
        return ResponseEntity.ok(branchRepository.findAll());
    }
}
