package com.duwniy.toolsly.service;

import com.duwniy.toolsly.dto.AuthRequest;
import com.duwniy.toolsly.dto.AuthResponse;
import com.duwniy.toolsly.repository.UserRepository;
import com.duwniy.toolsly.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse authenticate(AuthRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException ex) {
            userRepository.findByEmail(request.getEmail()).ifPresentOrElse(
                    user -> log.warn("Auth failed for email={} (userExists=true, storedHashPresent={}, matches={})",
                            request.getEmail(),
                            user.getPassword() != null && !user.getPassword().isBlank(),
                            user.getPassword() != null && passwordEncoder.matches(request.getPassword(), user.getPassword())
                    ),
                    () -> log.warn("Auth failed for email={} (userExists=false)", request.getEmail())
            );
            throw ex;
        }

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user);
        log.info("User successfully authenticated: email={}, role={}", user.getEmail(), user.getRole());
        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole())
                .branchId(user.getBranch() != null ? user.getBranch().getId() : null)
                .build();
    }
}
