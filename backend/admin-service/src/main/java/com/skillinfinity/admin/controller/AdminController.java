package com.skillinfinity.admin.controller;

import com.skillinfinity.admin.dto.request.AnnouncementRequest;
import com.skillinfinity.admin.dto.request.FeatureFlagRequest;
import com.skillinfinity.admin.dto.request.PlatformSettingRequest;
import com.skillinfinity.admin.dto.response.AdminUserResponse;
import com.skillinfinity.admin.dto.response.AnalyticsResponse;
import com.skillinfinity.admin.dto.response.AuditLogResponse;
import com.skillinfinity.admin.dto.response.DashboardResponse;
import com.skillinfinity.admin.entity.FeatureFlag;
import com.skillinfinity.admin.entity.PlatformSetting;
import com.skillinfinity.admin.entity.ReportedContent;
import com.skillinfinity.admin.entity.SupportTicket;
import com.skillinfinity.admin.entity.SystemAnnouncement;
import com.skillinfinity.admin.service.AdminService;
import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
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
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Platform administration, moderation, analytics, and management")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard", description = "Returns admin dashboard with platform statistics")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboard()));
    }

    @GetMapping("/users")
    @Operation(summary = "Get users", description = "Returns paginated list of admin users")
    public ResponseEntity<ApiResponse<PageResponse<AdminUserResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AdminUserResponse> users = adminService.getUsers(page, size);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(
                users.getContent(), users.getNumber(),
                users.getSize(), users.getTotalElements())));
    }

    @PutMapping("/users/{id}/status")
    @Operation(summary = "Update user status", description = "Suspend or activate a user")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(
            @PathVariable UUID id,
            @RequestParam boolean active) {
        if (active) {
            adminService.activateUser(id);
        } else {
            adminService.suspendUser(id);
        }
        return ResponseEntity.ok(ApiResponse.success("User status updated", null));
    }

    @GetMapping("/mentors")
    @Operation(summary = "Get mentors", description = "Returns paginated list of mentors for management")
    public ResponseEntity<ApiResponse<PageResponse<AdminUserResponse>>> getMentors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AdminUserResponse> mentors = adminService.getUsers(page, size);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(
                mentors.getContent(), mentors.getNumber(),
                mentors.getSize(), mentors.getTotalElements())));
    }

    @PutMapping("/mentors/{id}/approve")
    @Operation(summary = "Approve mentor", description = "Approve a mentor application (forwards to mentor-service)")
    public ResponseEntity<ApiResponse<Void>> approveMentor(
            @PathVariable UUID id,
            Principal principal) {
        adminService.approveMentor(id, extractUserId(principal));
        return ResponseEntity.ok(ApiResponse.success("Mentor approved", null));
    }

    @PutMapping("/mentors/{id}/reject")
    @Operation(summary = "Reject mentor", description = "Reject a mentor application (forwards to mentor-service)")
    public ResponseEntity<ApiResponse<Void>> rejectMentor(
            @PathVariable UUID id,
            @RequestParam String reason,
            Principal principal) {
        adminService.rejectMentor(id, reason, extractUserId(principal));
        return ResponseEntity.ok(ApiResponse.success("Mentor rejected", null));
    }

    @GetMapping("/payments")
    @Operation(summary = "Get payments", description = "Returns payment information")
    public ResponseEntity<ApiResponse<AnalyticsResponse.RevenueAnalytics>> getPayments() {
        AnalyticsResponse analytics = adminService.getAnalytics();
        return ResponseEntity.ok(ApiResponse.success(analytics.getRevenue()));
    }

    @PutMapping("/refunds/{id}")
    @Operation(summary = "Manage refund", description = "Approve or reject a refund request")
    public ResponseEntity<ApiResponse<Void>> manageRefund(
            @PathVariable UUID id,
            @RequestParam String action) {
        log.info("Refund {} action: {}", id, action);
        return ResponseEntity.ok(ApiResponse.success("Refund " + action, null));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get analytics", description = "Returns platform analytics data")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAnalytics()));
    }

    @PostMapping("/announcements")
    @Operation(summary = "Create announcement", description = "Create a new system-wide announcement")
    public ResponseEntity<ApiResponse<SystemAnnouncement>> createAnnouncement(
            @Valid @RequestBody AnnouncementRequest request,
            Principal principal) {
        UUID adminId = extractUserId(principal);
        SystemAnnouncement announcement = adminService.createAnnouncement(request, adminId);
        return ResponseEntity.ok(ApiResponse.success("Announcement created", announcement));
    }

    @GetMapping("/support")
    @Operation(summary = "Get support tickets", description = "Returns paginated list of support tickets")
    public ResponseEntity<ApiResponse<PageResponse<SupportTicket>>> getSupportTickets(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<SupportTicket> tickets = adminService.getSupportTickets(page, size, status);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(
                tickets.getContent(), tickets.getNumber(),
                tickets.getSize(), tickets.getTotalElements())));
    }

    @PostMapping("/support/reply")
    @Operation(summary = "Reply to support ticket", description = "Reply to a support ticket as an admin")
    public ResponseEntity<ApiResponse<SupportTicket>> replyToTicket(
            @RequestParam UUID ticketId,
            @RequestParam String message,
            Principal principal) {
        UUID adminId = extractUserId(principal);
        SupportTicket ticket = adminService.replyToTicket(ticketId, message, adminId);
        return ResponseEntity.ok(ApiResponse.success("Reply sent", ticket));
    }

    @GetMapping("/audit")
    @Operation(summary = "Get audit logs", description = "Returns paginated audit logs")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AuditLogResponse> logs = adminService.getAuditLogs(page, size);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(
                logs.getContent(), logs.getNumber(),
                logs.getSize(), logs.getTotalElements())));
    }

    @GetMapping("/settings")
    @Operation(summary = "Get platform settings", description = "Returns all platform settings")
    public ResponseEntity<ApiResponse<List<PlatformSetting>>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getSettings()));
    }

    @PutMapping("/settings")
    @Operation(summary = "Update platform setting", description = "Create or update a platform setting")
    public ResponseEntity<ApiResponse<PlatformSetting>> updateSetting(
            @Valid @RequestBody PlatformSettingRequest request,
            Principal principal) {
        UUID adminId = extractUserId(principal);
        PlatformSetting setting = adminService.updateSetting(request, adminId);
        return ResponseEntity.ok(ApiResponse.success("Setting updated", setting));
    }

    @GetMapping("/feature-flags")
    @Operation(summary = "Get feature flags", description = "Returns all feature flags")
    public ResponseEntity<ApiResponse<List<FeatureFlag>>> getFeatureFlags() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getFeatureFlags()));
    }

    @PutMapping("/feature-flags")
    @Operation(summary = "Update feature flag", description = "Toggle or update a feature flag")
    public ResponseEntity<ApiResponse<FeatureFlag>> updateFeatureFlag(
            @Valid @RequestBody FeatureFlagRequest request) {
        FeatureFlag flag = adminService.updateFeatureFlag(request);
        return ResponseEntity.ok(ApiResponse.success("Feature flag updated", flag));
    }

    private UUID extractUserId(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new com.skillinfinity.common.exception.UnauthorizedException("Admin not authenticated");
        }
        try {
            return UUID.fromString(principal.getName());
        } catch (IllegalArgumentException e) {
            throw new com.skillinfinity.common.exception.UnauthorizedException("Invalid admin identifier");
        }
    }
}
