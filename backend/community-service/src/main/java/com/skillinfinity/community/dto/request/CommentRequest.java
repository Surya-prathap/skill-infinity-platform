package com.skillinfinity.community.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Comment creation request")
public class CommentRequest {

    @Schema(description = "Post ID", required = true)
    private UUID postId;

    @Schema(description = "Parent comment ID for replies")
    private UUID parentId;

    @NotBlank(message = "Content is required")
    @Size(max = 10000, message = "Content must not exceed 10000 characters")
    @Schema(description = "Comment content", example = "Great post! Thanks for sharing.")
    private String content;
}
