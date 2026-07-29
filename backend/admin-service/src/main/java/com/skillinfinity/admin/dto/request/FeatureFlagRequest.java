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
@Schema(description = "Feature flag request")
public class FeatureFlagRequest {

    @NotBlank(message = "Feature key is required")
    @Schema(description = "Feature key", example = "ai_review_moderation")
    private String featureKey;

    @NotBlank(message = "Feature name is required")
    @Schema(description = "Feature name", example = "AI Review Moderation")
    private String featureName;

    @Schema(description = "Description", example = "Enable AI-powered review moderation")
    private String description;

    @Schema(description = "Is enabled")
    private boolean enabled;

    @Schema(description = "Rollout percentage (0-100)", example = "50")
    private int rolloutPercentage;

    @Schema(description = "Environment", example = "production")
    private String environment;
}
