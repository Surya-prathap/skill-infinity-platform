package com.skillinfinity.communication.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Attachment response")
public class AttachmentResponse {

    @Schema(description = "Attachment ID")
    private UUID id;

    @Schema(description = "File name")
    private String fileName;

    @Schema(description = "File type")
    private String fileType;

    @Schema(description = "File size in bytes")
    private Long fileSize;

    @Schema(description = "File URL")
    private String fileUrl;

    @Schema(description = "Thumbnail URL")
    private String thumbnailUrl;
}
