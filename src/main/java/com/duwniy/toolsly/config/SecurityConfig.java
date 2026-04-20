package com.duwniy.toolsly.config;

import com.duwniy.toolsly.dto.ErrorResponse;
import com.duwniy.toolsly.security.JwtAuthenticationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.Customizer;

import java.io.IOException;
import java.time.OffsetDateTime;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;
    private final ObjectMapper objectMapper;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/api/auth/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/api/health"
                        ).permitAll()
                        .requestMatchers("/api/reporting/**").hasAnyRole("STAFF", "ADMIN")
                        .requestMatchers("/api/users/**").authenticated()
                        .requestMatchers("/api/inventory/**").hasAnyRole("STAFF", "ADMIN", "RENTER")
                        .requestMatchers(HttpMethod.POST, "/api/orders").hasRole("RENTER")
                        .requestMatchers("/api/orders/ready-to-issue").hasRole("STAFF")
                        .requestMatchers("/api/orders/returned").hasRole("STAFF")
                        .requestMatchers("/api/orders/my").hasAnyRole("STAFF", "RENTER")
                        .requestMatchers("/api/orders/*/reserve").hasRole("STAFF")
                        .requestMatchers("/api/orders/*/issue").hasRole("STAFF")
                        .requestMatchers("/api/orders/*/return").hasRole("STAFF")
                        .requestMatchers("/api/orders/*/request-return").hasAnyRole("STAFF", "RENTER")
                        .requestMatchers("/api/orders/**").hasAnyRole("STAFF", "RENTER")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            ErrorResponse error = new ErrorResponse(
                                    HttpStatus.UNAUTHORIZED.value(),
                                    "Unauthorized",
                                    OffsetDateTime.now(),
                                    "AUTH_REQUIRED"
                            );
                            writeErrorResponse(response, error, HttpStatus.UNAUTHORIZED);
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            ErrorResponse error = new ErrorResponse(
                                    HttpStatus.FORBIDDEN.value(),
                                    "Access denied",
                                    OffsetDateTime.now(),
                                    "ACCESS_DENIED"
                            );
                            writeErrorResponse(response, error, HttpStatus.FORBIDDEN);
                        })
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .cors(Customizer.withDefaults());

        return http.build();
    }



    private void writeErrorResponse(jakarta.servlet.http.HttpServletResponse response,
                                    ErrorResponse error,
                                    HttpStatus status) throws IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        response.getWriter().write(objectMapper.writeValueAsString(error));
    }
}
