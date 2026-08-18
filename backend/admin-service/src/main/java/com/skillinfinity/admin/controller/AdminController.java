package com.skillinfinity.admin.controller;

import com.skillinfinity.admin.dto.request.PlatformSettingRequest;
import com.skillinfinity.admin.dto.response.AdminUserResponse;
import com.skillinfinity.admin.dto.response.DashboardResponse;
import com.skillinfinity.admin.entity.PlatformSetting;
import com.skillinfinity.admin.service.AdminService;
import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.common.exception.UnauthorizedException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Platform administration — users, mentors, settings")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard", description = "Returns the admin dashboard with platform statistics")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboard()));
    }

    @GetMapping("/users")
    @Operation(summary = "Get users", description = "Returns paginated list of platform users")
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

    @GetMapping("/settings")
    @Operation(summary = "Get platform settings", description = "Returns all active platform settings")
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

    private UUID extractUserId(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new UnauthorizedException("Admin not authenticated");
        }
        try {
            return UUID.fromString(principal.getName());
        } catch (IllegalArgumentException e) {
            throw new UnauthorizedException("Invalid admin identifier");
        }
    }
}
