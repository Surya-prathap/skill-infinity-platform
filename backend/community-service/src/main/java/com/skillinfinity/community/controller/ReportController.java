package com.skillinfinity.community.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.community.dto.request.ReportRequest;
import com.skillinfinity.community.dto.response.ReportResponse;
import com.skillinfinity.community.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Content reporting and moderation")
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    @Operation(summary = "Report content", description = "Reports a post or comment for moderation review")
    public ResponseEntity<ApiResponse<ReportResponse>> createReport(
            @Valid @RequestBody ReportRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        ReportResponse response = reportService.createReport(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Content reported", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get reports", description = "Returns paginated list of reports (Admin only)")
    public ResponseEntity<ApiResponse<PageResponse<ReportResponse>>> getReports(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ReportResponse> reports = reportService.getReports(status, page, size);
        PageResponse<ReportResponse> pageResponse = PageResponse.of(
                reports.getContent(), reports.getNumber(),
                reports.getSize(), reports.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get report", description = "Returns report details (Admin only)")
    public ResponseEntity<ApiResponse<ReportResponse>> getReport(@PathVariable UUID id) {
        ReportResponse response = reportService.getReport(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Resolve report", description = "Resolves a report (Admin only)")
    public ResponseEntity<ApiResponse<ReportResponse>> resolveReport(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request,
            Principal principal) {
        UUID moderatorId = extractUserId(principal);
        String notes = request.getOrDefault("resolutionNotes", "Resolved");
        ReportResponse response = reportService.resolveReport(id, moderatorId, notes);
        return ResponseEntity.ok(ApiResponse.success("Report resolved", response));
    }

    @PutMapping("/{id}/dismiss")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Dismiss report", description = "Dismisses a report (Admin only)")
    public ResponseEntity<ApiResponse<ReportResponse>> dismissReport(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request,
            Principal principal) {
        UUID moderatorId = extractUserId(principal);
        String notes = request.getOrDefault("resolutionNotes", "Dismissed");
        ReportResponse response = reportService.dismissReport(id, moderatorId, notes);
        return ResponseEntity.ok(ApiResponse.success("Report dismissed", response));
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get pending count", description = "Returns pending report count (Admin only)")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getPendingCount() {
        long count = reportService.getPendingReportCount();
        return ResponseEntity.ok(ApiResponse.success(Map.of("pendingCount", count)));
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
