package com.duwniy.toolsly.dto;

import com.duwniy.toolsly.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Current user profile information")
public class UserProfileResponse {

    @Schema(example = "e1f82c42-b35e-49b8-a619-3c82d5a73214")
    private UUID userId;

    @Schema(example = "alexey.smirnov@toolsly.com")
    private String email;

    @Schema(example = "STAFF")
    private Role role;

    @Schema(example = "true")
    private boolean verified;

    @Schema(example = "6b3f7f09-1db7-4c45-9854-526b701bc3b3")
    private UUID branchId;

    @Schema(example = "Склад Сокольники (Центр)")
    private String branchName;
}
