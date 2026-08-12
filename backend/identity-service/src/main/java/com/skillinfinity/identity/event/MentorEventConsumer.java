package com.skillinfinity.identity.event;

import com.skillinfinity.identity.entity.Role;
import com.skillinfinity.identity.entity.UserCredential;
import com.skillinfinity.identity.repository.RoleRepository;
import com.skillinfinity.identity.repository.UserCredentialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Consumes the {@code mentor.verified} event published by the mentor-service.
 *
 * <p>This is the single source of truth for the mentor lifecycle on the
 * identity side: a user only receives {@code ROLE_MENTOR} AFTER an admin
 * approves their application (mentor-service {@code PUT /verify?verified=true}).
 * Submitting the application itself does NOT change any role — the applicant
 * stays a learner until approval.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MentorEventConsumer {

    public static final String MENTOR_ROLE = "ROLE_MENTOR";

    private final UserCredentialRepository userCredentialRepository;
    private final RoleRepository roleRepository;

    @RabbitListener(queues = "${identity.mentor.verified.queue:identity.mentor.verified.queue}")
    @Transactional
    public void handleMentorVerified(Map<String, Object> event) {
        Object rawUserId = event.get("userId");
        if (rawUserId == null) {
            log.warn("Mentor verified event missing userId: {}", event);
            return;
        }

        try {
            UUID userId = UUID.fromString(String.valueOf(rawUserId));
            Object rawVerified = event.get("verified");
            boolean verified = rawVerified != null && Boolean.parseBoolean(String.valueOf(rawVerified));

            if (verified) {
                grantMentorRole(userId);
            } else {
                revokeMentorRole(userId);
            }
        } catch (IllegalArgumentException e) {
            log.warn("Mentor verified event has invalid userId: {}", rawUserId);
        }
    }

    private void grantMentorRole(UUID userId) {
        UserCredential user = userCredentialRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("Mentor verified for unknown user, skipping role grant: {}", userId);
            return;
        }

        boolean alreadyMentor = user.getRoles().stream()
                .anyMatch(role -> MENTOR_ROLE.equals(role.getName()));
        if (alreadyMentor) {
            log.info("User {} already has {} role", userId, MENTOR_ROLE);
            return;
        }

        Role mentorRole = roleRepository.findByName(MENTOR_ROLE).orElse(null);
        if (mentorRole == null) {
            log.warn("Role {} is not seeded — cannot grant it to user {}", MENTOR_ROLE, userId);
            return;
        }
        user.getRoles().add(mentorRole);
        userCredentialRepository.save(user);
        log.info("Granted {} role to user {} after admin approval", MENTOR_ROLE, userId);
    }

    private void revokeMentorRole(UUID userId) {
        UserCredential user = userCredentialRepository.findById(userId).orElse(null);
        if (user == null) {
            return;
        }
        boolean removed = user.getRoles().removeIf(role -> MENTOR_ROLE.equals(role.getName()));
        if (removed) {
            userCredentialRepository.save(user);
            log.info("Removed {} role from user {} (application rejected)", MENTOR_ROLE, userId);
        }
    }
}
