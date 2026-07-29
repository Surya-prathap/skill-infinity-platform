package com.skillinfinity.admin.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Platform setting request")
public class PlatformSettingRequest {

    @NotBlank(message = "Setting key is required")
    @Schema(description = "Setting key", example = "maintenance_mode")
    private String settingKey;

    @NotBlank(message = "Setting value is required")
    @Schema(description = "Setting value", example = "false")
    private String settingValue;

    @Schema(description = "Data type", example = "BOOLEAN")
    private String dataType;

    @Schema(description = "Description", example = "Enable/disable maintenance mode")
    private String description;

    @Schema(description = "Category", example = "system")
    private String category;
}
