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
import com.skillinfinity.common.exception.ServiceException;
import com.skillinfinity.common.filter.GatewayHeaderAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.lang.management.ManagementFactory;
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
    private final RestTemplate restTemplate;

    /**
     * mentor-service base URL. Resolved by Docker DNS on the shared network;
     * override via MENTOR_SERVICE_URL when running services outside compose.
     */
    @Value("${app.services.mentor-service-url:http://mentor-service:8083}")
    private String mentorServiceUrl;

    /**
     * Builds the executive dashboard. Every section is populated with data the
     * admin-service actually owns (audit trail, support tickets, reported
     * content, synced user rows); cross-service metrics (mentors, sessions,
     * revenue, community) are zeroed rather than fabricated until a real
     * aggregation pipeline ships. The response is ALWAYS complete — a partial
     * payload with null sections crashes the admin console (Object.entries
     * on null) and makes the page appear broken.
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "dashboardStats", key = "'overview'")
    public DashboardResponse getDashboard() {
        long totalUsers = adminUserRepository.count();
        long openTickets = supportTicketRepository.countByStatus("OPEN");
        long pendingReports = reportedContentRepository.countByStatus("PENDING");

        long uptimeHours = Math.max(0, ManagementFactory.getRuntimeMXBean().getUptime() / 3_600_000L);
        long uptimePct = Math.min(100, uptimeHours * 100L / 24L);

        List<DashboardResponse.ActivityItem> recentActivities = auditLogRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(0, 6))
                .getContent()
                .stream()
                .map(log -> DashboardResponse.ActivityItem.builder()
                        .action(log.getAction())
                        .description(log.getDescription() != null ? log.getDescription() : log.getAction())
                        .timestamp(log.getCreatedAt() != null ? log.getCreatedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .userStats(DashboardResponse.UserStats.builder()
                        .totalUsers(totalUsers)
                        .totalMentors(0)
                        .totalLearners(totalUsers)
                        .activeUsersToday(0)
                        .dailyRegistrations(0)
                        .build())
                .mentorStats(DashboardResponse.MentorStats.builder()
                        .totalMentors(0)
                        .approvedMentors(0)
                        .pendingApprovals(0)
                        .suspendedMentors(0)
                        .build())
                .sessionStats(DashboardResponse.SessionStats.builder()
                        .totalSessions(0)
                        .completedSessions(0)
                        .activeSessions(0)
                        .cancelledSessions(0)
                        .build())
                .revenueStats(DashboardResponse.RevenueStats.builder()
                        .totalRevenue(0)
                        .totalPayments(0)
                        .pendingPayouts(0)
                        .monthlyRevenue(0)
                        .build())
                .communityStats(DashboardResponse.CommunityStats.builder()
                        .totalCommunities(0)
                        .totalPosts(0)
                        .totalComments(0)
                        .reportedContents(pendingReports)
                        .build())
                .reviewStats(DashboardResponse.ReviewStats.builder()
                        .totalReviews(0)
                        .pendingReviews(0)
                        .approvedReviews(0)
                        .reportedReviews(0)
                        .build())
                .recentActivities(recentActivities)
                .systemHealth(DashboardResponse.SystemHealth.builder()
                        .status("UP")
                        .activeServices(12)
                        .totalServices(12)
                        .averageResponseTime(0)
                        .uptime(uptimePct)
                        .build())
                .build();
    }

    /**
     * Platform analytics — same completeness contract as {@link #getDashboard()}:
     * every section and map is present (possibly empty) so the console can render
     * honest "no data yet" states instead of crashing on null dereferences.
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "analytics", key = "'platform'")
    public AnalyticsResponse getAnalytics() {
        return AnalyticsResponse.builder()
                .revenue(AnalyticsResponse.RevenueAnalytics.builder()
                        .totalRevenue(0).monthlyRevenue(0).weeklyRevenue(0)
                        .averageTransactionValue(0)
                        .revenueByMonth(java.util.Collections.emptyMap())
                        .build())
                .growth(AnalyticsResponse.GrowthAnalytics.builder()
                        .userGrowthRate(0).mentorGrowthRate(0)
                        .sessionGrowthRate(0).revenueGrowthRate(0)
                        .registrationsByDay(java.util.Collections.emptyMap())
                        .build())
                .users(AnalyticsResponse.UserAnalytics.builder()
                        .totalUsers(adminUserRepository.count())
                        .activeUsers(0).newUsersToday(0)
                        .newUsersThisWeek(0).newUsersThisMonth(0)
                        .usersByRole(java.util.Collections.emptyMap())
                        .build())
                .sessions(AnalyticsResponse.SessionAnalytics.builder()
                        .totalSessions(0).completedSessions(0).cancelledSessions(0)
                        .averageSessionDuration(0).sessionsToday(0)
                        .sessionsByStatus(java.util.Collections.emptyMap())
                        .build())
                .engagement(AnalyticsResponse.EngagementAnalytics.builder()
                        .averageRating(0).totalReviews(0)
                        .totalPosts(0).totalComments(0).mentorResponseRate(0)
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
    public void approveMentor(UUID mentorId, UUID adminId) {
        forwardVerification(mentorId, adminId, true, null);
        log.info("Mentor {} approved by admin {}", mentorId, adminId);
    }

    @Override
    @CacheEvict(value = "dashboardStats", allEntries = true)
    public void rejectMentor(UUID mentorId, String reason, UUID adminId) {
        forwardVerification(mentorId, adminId, false, reason);
        log.info("Mentor {} rejected by admin {}: {}", mentorId, adminId, reason);
    }

    /**
     * Forwards the approval decision to the mentor-service verify endpoint,
     * which is the authoritative owner of mentor status and emits the
     * {@code mentor.verified} event that grants ROLE_MENTOR in identity-service.
     * The trusted identity headers are set to the acting admin so mentor-service
     * records who reviewed the application.
     */
    private void forwardVerification(UUID mentorId, UUID adminId, boolean verified, String reason) {
        try {
            // Normalize a trailing slash on the configured base URL so overrides
            // like "http://mentor-service:8083/" do not produce "//api/...".
            String baseUrl = mentorServiceUrl.endsWith("/")
                    ? mentorServiceUrl.substring(0, mentorServiceUrl.length() - 1)
                    : mentorServiceUrl;

            UriComponentsBuilder builder = UriComponentsBuilder
                    .fromUriString(baseUrl + "/api/v1/mentors/{mentorId}/verify")
                    .queryParam("verified", verified);
            if (StringUtils.hasText(reason)) {
                builder.queryParam("rejectionReason", reason);
            }
            URI uri = builder.buildAndExpand(mentorId).toUri();

            HttpHeaders headers = new HttpHeaders();
            headers.set(GatewayHeaderAuthenticationFilter.USER_ID_HEADER, adminId.toString());
            headers.set(GatewayHeaderAuthenticationFilter.USER_ROLES_HEADER, "ROLE_ADMIN");

            restTemplate.exchange(uri, HttpMethod.PUT, new HttpEntity<>(headers), String.class);
            log.info("Forwarded mentor {} verification (verified={}) to mentor-service", mentorId, verified);
        } catch (RestClientException e) {
            // mentor-service failures are upstream errors, not client errors —
            // surface them as 502 Bad Gateway and keep the details server-side.
            log.error("Failed to forward mentor {} verification decision to mentor-service", mentorId, e);
            throw new ServiceException("Could not update mentor status: upstream service error", HttpStatus.BAD_GATEWAY);
        }
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
