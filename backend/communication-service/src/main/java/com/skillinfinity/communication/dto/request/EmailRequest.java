package com.skillinfinity.communication.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to send an email")
public class EmailRequest {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    @Schema(description = "Recipient email address", example = "user@example.com")
    private String recipientEmail;

    @Schema(description = "Recipient name", example = "John Doe")
    private String recipientName;

    @NotBlank(message = "Subject is required")
    @Schema(description = "Email subject", example = "Welcome to Skill Infinity!")
    private String subject;

    @NotBlank(message = "Template name is required")
    @Schema(description = "Email template name", example = "welcome")
    private String templateName;

    @Schema(description = "Template variables")
    private Map<String, Object> variables;

    @Schema(description = "Plain text body (fallback)")
    private String textBody;
}
