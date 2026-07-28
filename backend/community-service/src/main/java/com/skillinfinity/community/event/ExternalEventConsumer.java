package com.skillinfinity.community.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExternalEventConsumer {

    @RabbitListener(queues = "${community.session.completed.queue:community.session.completed.queue}")
    public void handleSessionCompletedEvent(Map<String, Object> event) {
        log.info("Received session completed event: {}", event.get("eventId"));
        // Future: trigger community discussion about session
    }

    @RabbitListener(queues = "${community.user.registered.queue:community.user.registered.queue}")
    public void handleUserRegisteredEvent(Map<String, Object> event) {
        log.info("Received user registered event: {}", event.get("eventId"));
        // Future: auto-join default community
    }

    @RabbitListener(queues = "${community.mentor.registered.queue:community.mentor.registered.queue}")
    public void handleMentorRegisteredEvent(Map<String, Object> event) {
        log.info("Received mentor registered event: {}", event.get("eventId"));
        // Future: auto-join mentor community
    }
}
