package com.skillinfinity.admin.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Admin user response")
public class AdminUserResponse {

    @Schema(description = "Admin ID")
    private UUID id;

    @Schema(description = "User ID")
    private UUID userId;

    @Schema(description = "Display name (username)")
    private String name;

    @Schema(description = "Email")
    private String email;

    @Schema(description = "Role")
    private String role;

    @Schema(description = "Permissions")
    private String permissions;

    @Schema(description = "Is active")
    private boolean active;

    @Schema(description = "Derived status: ACTIVE or SUSPENDED")
    private String status;

    @Schema(description = "Last login")
    private LocalDateTime lastLoginAt;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;
}
