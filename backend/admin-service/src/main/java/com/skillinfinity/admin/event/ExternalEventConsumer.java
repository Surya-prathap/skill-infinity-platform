package com.skillinfinity.admin.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExternalEventConsumer {

    @RabbitListener(queues = "${admin.user.registered.queue:admin.user.registered.queue}")
    public void handleUserRegisteredEvent(Map<String, Object> event) {
        log.info("Received user registered event: {}", event.get("eventId"));
    }

    @RabbitListener(queues = "${admin.payment.completed.queue:admin.payment.completed.queue}")
    public void handlePaymentCompletedEvent(Map<String, Object> event) {
        log.info("Received payment completed event: {}", event.get("eventId"));
    }

    @RabbitListener(queues = "${admin.session.completed.queue:admin.session.completed.queue}")
    public void handleSessionCompletedEvent(Map<String, Object> event) {
        log.info("Received session completed event: {}", event.get("eventId"));
    }

    @RabbitListener(queues = "${admin.review.created.queue:admin.review.created.queue}")
    public void handleReviewCreatedEvent(Map<String, Object> event) {
        log.info("Received review created event: {}", event.get("eventId"));
    }
}
