package com.skillinfinity.community.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
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
@Schema(description = "Poll creation request")
public class PollRequest {

    @Schema(description = "Post ID to attach poll to")
    private UUID postId;

    @NotBlank(message = "Question is required")
    @Size(max = 500, message = "Question must not exceed 500 characters")
    @Schema(description = "Poll question", example = "What is your favorite programming language?")
    private String question;

    @NotEmpty(message = "At least 2 options are required")
    @Size(min = 2, max = 10, message = "Options must be between 2 and 10")
    @Schema(description = "Poll options")
    private List<String> options;

    @Schema(description = "Expiration date/time")
    private LocalDateTime expiresAt;

    @Schema(description = "Allow multiple choice", example = "false")
    private boolean multipleChoice;
}
