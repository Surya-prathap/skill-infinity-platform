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
@Schema(description = "Post response")
public class PostResponse {

    @Schema(description = "Post ID")
    private UUID id;

    @Schema(description = "Community ID")
    private UUID communityId;

    @Schema(description = "Title")
    private String title;

    @Schema(description = "Content")
    private String content;

    @Schema(description = "Post type")
    private String postType;

    @Schema(description = "Status")
    private String status;

    @Schema(description = "Author user ID")
    private UUID authorId;

    @Schema(description = "Is pinned")
    private boolean pinned;

    @Schema(description = "Is locked")
    private boolean locked;

    @Schema(description = "Like count")
    private int likeCount;

    @Schema(description = "Comment count")
    private int commentCount;

    @Schema(description = "View count")
    private int viewCount;

    @Schema(description = "Bookmark count")
    private int bookmarkCount;

    @Schema(description = "Comma-separated tags")
    private String tags;

    @Schema(description = "Is liked by current user")
    private boolean likedByMe;

    @Schema(description = "Is bookmarked by current user")
    private boolean bookmarkedByMe;

    @Schema(description = "Published date")
    private LocalDateTime publishedAt;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last updated timestamp")
    private LocalDateTime updatedAt;
}
