package com.skillinfinity.community.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class CommentEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishCommentCreated(CommunityCommentCreatedEvent event) {
        log.info("Publishing comment created event: {}", event.getEventId());
        rabbitTemplate.convertAndSend(
                "community.exchange",
                "community.comment.created",
                event
        );
    }
}
