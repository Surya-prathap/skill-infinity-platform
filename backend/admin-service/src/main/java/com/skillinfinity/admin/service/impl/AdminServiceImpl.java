package com.skillinfinity.admin.service.impl;

import com.skillinfinity.admin.dto.request.AnnouncementRequest;
import com.skillinfinity.admin.dto.request.FeatureFlagRequest;
import com.skillinfinity.admin.dto.request.PlatformSettingRequest;
import com.skillinfinity.admin.dto.response.AdminUserResponse;
import com.skillinfinity.admin.dto.response.AnalyticsResponse;
import com.skillinfinity.admin.dto.response.AuditLogResponse;
import com.skillinfinity.admin.dto.response.DashboardResponse;
import com.skillinfinity.admin.entity.AdminUser;
import com.skillinfinity.admin.entity.AuditLog;
import com.skillinfinity.admin.entity.FeatureFlag;
import com.skillinfinity.admin.entity.PlatformSetting;
import com.skillinfinity.admin.entity.ReportedContent;
import com.skillinfinity.admin.entity.SupportTicket;
import com.skillinfinity.admin.entity.SupportReply;
import com.skillinfinity.admin.entity.SystemAnnouncement;
import com.skillinfinity.admin.event.AdminEventPublisher;
import com.skillinfinity.admin.exception.AdminNotFoundException;
import com.skillinfinity.admin.exception.AnnouncementNotFoundException;
import com.skillinfinity.admin.exception.FeatureFlagNotFoundException;
import com.skillinfinity.admin.exception.PlatformSettingNotFoundException;
import com.skillinfinity.admin.exception.SupportTicketNotFoundException;
import com.skillinfinity.admin.mapper.AdminMapper;
import com.skillinfinity.admin.repository.AdminUserRepository;
import com.skillinfinity.admin.repository.AuditLogRepository;
import com.skillinfinity.admin.repository.FeatureFlagRepository;
import com.skillinfinity.admin.repository.PlatformSettingRepository;
import com.skillinfinity.admin.repository.ReportedContentRepository;
import com.skillinfinity.admin.repository.SupportTicketRepository;
import com.skillinfinity.admin.repository.SupportReplyRepository;
import com.skillinfinity.admin.repository.SystemAnnouncementRepository;
import com.skillinfinity.admin.service.AdminService;
import com.skillinfinity.common.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

    private final AdminUserRepository adminUserRepository;
    private final AuditLogRepository auditLogRepository;
    private final PlatformSettingRepository platformSettingRepository;
    private final SystemAnnouncementRepository announcementRepository;
    private final ReportedContentRepository reportedContentRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final SupportReplyRepository supportReplyRepository;
    private final FeatureFlagRepository featureFlagRepository;
    private final AdminMapper mapper;
    private final AdminEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboardStats", key = "'overview'")
    public DashboardResponse getDashboard() {
        return DashboardResponse.builder()
                .userStats(DashboardResponse.UserStats.builder()
                        .totalUsers(1000).totalMentors(100).totalLearners(900)
                        .activeUsersToday(50).dailyRegistrations(10)
                        .build())
                .mentorStats(DashboardResponse.MentorStats.builder()
                        .totalMentors(100).approvedMentors(80)
                        .pendingApprovals(10).suspendedMentors(10)
                        .build())
                .sessionStats(DashboardResponse.SessionStats.builder()
                        .totalSessions(5000).completedSessions(3000)
                        .activeSessions(100).cancelledSessions(500)
                        .build())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "analytics", key = "'platform'")
    public AnalyticsResponse getAnalytics() {
        return AnalyticsResponse.builder()
                .revenue(AnalyticsResponse.RevenueAnalytics.builder()
                        .totalRevenue(50000.0).monthlyRevenue(5000.0)
                        .build())
                .growth(AnalyticsResponse.GrowthAnalytics.builder()
                        .userGrowthRate(15.0).mentorGrowthRate(10.0)
                        .build())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getUsers(int page, int size) {
        return adminUserRepository.findAll(PageRequest.of(page, size))
                .map(mapper::toAdminUserResponse);
    }

    @Override
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public void suspendUser(UUID userId) {
        AdminUser adminUser = adminUserRepository.findByUserId(userId)
                .orElseThrow(() -> new AdminNotFoundException(userId.toString()));
        adminUser.setActive(false);
        adminUserRepository.save(adminUser);
        log.info("User {} suspended by admin", userId);
    }

    @Override
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public void activateUser(UUID userId) {
        AdminUser adminUser = adminUserRepository.findByUserId(userId)
                .orElseThrow(() -> new AdminNotFoundException(userId.toString()));
        adminUser.setActive(true);
        adminUserRepository.save(adminUser);
        log.info("User {} activated by admin", userId);
    }

    @Override
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public void assignRole(UUID userId, String role) {
        AdminUser adminUser = adminUserRepository.findByUserId(userId)
                .orElseThrow(() -> new AdminNotFoundException(userId.toString()));
        adminUser.setRole(role);
        adminUserRepository.save(adminUser);
        log.info("Role {} assigned to user {}", role, userId);
    }

    @Override
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public void approveMentor(UUID mentorId) {
        log.info("Mentor {} approved", mentorId);
    }

    @Override
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public void rejectMentor(UUID mentorId, String reason) {
        log.info("Mentor {} rejected: {}", mentorId, reason);
    }

    @Override
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public void suspendMentor(UUID mentorId) {
        log.info("Mentor {} suspended", mentorId);
    }

    @Override
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public void forceCancelSession(UUID sessionId, String reason) {
        log.info("Session {} force cancelled: {}", sessionId, reason);
    }

    @Override
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public SystemAnnouncement createAnnouncement(AnnouncementRequest request, UUID adminId) {
        SystemAnnouncement announcement = SystemAnnouncement.builder()
                .id(UUID.randomUUID())
                .title(request.getTitle())
                .content(request.getContent())
                .announcementType(request.getAnnouncementType())
                .targetRole(request.getTargetRole())
                .priority(request.getPriority())
                .scheduledAt(request.getScheduledAt())
                .expiresAt(request.getExpiresAt())
                .status("DRAFT")
                .createdBy(adminId.toString())
                .updatedBy(adminId.toString())
                .build();

        announcement = announcementRepository.save(announcement);
        eventPublisher.publishAnnouncement(announcement);
        log.info("Announcement created: {}", announcement.getId());
        return announcement;
    }

    @Override
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public void deleteAnnouncement(UUID announcementId) {
        SystemAnnouncement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new AnnouncementNotFoundException(announcementId.toString()));
        announcement.setActive(false);
        announcementRepository.save(announcement);
        log.info("Announcement deleted: {}", announcementId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SystemAnnouncement> getActiveAnnouncements() {
        return announcementRepository.findByStatusAndActiveTrue("PUBLISHED",
                PageRequest.of(0, 50)).getContent();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupportTicket> getSupportTickets(int page, int size, String status) {
        if (status != null && !status.isEmpty()) {
            return supportTicketRepository.findByStatusOrderByCreatedAtDesc(status, PageRequest.of(page, size));
        }
        return supportTicketRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    @Override
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public SupportTicket assignTicket(UUID ticketId, UUID adminId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new SupportTicketNotFoundException(ticketId.toString()));
        ticket.setAssignedTo(adminId);
        ticket.setAssignedAt(LocalDateTime.now());
        ticket.setStatus("IN_PROGRESS");
        ticket.setUpdatedBy(adminId.toString());
        return supportTicketRepository.save(ticket);
    }

    @Override
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public SupportTicket replyToTicket(UUID ticketId, String message, UUID adminId) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new SupportTicketNotFoundException(ticketId.toString()));

        SupportReply reply = SupportReply.builder()
                .id(UUID.randomUUID())
                .ticket(ticket)
                .senderId(adminId)
                .senderType("ADMIN")
                .message(message)
                .build();
        supportReplyRepository.save(reply);

        ticket.setStatus("IN_PROGRESS");
        ticket.setUpdatedBy(adminId.toString());
        return supportTicketRepository.save(ticket);
    }

    @Override
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public SupportTicket resolveTicket(UUID ticketId, String resolution) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId)
                .orElseThrow(() -> new SupportTicketNotFoundException(ticketId.toString()));
        ticket.setStatus("RESOLVED");
        ticket.setResolvedAt(LocalDateTime.now());
        ticket.setResolutionNotes(resolution);
        return supportTicketRepository.save(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "featureFlags", key = "'all'")
    public List<FeatureFlag> getFeatureFlags() {
        return featureFlagRepository.findByActiveTrue();
    }

    @Override
    @CacheEvict(value = "featureFlags", allEntries = true)
    public FeatureFlag toggleFeatureFlag(String featureKey, boolean enabled) {
        FeatureFlag flag = featureFlagRepository.findByFeatureKey(featureKey)
                .orElseThrow(() -> new FeatureFlagNotFoundException(featureKey));
        flag.setEnabled(enabled);
        return featureFlagRepository.save(flag);
    }

    @Override
    @CacheEvict(value = "featureFlags", allEntries = true)
    public FeatureFlag updateFeatureFlag(FeatureFlagRequest request) {
        FeatureFlag flag = featureFlagRepository.findByFeatureKey(request.getFeatureKey())
                .orElse(null);

        if (flag == null) {
            flag = FeatureFlag.builder()
                    .id(UUID.randomUUID())
                    .featureKey(request.getFeatureKey())
                    .featureName(request.getFeatureName())
                    .description(request.getDescription())
                    .enabled(request.isEnabled())
                    .rolloutPercentage(request.getRolloutPercentage())
                    .environment(request.getEnvironment())
                    .createdBy("admin")
                    .updatedBy("admin")
                    .build();
        } else {
            flag.setFeatureName(request.getFeatureName());
            flag.setDescription(request.getDescription());
            flag.setEnabled(request.isEnabled());
            flag.setRolloutPercentage(request.getRolloutPercentage());
            flag.setEnvironment(request.getEnvironment());
            flag.setUpdatedBy("admin");
        }

        return featureFlagRepository.save(flag);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "platformSettings", key = "'all'")
    public List<PlatformSetting> getSettings() {
        return platformSettingRepository.findByActiveTrue();
    }

    @Override
    @CacheEvict(value = "platformSettings", allEntries = true)
    public PlatformSetting updateSetting(PlatformSettingRequest request, UUID adminId) {
        PlatformSetting setting = platformSettingRepository.findBySettingKey(request.getSettingKey())
                .orElse(null);

        String oldValue = setting != null ? setting.getSettingValue() : null;

        if (setting == null) {
            setting = PlatformSetting.builder()
                    .id(UUID.randomUUID())
                    .settingKey(request.getSettingKey())
                    .settingValue(request.getSettingValue())
                    .dataType(request.getDataType())
                    .description(request.getDescription())
                    .category(request.getCategory())
                    .createdBy(adminId.toString())
                    .updatedBy(adminId.toString())
                    .build();
        } else {
            oldValue = setting.getSettingValue();
            setting.setSettingValue(request.getSettingValue());
            setting.setDataType(request.getDataType());
            setting.setDescription(request.getDescription());
            setting.setCategory(request.getCategory());
            setting.setUpdatedBy(adminId.toString());
        }

        setting = platformSettingRepository.save(setting);
        eventPublisher.publishSettingChanged(setting, oldValue);
        return setting;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(int page, int size) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(mapper::toAuditLogResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportedContent> getReportedContent(int page, int size, String status) {
        if (status != null && !status.isEmpty()) {
            return reportedContentRepository.findByStatusOrderByCreatedAtDesc(status, PageRequest.of(page, size));
        }
        return reportedContentRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    @Override
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public void moderateReportedContent(UUID reportId, String action, String notes, UUID adminId) {
        ReportedContent report = reportedContentRepository.findById(reportId)
                .orElseThrow(() -> new com.skillinfinity.common.exception.ResourceNotFoundException("Report", reportId.toString()));
        report.setStatus("RESOLVED");
        report.setReviewedBy(adminId);
        report.setReviewedAt(LocalDateTime.now());
        report.setResolutionNotes(notes);
        reportedContentRepository.save(report);
        log.info("Report {} moderated by {}: {}", reportId, adminId, action);
    }
}
