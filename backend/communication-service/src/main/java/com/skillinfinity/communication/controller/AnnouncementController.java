package com.skillinfinity.communication.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.communication.dto.request.AnnouncementRequest;
import com.skillinfinity.communication.dto.response.AnnouncementResponse;
import com.skillinfinity.communication.service.AnnouncementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/announcements")
@RequiredArgsConstructor
@Tag(name = "Announcements", description = "System announcements and broadcast management")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create announcement", description = "Creates a new announcement (Admin only)")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> createAnnouncement(
            @Valid @RequestBody AnnouncementRequest request,
            Principal principal) {
        UUID adminUserId = extractUserId(principal);
        AnnouncementResponse response = announcementService.createAnnouncement(request, adminUserId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Announcement created", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update announcement", description = "Updates an existing announcement (Admin only)")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> updateAnnouncement(
            @PathVariable UUID id,
            @Valid @RequestBody AnnouncementRequest request,
            Principal principal) {
        UUID adminUserId = extractUserId(principal);
        AnnouncementResponse response = announcementService.updateAnnouncement(id, request, adminUserId);
        return ResponseEntity.ok(ApiResponse.success("Announcement updated", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete announcement", description = "Deletes an announcement (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(
            @PathVariable UUID id,
            Principal principal) {
        UUID adminUserId = extractUserId(principal);
        announcementService.deleteAnnouncement(id, adminUserId);
        return ResponseEntity.ok(ApiResponse.success("Announcement deleted", null));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Publish announcement", description = "Publishes a draft announcement (Admin only)")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> publishAnnouncement(
            @PathVariable UUID id,
            Principal principal) {
        UUID adminUserId = extractUserId(principal);
        AnnouncementResponse response = announcementService.publishAnnouncement(id, adminUserId);
        return ResponseEntity.ok(ApiResponse.success("Announcement published", response));
    }

    @GetMapping
    @Operation(summary = "Get announcements", description = "Returns paginated list of announcements")
    public ResponseEntity<ApiResponse<PageResponse<AnnouncementResponse>>> getAnnouncements(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AnnouncementResponse> announcementPage = announcementService.getAnnouncements(status, page, size);
        PageResponse<AnnouncementResponse> pageResponse = PageResponse.of(
                announcementPage.getContent(), announcementPage.getNumber(),
                announcementPage.getSize(), announcementPage.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get announcement", description = "Returns announcement by ID")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> getAnnouncement(@PathVariable UUID id) {
        AnnouncementResponse response = announcementService.getAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/important")
    @Operation(summary = "Get important announcements", description = "Returns important announcements")
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getImportantAnnouncements() {
        List<AnnouncementResponse> announcements = announcementService.getImportantAnnouncements();
        return ResponseEntity.ok(ApiResponse.success(announcements));
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
