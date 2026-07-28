package com.skillinfinity.communication.event;

import com.skillinfinity.common.constant.ServiceConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class CommunicationEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishNotificationSent(NotificationSentEvent event) {
        log.info("Publishing notification sent event: {}", event.getEventId());
        rabbitTemplate.convertAndSend(
                "communication.exchange",
                "communication.notification.sent",
                event
        );
    }

    public void publishEmailSent(EmailSentEvent event) {
        log.info("Publishing email sent event: {}", event.getEventId());
        rabbitTemplate.convertAndSend(
                "communication.exchange",
                "communication.email.sent",
                event
        );
    }

    public void publishPushSent(PushSentEvent event) {
        log.info("Publishing push sent event: {}", event.getEventId());
        rabbitTemplate.convertAndSend(
                "communication.exchange",
                "communication.push.sent",
                event
        );
    }
}
