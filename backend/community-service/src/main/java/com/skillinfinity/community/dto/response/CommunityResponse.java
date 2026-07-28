package com.skillinfinity.community.dto.response;

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
@Schema(description = "Community response")
public class CommunityResponse {

    @Schema(description = "Community ID")
    private UUID id;

    @Schema(description = "Community name")
    private String name;

    @Schema(description = "Community description")
    private String description;

    @Schema(description = "URL slug")
    private String slug;

    @Schema(description = "Avatar URL")
    private String avatarUrl;

    @Schema(description = "Cover image URL")
    private String coverUrl;

    @Schema(description = "Visibility")
    private String visibility;

    @Schema(description = "Owner user ID")
    private UUID ownerId;

    @Schema(description = "Member count")
    private int memberCount;

    @Schema(description = "Post count")
    private int postCount;

    @Schema(description = "Is verified")
    private boolean verified;

    @Schema(description = "Community rules")
    private String rules;

    @Schema(description = "Is current user a member")
    private boolean isMember;

    @Schema(description = "Current user's role")
    private String membershipRole;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last updated timestamp")
    private LocalDateTime updatedAt;
}
