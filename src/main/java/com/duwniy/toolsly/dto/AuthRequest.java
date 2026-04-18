package com.duwniy.toolsly.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
    @Schema(example = "vlad_pro@mail.com")
    private String email;
    
    @Schema(example = "password123")
    private String password;
}
