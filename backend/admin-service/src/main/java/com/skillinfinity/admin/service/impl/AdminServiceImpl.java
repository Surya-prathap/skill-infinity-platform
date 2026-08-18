package com.skillinfinity.admin.service.impl;

import com.skillinfinity.admin.dto.request.PlatformSettingRequest;
import com.skillinfinity.admin.dto.response.AdminUserResponse;
import com.skillinfinity.admin.dto.response.DashboardResponse;
import com.skillinfinity.admin.dto.response.IdentityUserSync;
import com.skillinfinity.admin.entity.AdminUser;
import com.skillinfinity.admin.entity.PlatformSetting;
import com.skillinfinity.admin.exception.AdminNotFoundException;
import com.skillinfinity.admin.exception.PlatformSettingNotFoundException;
import com.skillinfinity.admin.mapper.AdminMapper;
import com.skillinfinity.admin.repository.AdminUserRepository;
import com.skillinfinity.admin.repository.AuditLogRepository;
import com.skillinfinity.admin.repository.PlatformSettingRepository;
import com.skillinfinity.admin.service.AdminService;
import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.exception.ServiceException;
import com.skillinfinity.common.filter.GatewayHeaderAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.lang.management.ManagementFactory;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

    private final AdminUserRepository adminUserRepository;
    private final AuditLogRepository auditLogRepository;
    private final PlatformSettingRepository platformSettingRepository;
    private final AdminMapper mapper;
    private final RestTemplate restTemplate;

    /**
     * mentor-service base URL. Resolved by Docker DNS on the shared network;
     * override via MENTOR_SERVICE_URL when running services outside compose.
     */
    @Value("${app.services.mentor-service-url:http://mentor-service:8083}")
    private String mentorServiceUrl;

    /**
     * identity-service base URL — used to backfill the admin user index with
     * the accounts that existed before the event pipeline was introduced.
     */
    @Value("${app.services.identity-service-url:http://identity-service:8081}")
    private String identityServiceUrl;

    /**
     * Builds the admin dashboard from data the admin-service actually owns:
     * the synced user index and the audit trail. Mentor/session/revenue
     * metrics are managed by their own services, so they are not fabricated
     * here.
     */
    @Override
    public DashboardResponse getDashboard() {
        // Seed the user index once so the Total Users KPI is accurate even when
        // the admin opens the dashboard before the Users page ever loaded.
        if (adminUserRepository.count() == 0) {
            syncUsersFromIdentity();
        }

        long totalUsers = adminUserRepository.count();
        long totalMentors = adminUserRepository.countByRole("ROLE_MENTOR");
        long totalLearners = adminUserRepository.countByRole("ROLE_LEARNER");
        long uptimeHours = Math.max(0, ManagementFactory.getRuntimeMXBean().getUptime() / 3_600_000L);

        List<DashboardResponse.ActivityItem> recentActivities = auditLogRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(0, 6))
                .getContent()
                .stream()
                .map(activity -> DashboardResponse.ActivityItem.builder()
                        .action(activity.getAction())
                        .description(activity.getDescription() != null ? activity.getDescription() : activity.getAction())
                        .timestamp(activity.getCreatedAt() != null ? activity.getCreatedAt().toString() : null)
                        .build())
                .toList();

        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalMentors(totalMentors)
                .totalLearners(totalLearners)
                .recentActivities(recentActivities)
                .systemHealth(DashboardResponse.SystemHealth.builder()
                        .status("UP")
                        .uptime(uptimeHours)
                        .build())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getUsers(int page, int size) {
        // Lazy backfill: if the index is empty (e.g. accounts created before the
        // identity event pipeline shipped), seed it from identity-service once.
        if (adminUserRepository.count() == 0) {
            syncUsersFromIdentity();
        }
        // The Users page shows learners and mentors only — platform ADMIN
        // accounts are filtered out at the database level.
        return adminUserRepository.findByRoleNot("ROLE_ADMIN", PageRequest.of(page, size))
                .map(mapper::toAdminUserResponse);
    }

    /**
     * Pulls every account from the identity-service and upserts it into the
     * admin user index. Uses the trusted admin identity headers exactly like
     * the mentor verification forward, so the identity-service authorizes the
     * call as ROLE_ADMIN.
     */
    private void syncUsersFromIdentity() {
        try {
            String baseUrl = identityServiceUrl.endsWith("/")
                    ? identityServiceUrl.substring(0, identityServiceUrl.length() - 1)
                    : identityServiceUrl;

            HttpHeaders headers = new HttpHeaders();
            headers.set(GatewayHeaderAuthenticationFilter.USER_ID_HEADER, UUID.randomUUID().toString());
            headers.set(GatewayHeaderAuthenticationFilter.USER_ROLES_HEADER, "ROLE_ADMIN");

            ResponseEntity<ApiResponse<List<IdentityUserSync>>> response = restTemplate.exchange(
                    baseUrl + "/api/v1/auth/admin/users",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    new org.springframework.core.ParameterizedTypeReference<ApiResponse<List<IdentityUserSync>>>() {});

            ApiResponse<List<IdentityUserSync>> body = response.getBody();
            if (body == null || body.data() == null) {
                log.warn("Identity backfill returned no data — leaving the admin user index empty");
                return;
            }

            int created = 0;
            for (IdentityUserSync user : body.data()) {
                if (user.getId() == null) {
                    continue;
                }
                AdminUser adminUser = adminUserRepository.findByUserId(user.getId()).orElse(null);
                String role = resolveRole(user.getRoles());
                if (adminUser == null) {
                    adminUser = AdminUser.builder()
                            .userId(user.getId())
                            .name(user.getUsername())
                            .email(user.getEmail())
                            .role(role)
                            .createdBy("identity-backfill")
                            .updatedBy("identity-backfill")
                            .build();
                    adminUserRepository.save(adminUser);
                    created++;
                } else {
                    adminUser.setName(user.getUsername());
                    adminUser.setEmail(user.getEmail());
                    adminUser.setRole(role);
                    adminUser.setUpdatedBy("identity-backfill");
                    adminUserRepository.save(adminUser);
                }
            }
            log.info("Admin user index backfilled from identity-service: {} new users", created);
        } catch (RestClientException e) {
            log.warn("Could not backfill admin users from identity-service: {}", e.getMessage());
        }
    }

    private String resolveRole(Set<String> roles) {
        if (roles == null || roles.isEmpty()) return "ROLE_USER";
        if (roles.contains("ROLE_ADMIN")) return "ROLE_ADMIN";
        if (roles.contains("ROLE_MENTOR")) return "ROLE_MENTOR";
        if (roles.contains("ROLE_LEARNER")) return "ROLE_LEARNER";
        return "ROLE_USER";
    }

    @Override
    public void suspendUser(UUID userId) {
        AdminUser adminUser = adminUserRepository.findByUserId(userId)
                .orElseThrow(() -> new AdminNotFoundException(userId.toString()));
        adminUser.setActive(false);
        adminUserRepository.save(adminUser);
        log.info("User {} suspended by admin", userId);
    }

    @Override
    public void activateUser(UUID userId) {
        AdminUser adminUser = adminUserRepository.findByUserId(userId)
                .orElseThrow(() -> new AdminNotFoundException(userId.toString()));
        adminUser.setActive(true);
        adminUserRepository.save(adminUser);
        log.info("User {} activated by admin", userId);
    }

    @Override
    public void approveMentor(UUID mentorId, UUID adminId) {
        forwardVerification(mentorId, adminId, true, null);
        log.info("Mentor {} approved by admin {}", mentorId, adminId);
    }

    @Override
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
            log.error("Failed to forward mentor {} verification decision to mentor-service", mentorId, e);
            throw new ServiceException("Could not update mentor status: upstream service error", HttpStatus.BAD_GATEWAY);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlatformSetting> getSettings() {
        return platformSettingRepository.findByActiveTrue();
    }

    @Override
    public PlatformSetting updateSetting(PlatformSettingRequest request, UUID adminId) {
        PlatformSetting setting = platformSettingRepository.findBySettingKey(request.getSettingKey())
                .orElse(null);

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
            setting.setSettingValue(request.getSettingValue());
            setting.setDataType(request.getDataType());
            setting.setDescription(request.getDescription());
            setting.setCategory(request.getCategory());
            setting.setUpdatedBy(adminId.toString());
        }

        return platformSettingRepository.save(setting);
    }
}
