package com.skillinfinity.community.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Community creation/update request")
public class CommunityRequest {

    @NotBlank(message = "Community name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    @Schema(description = "Community name", example = "Java Developers")
    private String name;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Schema(description = "Community description", example = "A community for Java enthusiasts")
    private String description;

    @Schema(description = "Unique URL slug", example = "java-developers")
    private String slug;

    @Schema(description = "Avatar URL", example = "https://minio.skillinfinity.com/avatars/community.png")
    private String avatarUrl;

    @Schema(description = "Cover image URL", example = "https://minio.skillinfinity.com/covers/community.png")
    private String coverUrl;

    @Schema(description = "Visibility: PUBLIC, PRIVATE, RESTRICTED", example = "PUBLIC")
    private String visibility;

    @Size(max = 5000, message = "Rules must not exceed 5000 characters")
    @Schema(description = "Community rules")
    private String rules;
}
