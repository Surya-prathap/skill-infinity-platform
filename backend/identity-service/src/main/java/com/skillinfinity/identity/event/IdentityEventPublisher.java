package com.skillinfinity.identity.event;

import com.skillinfinity.identity.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;

/**
 * Publishes identity events to RabbitMQ so downstream services (notably the
 * admin-service) can keep their own user indexes in sync.
 *
 * <p>The admin-service's user management table is populated from these events:
 * {@code user.registered} creates the admin row and {@code user.updated}
 * keeps the role current when a learner becomes a mentor. Publishing is
 * best-effort and asynchronous — a slow or unavailable broker is logged and
 * never blocks the register/login request path.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class IdentityEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    /**
     * Dedicated executor (see {@code AsyncConfig}). The RabbitTemplate publish
     * is dispatched here so a broker that is slow to ack (memory pressure,
     * reconnecting) cannot add seconds to a register/login response.
     */
    @Qualifier("eventPublisherExecutor")
    private final Executor eventPublisherExecutor;

    public void publishUserRegistered(UUID userId, String email, String username, Set<String> roles) {
        publish(RabbitMQConfig.USER_REGISTERED_ROUTING_KEY, UserIdentityEvent.builder()
                .userId(userId)
                .email(email)
                .username(username)
                .roles(roles)
                .timestamp(LocalDateTime.now())
                .build());
    }

    public void publishUserUpdated(UUID userId, String email, String username, Set<String> roles) {
        publish(RabbitMQConfig.USER_UPDATED_ROUTING_KEY, UserIdentityEvent.builder()
                .userId(userId)
                .email(email)
                .username(username)
                .roles(roles)
                .timestamp(LocalDateTime.now())
                .build());
    }

    private void publish(String routingKey, Object event) {
        try {
            eventPublisherExecutor.execute(() -> {
                try {
                    rabbitTemplate.convertAndSend(RabbitMQConfig.ADMIN_EXCHANGE, routingKey, event);
                    log.info("Published {} event for user {}", routingKey,
                            event instanceof UserIdentityEvent u ? u.getUserId() : "?");
                } catch (Exception e) {
                    log.warn("Failed to publish {} event ({}). Continuing without it.", routingKey, e.getMessage());
                }
            });
        } catch (Exception e) {
            // Executor rejected the task (shutdown / saturated queue) — drop it.
            log.warn("Could not schedule {} event publish: {}", routingKey, e.getMessage());
        }
    }
}
