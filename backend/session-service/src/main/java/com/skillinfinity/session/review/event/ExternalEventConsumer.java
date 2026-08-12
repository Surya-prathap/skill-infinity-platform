package com.skillinfinity.session.review.event;

import com.skillinfinity.session.review.entity.CompletedSession;
import com.skillinfinity.session.review.repository.CompletedSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Consumes session-completed events so reviews can be written only for
 * sessions that actually completed. The queue lives on the session.exchange
 * (same broker hop the session-service itself publishes to), which is what
 * makes this pipeline work now that reviews are hosted by the session-service.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ExternalEventConsumer {

    private final CompletedSessionRepository completedSessionRepository;

    @SuppressWarnings("unchecked")
    @RabbitListener(queues = "${review.session.completed.queue:review.session.completed.queue}")
    public void handleSessionCompletedEvent(Map<String, Object> event) {
        log.info("Received session completed event: {}", event.get("eventId"));
        try {
            String sessionIdStr = extractString(event, "sessionId");
            String mentorIdStr = extractString(event, "mentorId");
            String learnerIdStr = extractString(event, "learnerId");

            if (sessionIdStr != null && mentorIdStr != null && learnerIdStr != null) {
                CompletedSession completedSession = CompletedSession.builder()
                        .sessionId(UUID.fromString(sessionIdStr))
                        .mentorId(UUID.fromString(mentorIdStr))
                        .learnerId(UUID.fromString(learnerIdStr))
                        .completedAt(LocalDateTime.now())
                        .build();
                completedSessionRepository.save(completedSession);
                log.info("Stored completed session: {}", sessionIdStr);
            }
        } catch (Exception e) {
            log.error("Failed to process session completed event: {}", e.getMessage());
        }
    }

    private String extractString(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof String) {
            return (String) value;
        }
        if (value != null) {
            return value.toString();
        }
        return null;
    }
}
