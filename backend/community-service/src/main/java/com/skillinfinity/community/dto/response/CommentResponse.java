package com.skillinfinity.community.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Comment response")
public class CommentResponse {

    @Schema(description = "Comment ID")
    private UUID id;

    @Schema(description = "Post ID")
    private UUID postId;

    @Schema(description = "Parent comment ID")
    private UUID parentId;

    @Schema(description = "Content")
    private String content;

    @Schema(description = "Author user ID")
    private UUID authorId;

    @Schema(description = "Like count")
    private int likeCount;

    @Schema(description = "Reply count")
    private int replyCount;

    @Schema(description = "Depth level")
    private int depth;

    @Schema(description = "Is liked by current user")
    private boolean likedByMe;

    @Schema(description = "Replies to this comment")
    private List<CommentResponse> replies;

    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Last updated timestamp")
    private LocalDateTime updatedAt;
}
