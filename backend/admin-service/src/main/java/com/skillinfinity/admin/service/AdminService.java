package com.skillinfinity.admin.service;

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
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface AdminService {

    DashboardResponse getDashboard();

    AnalyticsResponse getAnalytics();

    // User Management
    Page<AdminUserResponse> getUsers(int page, int size);
    void suspendUser(UUID userId);
    void activateUser(UUID userId);
    void assignRole(UUID userId, String role);

    // Mentor Management
    void approveMentor(UUID mentorId);
    void rejectMentor(UUID mentorId, String reason);
    void suspendMentor(UUID mentorId);

    // Session Management
    void forceCancelSession(UUID sessionId, String reason);

    // Announcements
    SystemAnnouncement createAnnouncement(AnnouncementRequest request, UUID adminId);
    void deleteAnnouncement(UUID announcementId);
    List<SystemAnnouncement> getActiveAnnouncements();

    // Support Tickets
    Page<SupportTicket> getSupportTickets(int page, int size, String status);
    SupportTicket assignTicket(UUID ticketId, UUID adminId);
    SupportTicket replyToTicket(UUID ticketId, String message, UUID adminId);
    SupportTicket resolveTicket(UUID ticketId, String resolution);

    // Feature Flags
    List<FeatureFlag> getFeatureFlags();
    FeatureFlag toggleFeatureFlag(String featureKey, boolean enabled);
    FeatureFlag updateFeatureFlag(FeatureFlagRequest request);

    // Platform Settings
    List<PlatformSetting> getSettings();
    PlatformSetting updateSetting(PlatformSettingRequest request, UUID adminId);

    // Audit Logs
    Page<AuditLogResponse> getAuditLogs(int page, int size);

    // Reported Content
    Page<ReportedContent> getReportedContent(int page, int size, String status);
    void moderateReportedContent(UUID reportId, String action, String notes, UUID adminId);
}
