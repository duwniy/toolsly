package com.duwniy.toolsly.controller;

import com.duwniy.toolsly.entity.EquipmentModel;
import com.duwniy.toolsly.repository.EquipmentModelRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
@Tag(name = "Catalog", description = "Public endpoints for browsing the tool catalog")
@Slf4j
public class CatalogController {

    private final EquipmentModelRepository modelRepository;

    @GetMapping("/models")
    @Operation(summary = "Get all equipment models", description = "Returns a list of all models with their base prices")
    public ResponseEntity<List<EquipmentModel>> getAllModels() {
        log.info("REST request to get all equipment models");
        return ResponseEntity.ok(modelRepository.findAll());
    }

    @GetMapping("/models/{id}")
    @Operation(summary = "Get model details by ID", description = "Returns full details including specifications")
    public ResponseEntity<EquipmentModel> getModelById(@PathVariable UUID id) {
        log.info("REST request to get model details for ID: {}", id);
        return modelRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
