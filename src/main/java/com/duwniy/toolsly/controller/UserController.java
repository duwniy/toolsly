package com.duwniy.toolsly.controller;

import com.duwniy.toolsly.dto.UserProfileResponse;
import com.duwniy.toolsly.entity.User;
import com.duwniy.toolsly.repository.UserRepository;
import com.duwniy.toolsly.security.ToolslyUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Endpoints for user profile management")
@Slf4j
public class UserController {

    private final UserRepository userRepository;
    private final com.duwniy.toolsly.service.OrderService orderService;

    @GetMapping("/me/finances")
    @Operation(summary = "Get current user's financial overview",
               description = "Returns calculated stats for total spent, active rental debt, and recent payments")
    public ResponseEntity<com.duwniy.toolsly.dto.UserFinancesResponse> getMyFinances(
            @AuthenticationPrincipal ToolslyUserPrincipal principal
    ) {
        log.info("REST request to get finances for user ID: {}", principal.getUserId());
        return ResponseEntity.ok(orderService.getUserFinances(principal.getUserId()));
    }

    @GetMapping("/me/stats")
    @Operation(summary = "Get user stats", description = "Returns basic stats for the profile page")
    public ResponseEntity<java.util.Map<String, Object>> getMyStats(
            @AuthenticationPrincipal ToolslyUserPrincipal principal
    ) {
        log.info("REST request to get stats for user ID: {}", principal.getUserId());
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        
        try {
            com.duwniy.toolsly.dto.UserFinancesResponse finances = orderService.getUserFinances(principal.getUserId());
            stats.put("totalOrders", finances.getRecentPayments() != null ? finances.getRecentPayments().size() : 0);
            stats.put("activeOrders", 0);
            stats.put("totalSpent", finances.getTotalSpent());
        } catch (Exception e) {
            log.error("Error fetching finances for stats", e);
            stats.put("totalOrders", 0);
            stats.put("activeOrders", 0);
            stats.put("totalSpent", 0);
        }
        
        User user = userRepository.findById(principal.getUserId()).orElse(null);
        if (user != null && user.getCreatedAt() != null) {
             stats.put("memberSince", user.getCreatedAt().toString());
        } else {
             stats.put("memberSince", java.time.OffsetDateTime.now().toString());
        }
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile",
               description = "Returns full profile info extracted from JWT: email, role, verified status, and branch details")
    public ResponseEntity<UserProfileResponse> getCurrentUser(
            @AuthenticationPrincipal ToolslyUserPrincipal principal
    ) {
        log.info("REST request to get profile for user ID: {}", principal.getUserId());
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileResponse profile = UserProfileResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .verified(user.isVerified())
                .branchId(user.getBranch() != null ? user.getBranch().getId() : null)
                .branchName(user.getBranch() != null ? user.getBranch().getName() : null)
                .build();

        return ResponseEntity.ok(profile);
    }
}
