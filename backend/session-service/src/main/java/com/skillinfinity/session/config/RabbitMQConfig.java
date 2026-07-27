package com.skillinfinity.session.config;

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

    public static final String SESSION_EXCHANGE = "session.exchange";
    public static final String SESSION_BOOKED_QUEUE = "session.booked.queue";
    public static final String SESSION_APPROVED_QUEUE = "session.approved.queue";
    public static final String SESSION_REJECTED_QUEUE = "session.rejected.queue";
    public static final String SESSION_CANCELLED_QUEUE = "session.cancelled.queue";
    public static final String SESSION_COMPLETED_QUEUE = "session.completed.queue";
    public static final String SESSION_REMINDER_QUEUE = "session.reminder.queue";
    public static final String SESSION_RESCHEDULED_QUEUE = "session.rescheduled.queue";

    public static final String SESSION_BOOKED_ROUTING_KEY = "session.booked";
    public static final String SESSION_APPROVED_ROUTING_KEY = "session.approved";
    public static final String SESSION_REJECTED_ROUTING_KEY = "session.rejected";
    public static final String SESSION_CANCELLED_ROUTING_KEY = "session.cancelled";
    public static final String SESSION_COMPLETED_ROUTING_KEY = "session.completed";
    public static final String SESSION_REMINDER_ROUTING_KEY = "session.reminder";
    public static final String SESSION_RESCHEDULED_ROUTING_KEY = "session.rescheduled";

    @Bean
    public DirectExchange sessionExchange() {
        return new DirectExchange(SESSION_EXCHANGE);
    }

    @Bean
    public Queue sessionBookedQueue() {
        return new Queue(SESSION_BOOKED_QUEUE, true);
    }

    @Bean
    public Queue sessionApprovedQueue() {
        return new Queue(SESSION_APPROVED_QUEUE, true);
    }

    @Bean
    public Queue sessionRejectedQueue() {
        return new Queue(SESSION_REJECTED_QUEUE, true);
    }

    @Bean
    public Queue sessionCancelledQueue() {
        return new Queue(SESSION_CANCELLED_QUEUE, true);
    }

    @Bean
    public Queue sessionCompletedQueue() {
        return new Queue(SESSION_COMPLETED_QUEUE, true);
    }

    @Bean
    public Queue sessionReminderQueue() {
        return new Queue(SESSION_REMINDER_QUEUE, true);
    }

    @Bean
    public Queue sessionRescheduledQueue() {
        return new Queue(SESSION_RESCHEDULED_QUEUE, true);
    }

    @Bean
    public Binding sessionBookedBinding() {
        return BindingBuilder.bind(sessionBookedQueue())
                .to(sessionExchange())
                .with(SESSION_BOOKED_ROUTING_KEY);
    }

    @Bean
    public Binding sessionApprovedBinding() {
        return BindingBuilder.bind(sessionApprovedQueue())
                .to(sessionExchange())
                .with(SESSION_APPROVED_ROUTING_KEY);
    }

    @Bean
    public Binding sessionRejectedBinding() {
        return BindingBuilder.bind(sessionRejectedQueue())
                .to(sessionExchange())
                .with(SESSION_REJECTED_ROUTING_KEY);
    }

    @Bean
    public Binding sessionCancelledBinding() {
        return BindingBuilder.bind(sessionCancelledQueue())
                .to(sessionExchange())
                .with(SESSION_CANCELLED_ROUTING_KEY);
    }

    @Bean
    public Binding sessionCompletedBinding() {
        return BindingBuilder.bind(sessionCompletedQueue())
                .to(sessionExchange())
                .with(SESSION_COMPLETED_ROUTING_KEY);
    }

    @Bean
    public Binding sessionReminderBinding() {
        return BindingBuilder.bind(sessionReminderQueue())
                .to(sessionExchange())
                .with(SESSION_REMINDER_ROUTING_KEY);
    }

    @Bean
    public Binding sessionRescheduledBinding() {
        return BindingBuilder.bind(sessionRescheduledQueue())
                .to(sessionExchange())
                .with(SESSION_RESCHEDULED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
