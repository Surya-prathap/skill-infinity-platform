package com.skillinfinity.communication.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.communication.dto.response.AttachmentResponse;
import com.skillinfinity.communication.service.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Tag(name = "Files", description = "File upload, download, and management")
public class FileController {

    private final FileService fileService;

    @PostMapping("/upload")
    @Operation(summary = "Upload file", description = "Uploads a file to storage")
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        UUID userId = extractUserId(principal);
        AttachmentResponse response = fileService.uploadFile(file, userId);
        return ResponseEntity.ok(ApiResponse.success("File uploaded", response));
    }

    @PostMapping("/upload/image")
    @Operation(summary = "Upload image", description = "Uploads an image file to storage")
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadImage(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        UUID userId = extractUserId(principal);
        AttachmentResponse response = fileService.uploadImage(file, userId);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded", response));
    }

    @GetMapping("/download/{bucket}/{objectName:.+}")
    @Operation(summary = "Download file", description = "Downloads a file from storage")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable String bucket,
            @PathVariable String objectName) {
        byte[] data = fileService.downloadFile(objectName, bucket);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + objectName + "\"")
                .body(data);
    }

    @DeleteMapping("/{bucket}/{objectName:.+}")
    @Operation(summary = "Delete file", description = "Deletes a file from storage")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @PathVariable String bucket,
            @PathVariable String objectName) {
        fileService.deleteFile(objectName, bucket);
        return ResponseEntity.ok(ApiResponse.success("File deleted", null));
    }

    private UUID extractUserId(Principal principal) {
        if (principal == null) {
            return UUID.randomUUID();
        }
        try {
            return UUID.fromString(principal.getName());
        } catch (IllegalArgumentException e) {
            return UUID.randomUUID();
        }
    }
}
