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
@Schema(description = "Post creation/update request")
public class PostRequest {

    @Schema(description = "Community ID")
    private UUID communityId;

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    @Size(min = 3, message = "Title must be at least 3 characters")
    @Schema(description = "Post title", example = "How to use Java Streams?")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(max = 50000, message = "Content must not exceed 50000 characters")
    @Schema(description = "Post content", example = "I'm trying to learn Java Streams...")
    private String content;

    @Schema(description = "Post type: DISCUSSION, QUESTION, RESOURCE, ANNOUNCEMENT, POLL", example = "DISCUSSION")
    private String postType;

    @Schema(description = "Status: PUBLISHED, DRAFT", example = "PUBLISHED")
    private String status;

    @Schema(description = "Comma-separated tags", example = "java,streams,functional")
    private String tags;

    @Schema(description = "Is pinned post")
    private boolean pinned;
}
