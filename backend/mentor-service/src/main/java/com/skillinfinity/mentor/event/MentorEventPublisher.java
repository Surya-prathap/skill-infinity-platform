package com.skillinfinity.mentor.event;

import com.skillinfinity.mentor.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Publishes mentor domain events to RabbitMQ.
 *
 * <p>Event publishing is best-effort: a broker outage or a slow connection must
 * never block the core request (e.g. submitting a mentor application) or turn it
 * into an HTTP timeout. Failures are logged and the flow continues — downstream
 * services simply don't receive the event, which is safe for these notifications.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MentorEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishMentorRegistered(UUID mentorId, UUID userId, String email, String headline, String country) {
        MentorRegisteredEvent event = MentorRegisteredEvent.builder()
                .mentorId(mentorId)
                .userId(userId)
                .email(email)
                .headline(headline)
                .country(country)
                .timestamp(LocalDateTime.now())
                .build();

        publish(RabbitMQConfig.MENTOR_REGISTERED_ROUTING_KEY, event);
    }

    public void publishMentorProfileUpdated(UUID mentorId, UUID userId, String headline, String bio,
                                             String country, String city, String timezone,
                                             Integer yearsOfExperience, int profileCompletionPercentage) {
        MentorProfileUpdatedEvent event = MentorProfileUpdatedEvent.builder()
                .mentorId(mentorId)
                .userId(userId)
                .headline(headline)
                .bio(bio)
                .country(country)
                .city(city)
                .timezone(timezone)
                .yearsOfExperience(yearsOfExperience)
                .profileCompletionPercentage(profileCompletionPercentage)
                .timestamp(LocalDateTime.now())
                .build();

        publish(RabbitMQConfig.MENTOR_PROFILE_UPDATED_ROUTING_KEY, event);
    }

    public void publishMentorAvailabilityUpdated(UUID mentorId, UUID userId, int availabilityCount) {
        MentorAvailabilityUpdatedEvent event = MentorAvailabilityUpdatedEvent.builder()
                .mentorId(mentorId)
                .userId(userId)
                .availabilityCount(availabilityCount)
                .timestamp(LocalDateTime.now())
                .build();

        publish(RabbitMQConfig.MENTOR_AVAILABILITY_UPDATED_ROUTING_KEY, event);
    }

    public void publishMentorVerified(UUID mentorId, UUID userId, boolean verified) {
        MentorVerifiedEvent event = MentorVerifiedEvent.builder()
                .mentorId(mentorId)
                .userId(userId)
                .verified(verified)
                .timestamp(LocalDateTime.now())
                .build();

        publish(RabbitMQConfig.MENTOR_VERIFIED_ROUTING_KEY, event);
    }

    private void publish(String routingKey, Object event) {
        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.MENTOR_EXCHANGE, routingKey, event);
            log.info("Published {} event", routingKey);
        } catch (Exception e) {
            log.warn("Failed to publish {} event ({}). Continuing without it.", routingKey, e.getMessage());
        }
    }
}
