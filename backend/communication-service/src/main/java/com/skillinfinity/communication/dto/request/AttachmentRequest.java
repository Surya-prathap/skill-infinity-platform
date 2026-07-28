package com.skillinfinity.communication.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Attachment information for a message")
public class AttachmentRequest {

    @NotBlank(message = "File name is required")
    @Schema(description = "Original file name", example = "document.pdf")
    private String fileName;

    @NotBlank(message = "File type is required")
    @Schema(description = "MIME type of the file", example = "application/pdf")
    private String fileType;

    @NotNull(message = "File size is required")
    @Schema(description = "File size in bytes", example = "1048576")
    private Long fileSize;

    @Schema(description = "MinIO object name")
    private String minioObjectName;

    @Schema(description = "File URL")
    private String fileUrl;
}
