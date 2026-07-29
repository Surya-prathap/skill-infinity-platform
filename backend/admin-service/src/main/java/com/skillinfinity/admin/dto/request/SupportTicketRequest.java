package com.skillinfinity.admin.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Support ticket request")
public class SupportTicketRequest {

    @Schema(description = "User ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private UUID userId;

    @NotBlank(message = "Subject is required")
    @Schema(description = "Ticket subject", example = "Unable to book session")
    private String subject;

    @NotBlank(message = "Description is required")
    @Schema(description = "Ticket description", example = "I am unable to book a session with my mentor")
    private String description;

    @Schema(description = "Category", example = "technical")
    private String category;

    @Schema(description = "Priority: LOW, MEDIUM, HIGH, CRITICAL", example = "HIGH")
    private String priority;
}
