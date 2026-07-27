package com.skillinfinity.session.event;

import com.skillinfinity.session.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class SessionEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishSessionBooked(UUID sessionId, UUID mentorId, UUID learnerId,
                                      UUID bookingId, String mentorName, String learnerName,
                                      String topic, LocalDateTime startTime, LocalDateTime endTime,
                                      String timezone, int durationMinutes) {
        SessionEvent event = buildEvent("SESSION_BOOKED", sessionId, mentorId, learnerId,
                bookingId, mentorName, learnerName, topic, startTime, endTime, timezone,
                durationMinutes, null);
        publish(RabbitMQConfig.SESSION_BOOKED_ROUTING_KEY, event);
        log.info("Published session booked event: sessionId={}", sessionId);
    }

    public void publishSessionApproved(UUID sessionId, UUID mentorId, UUID learnerId,
                                        UUID bookingId, String mentorName, String learnerName,
                                        String topic, LocalDateTime startTime, LocalDateTime endTime,
                                        String timezone, int durationMinutes) {
        SessionEvent event = buildEvent("SESSION_APPROVED", sessionId, mentorId, learnerId,
                bookingId, mentorName, learnerName, topic, startTime, endTime, timezone,
                durationMinutes, null);
        publish(RabbitMQConfig.SESSION_APPROVED_ROUTING_KEY, event);
        log.info("Published session approved event: sessionId={}", sessionId);
    }

    public void publishSessionRejected(UUID sessionId, UUID mentorId, UUID learnerId,
                                        UUID bookingId, String mentorName, String learnerName,
                                        String topic, String reason) {
        SessionEvent event = buildEvent("SESSION_REJECTED", sessionId, mentorId, learnerId,
                bookingId, mentorName, learnerName, topic, null, null, null, 0, reason);
        publish(RabbitMQConfig.SESSION_REJECTED_ROUTING_KEY, event);
        log.info("Published session rejected event: sessionId={}", sessionId);
    }

    public void publishSessionCancelled(UUID sessionId, UUID mentorId, UUID learnerId,
                                         UUID bookingId, String mentorName, String learnerName,
                                         String topic, String reason) {
        SessionEvent event = buildEvent("SESSION_CANCELLED", sessionId, mentorId, learnerId,
                bookingId, mentorName, learnerName, topic, null, null, null, 0, reason);
        publish(RabbitMQConfig.SESSION_CANCELLED_ROUTING_KEY, event);
        log.info("Published session cancelled event: sessionId={}", sessionId);
    }

    public void publishSessionCompleted(UUID sessionId, UUID mentorId, UUID learnerId,
                                         UUID bookingId, String mentorName, String learnerName,
                                         String topic) {
        SessionEvent event = buildEvent("SESSION_COMPLETED", sessionId, mentorId, learnerId,
                bookingId, mentorName, learnerName, topic, null, null, null, 0, null);
        publish(RabbitMQConfig.SESSION_COMPLETED_ROUTING_KEY, event);
        log.info("Published session completed event: sessionId={}", sessionId);
    }

    public void publishSessionReminder(UUID sessionId, UUID mentorId, UUID learnerId,
                                        LocalDateTime startTime, String timezone) {
        SessionEvent event = buildEvent("SESSION_REMINDER", sessionId, mentorId, learnerId,
                null, null, null, null, startTime, null, timezone, 0, null);
        publish(RabbitMQConfig.SESSION_REMINDER_ROUTING_KEY, event);
        log.info("Published session reminder event: sessionId={}", sessionId);
    }

    public void publishSessionRescheduled(UUID sessionId, UUID mentorId, UUID learnerId,
                                           UUID bookingId, String mentorName, String learnerName,
                                           String topic, LocalDateTime startTime, LocalDateTime endTime,
                                           String timezone, int durationMinutes, String reason) {
        SessionEvent event = buildEvent("SESSION_RESCHEDULED", sessionId, mentorId, learnerId,
                bookingId, mentorName, learnerName, topic, startTime, endTime, timezone,
                durationMinutes, reason);
        publish(RabbitMQConfig.SESSION_RESCHEDULED_ROUTING_KEY, event);
        log.info("Published session rescheduled event: sessionId={}", sessionId);
    }

    private void publish(String routingKey, SessionEvent event) {
        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.SESSION_EXCHANGE, routingKey, event);
        } catch (Exception e) {
            log.error("Failed to publish event: routingKey={}, sessionId={}", routingKey, event.getSessionId(), e);
        }
    }

    private SessionEvent buildEvent(String eventType, UUID sessionId, UUID mentorId, UUID learnerId,
                                     UUID bookingId, String mentorName, String learnerName,
                                     String topic, LocalDateTime startTime, LocalDateTime endTime,
                                     String timezone, int durationMinutes, String reason) {
        return SessionEvent.builder()
                .eventType(eventType)
                .sessionId(sessionId)
                .mentorId(mentorId)
                .learnerId(learnerId)
                .bookingId(bookingId)
                .mentorName(mentorName)
                .learnerName(learnerName)
                .topic(topic)
                .startTime(startTime)
                .endTime(endTime)
                .timezone(timezone)
                .durationMinutes(durationMinutes)
                .reason(reason)
                .timestamp(LocalDateTime.now())
                .source("session-service")
                .correlationId(UUID.randomUUID().toString())
                .build();
    }
}
