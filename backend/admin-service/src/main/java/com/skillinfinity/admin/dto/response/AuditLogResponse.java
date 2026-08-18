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
@Schema(description = "Audit log response")
public class AuditLogResponse {

    @Schema(description = "Log ID")
    private UUID id;

    @Schema(description = "Admin ID")
    private UUID adminId;

    @Schema(description = "Action performed")
    private String action;

    @Schema(description = "Entity type")
    private String entityType;

    @Schema(description = "Entity ID")
    private UUID entityId;

    @Schema(description = "Description")
    private String description;

    @Schema(description = "Previous value")
    private String previousValue;

    @Schema(description = "New value")
    private String newValue;

    @Schema(description = "IP address")
    private String ipAddress;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;
}
