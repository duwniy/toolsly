package com.duwniy.toolsly.controller;

import com.duwniy.toolsly.dto.DashboardStats;
import com.duwniy.toolsly.service.ReportingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reporting")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Business intelligence and dashboard endpoints")
public class ReportingController {

    private final ReportingService reportingService;

    @GetMapping("/dashboard-stats")
    @Operation(summary = "Get current business KPIs", description = "Returns revenue, order counts, and top models")
    public ResponseEntity<DashboardStats> getDashboardStats(@org.springframework.web.bind.annotation.RequestParam(required = false) java.util.UUID branchId) {
        return ResponseEntity.ok(reportingService.getDashboardStats(branchId));
    }
}
