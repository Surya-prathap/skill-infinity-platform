package com.skillinfinity.admin.event;

import com.skillinfinity.admin.entity.AdminUser;
import com.skillinfinity.admin.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Consumes identity events to keep the admin user index ({@code admin_users})
 * in sync with the identity-service accounts.
 *
 * <p>{@code user.registered} creates the admin row; {@code user.updated}
 * refreshes the role (e.g. learner → mentor after admin approval). The admin
 * console's user management table reads from this index.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ExternalEventConsumer {

    private final AdminUserRepository adminUserRepository;

    @RabbitListener(queues = "${admin.user.registered.queue:admin.user.registered.queue}")
    @Transactional
    public void handleUserRegisteredEvent(Map<String, Object> event) {
        String eventId = String.valueOf(event.getOrDefault("eventId", "?"));
        log.info("Received user registered event: {}", eventId);
        upsertUser(event);
    }

    @RabbitListener(queues = "${admin.user.updated.queue:admin.user.updated.queue}")
    @Transactional
    public void handleUserUpdatedEvent(Map<String, Object> event) {
        log.info("Received user updated event: userId={}", event.get("userId"));
        upsertUser(event);
    }

    /** Creates the admin row, or updates name/email/role when the account changes. */
    private void upsertUser(Map<String, Object> event) {
        Object rawUserId = event.get("userId");
        if (rawUserId == null) {
            log.warn("Identity event without userId: {}", event);
            return;
        }
        try {
            UUID userId = UUID.fromString(String.valueOf(rawUserId));
            String email = event.get("email") != null ? String.valueOf(event.get("email")) : null;
            String username = event.get("username") != null ? String.valueOf(event.get("username")) : null;
            Set<String> roles = extractRoles(event.get("roles"));
            String role = roles.contains("ROLE_ADMIN") ? "ROLE_ADMIN"
                    : roles.contains("ROLE_MENTOR") ? "ROLE_MENTOR"
                    : roles.contains("ROLE_LEARNER") ? "ROLE_LEARNER"
                    : "ROLE_USER";

            AdminUser adminUser = adminUserRepository.findByUserId(userId).orElse(null);
            if (adminUser == null) {
                adminUser = AdminUser.builder()
                        .userId(userId)
                        .name(username)
                        .email(email)
                        .role(role)
                        .createdBy("identity-service")
                        .updatedBy("identity-service")
                        .build();
                adminUserRepository.save(adminUser);
                log.info("Created admin user row for {}", userId);
            } else {
                adminUser.setName(username);
                adminUser.setEmail(email);
                adminUser.setRole(role);
                adminUser.setUpdatedBy("identity-service");
                adminUserRepository.save(adminUser);
                log.info("Updated admin user row for {} (role={})", userId, role);
            }
        } catch (IllegalArgumentException e) {
            log.warn("Identity event has invalid userId: {}", rawUserId);
        }
    }

    @SuppressWarnings("unchecked")
    private Set<String> extractRoles(Object rawRoles) {
        if (rawRoles instanceof Set<?> set) {
            Set<String> roles = new java.util.HashSet<>();
            for (Object role : set) {
                if (role != null) {
                    roles.add(String.valueOf(role));
                }
            }
            return roles;
        }
        return java.util.Set.of();
    }
}
