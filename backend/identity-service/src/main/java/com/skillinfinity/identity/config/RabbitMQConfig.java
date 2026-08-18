package com.skillinfinity.identity.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ topology for the identity-service.
 *
 * <p>Declares the identity-service's OWN durable queue for the
 * {@code mentor.verified} routing key on the mentor-service exchange. Each
 * consumer service keeps a private queue bound to the shared exchange, so the
 * identity-service receives every mentor verification event and can grant or
 * revoke {@code ROLE_MENTOR} accordingly.
 *
 * <p>It also declares the admin-service's exchange so the identity-service can
 * announce user registrations / role changes to the admin user index.
 */
@Configuration
public class RabbitMQConfig {

    /** Matches the exchange declared by mentor-service. */
    public static final String MENTOR_EXCHANGE = "mentor.exchange";
    /** Matches the routing key published by mentor-service on verify. */
    public static final String MENTOR_VERIFIED_ROUTING_KEY = "mentor.verified";
    /** Identity-service private queue (mirrors the sibling-service naming pattern). */
    public static final String IDENTITY_MENTOR_VERIFIED_QUEUE = "identity.mentor.verified.queue";

    /** Matches the exchange declared by admin-service. */
    public static final String ADMIN_EXCHANGE = "admin.exchange";
    /** Routing keys admin-service binds its queues to. */
    public static final String USER_REGISTERED_ROUTING_KEY = "user.registered";
    public static final String USER_UPDATED_ROUTING_KEY = "user.updated";

    @Bean
    public DirectExchange mentorExchange() {
        return new DirectExchange(MENTOR_EXCHANGE);
    }

    @Bean
    public DirectExchange adminExchange() {
        return new DirectExchange(ADMIN_EXCHANGE);
    }

    @Bean
    public Queue identityMentorVerifiedQueue() {
        return new Queue(IDENTITY_MENTOR_VERIFIED_QUEUE, true);
    }

    @Bean
    public Binding identityMentorVerifiedBinding() {
        return BindingBuilder.bind(identityMentorVerifiedQueue())
                .to(mentorExchange())
                .with(MENTOR_VERIFIED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
