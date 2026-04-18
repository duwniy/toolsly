package com.duwniy.toolsly.controller;

import com.duwniy.toolsly.dto.DashboardStats;
import com.duwniy.toolsly.entity.Role;
import com.duwniy.toolsly.security.ToolslyUserPrincipal;
import com.duwniy.toolsly.service.ReportingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reporting")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Business intelligence and dashboard endpoints")
@Slf4j
public class ReportingController {

    private final ReportingService reportingService;

    @GetMapping("/dashboard-stats")
    @Operation(summary = "Get current business KPIs", description = "Returns revenue, order counts, and top models")
    public ResponseEntity<DashboardStats> getDashboardStats(
            @AuthenticationPrincipal ToolslyUserPrincipal principal,
            @RequestParam(required = false) java.util.UUID branchId
    ) {
        log.info("REST request to get dashboard stats. Branch filter: {}, Principal: {}", branchId, principal != null ? principal.getUsername() : "anonymous");
        java.util.UUID effectiveBranchId = branchId;

        if (principal != null && principal.getRole() == Role.STAFF) {
            // Staff are always scoped to their own branch
            effectiveBranchId = principal.getBranchId();
        }

        return ResponseEntity.ok(reportingService.getDashboardStats(effectiveBranchId));
    }
}
