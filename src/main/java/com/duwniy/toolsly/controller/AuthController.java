package com.duwniy.toolsly.controller;

import com.duwniy.toolsly.dto.AuthRequest;
import com.duwniy.toolsly.dto.AuthResponse;
import com.duwniy.toolsly.service.AuthenticationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user login and token management")
@Slf4j
public class AuthController {

    private final AuthenticationService service;

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and return JWT")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody AuthRequest request) {
        log.info("REST request to authenticate user: {}", request.getEmail());
        return ResponseEntity.ok(service.authenticate(request));
    }
}
