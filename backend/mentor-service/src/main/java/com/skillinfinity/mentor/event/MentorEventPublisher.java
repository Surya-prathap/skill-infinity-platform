package com.skillinfinity.mentor.event;

import com.skillinfinity.mentor.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

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

        rabbitTemplate.convertAndSend(RabbitMQConfig.MENTOR_EXCHANGE,
                RabbitMQConfig.MENTOR_REGISTERED_ROUTING_KEY, event);
        log.info("Published MentorRegisteredEvent: mentorId={}", mentorId);
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

        rabbitTemplate.convertAndSend(RabbitMQConfig.MENTOR_EXCHANGE,
                RabbitMQConfig.MENTOR_PROFILE_UPDATED_ROUTING_KEY, event);
        log.info("Published MentorProfileUpdatedEvent: mentorId={}", mentorId);
    }

    public void publishMentorAvailabilityUpdated(UUID mentorId, UUID userId, int availabilityCount) {
        MentorAvailabilityUpdatedEvent event = MentorAvailabilityUpdatedEvent.builder()
                .mentorId(mentorId)
                .userId(userId)
                .availabilityCount(availabilityCount)
                .timestamp(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.MENTOR_EXCHANGE,
                RabbitMQConfig.MENTOR_AVAILABILITY_UPDATED_ROUTING_KEY, event);
        log.info("Published MentorAvailabilityUpdatedEvent: mentorId={}", mentorId);
    }

    public void publishMentorVerified(UUID mentorId, UUID userId, boolean verified) {
        MentorVerifiedEvent event = MentorVerifiedEvent.builder()
                .mentorId(mentorId)
                .userId(userId)
                .verified(verified)
                .timestamp(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.MENTOR_EXCHANGE,
                RabbitMQConfig.MENTOR_VERIFIED_ROUTING_KEY, event);
        log.info("Published MentorVerifiedEvent: mentorId={}, verified={}", mentorId, verified);
    }
}
