package com.skillinfinity.admin.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ADMIN_EXCHANGE = "admin.exchange";

    // Admin event queues
    public static final String ADMIN_ANNOUNCEMENT_QUEUE = "admin.announcement.queue";
    public static final String PLATFORM_SETTING_CHANGED_QUEUE = "admin.setting.changed.queue";

    // Admin event routing keys
    public static final String ADMIN_ANNOUNCEMENT_ROUTING_KEY = "admin.announcement";
    public static final String PLATFORM_SETTING_CHANGED_ROUTING_KEY = "admin.setting.changed";

    // External event queues consumed by admin service (for analytics & audit)
    public static final String USER_REGISTERED_QUEUE = "admin.user.registered.queue";
    public static final String PAYMENT_COMPLETED_QUEUE = "admin.payment.completed.queue";
    public static final String SESSION_COMPLETED_QUEUE = "admin.session.completed.queue";
    public static final String REVIEW_CREATED_QUEUE = "admin.review.created.queue";

    // External routing keys
    public static final String USER_REGISTERED_ROUTING_KEY = "user.registered";
    public static final String PAYMENT_COMPLETED_ROUTING_KEY = "payment.completed";
    public static final String SESSION_COMPLETED_ROUTING_KEY = "session.completed";
    public static final String REVIEW_CREATED_ROUTING_KEY = "review.created";

    @Bean
    public DirectExchange adminExchange() {
        return new DirectExchange(ADMIN_EXCHANGE);
    }

    @Bean
    public Queue adminAnnouncementQueue() {
        return new Queue(ADMIN_ANNOUNCEMENT_QUEUE, true);
    }

    @Bean
    public Queue platformSettingChangedQueue() {
        return new Queue(PLATFORM_SETTING_CHANGED_QUEUE, true);
    }

    @Bean
    public Binding adminAnnouncementBinding() {
        return BindingBuilder.bind(adminAnnouncementQueue())
                .to(adminExchange())
                .with(ADMIN_ANNOUNCEMENT_ROUTING_KEY);
    }

    @Bean
    public Binding platformSettingChangedBinding() {
        return BindingBuilder.bind(platformSettingChangedQueue())
                .to(adminExchange())
                .with(PLATFORM_SETTING_CHANGED_ROUTING_KEY);
    }

    // External event queues
    @Bean
    public Queue userRegisteredQueue() {
        return new Queue(USER_REGISTERED_QUEUE, true);
    }

    @Bean
    public Queue paymentCompletedQueue() {
        return new Queue(PAYMENT_COMPLETED_QUEUE, true);
    }

    @Bean
    public Queue sessionCompletedQueue() {
        return new Queue(SESSION_COMPLETED_QUEUE, true);
    }

    @Bean
    public Queue reviewCreatedQueue() {
        return new Queue(REVIEW_CREATED_QUEUE, true);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
