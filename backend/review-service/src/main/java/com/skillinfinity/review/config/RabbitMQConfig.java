package com.skillinfinity.review.config;

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

    public static final String REVIEW_EXCHANGE = "review.exchange";

    // Review event queues
    public static final String REVIEW_CREATED_QUEUE = "review.created.queue";
    public static final String REVIEW_UPDATED_QUEUE = "review.updated.queue";
    public static final String REVIEW_DELETED_QUEUE = "review.deleted.queue";
    public static final String REVIEW_REPORTED_QUEUE = "review.reported.queue";

    // Review event routing keys
    public static final String REVIEW_CREATED_ROUTING_KEY = "review.created";
    public static final String REVIEW_UPDATED_ROUTING_KEY = "review.updated";
    public static final String REVIEW_DELETED_ROUTING_KEY = "review.deleted";
    public static final String REVIEW_REPORTED_ROUTING_KEY = "review.reported";

    // External event queues consumed by review service
    public static final String SESSION_COMPLETED_QUEUE = "review.session.completed.queue";
    public static final String USER_REGISTERED_QUEUE = "review.user.registered.queue";
    public static final String MENTOR_REGISTERED_QUEUE = "review.mentor.registered.queue";

    // External routing keys
    public static final String SESSION_COMPLETED_ROUTING_KEY = "session.completed";
    public static final String USER_REGISTERED_ROUTING_KEY = "user.registered";
    public static final String MENTOR_REGISTERED_ROUTING_KEY = "mentor.registered";

    @Bean
    public DirectExchange reviewExchange() {
        return new DirectExchange(REVIEW_EXCHANGE);
    }

    @Bean
    public Queue reviewCreatedQueue() {
        return new Queue(REVIEW_CREATED_QUEUE, true);
    }

    @Bean
    public Queue reviewUpdatedQueue() {
        return new Queue(REVIEW_UPDATED_QUEUE, true);
    }

    @Bean
    public Queue reviewDeletedQueue() {
        return new Queue(REVIEW_DELETED_QUEUE, true);
    }

    @Bean
    public Queue reviewReportedQueue() {
        return new Queue(REVIEW_REPORTED_QUEUE, true);
    }

    @Bean
    public Binding reviewCreatedBinding() {
        return BindingBuilder.bind(reviewCreatedQueue())
                .to(reviewExchange())
                .with(REVIEW_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding reviewUpdatedBinding() {
        return BindingBuilder.bind(reviewUpdatedQueue())
                .to(reviewExchange())
                .with(REVIEW_UPDATED_ROUTING_KEY);
    }

    @Bean
    public Binding reviewDeletedBinding() {
        return BindingBuilder.bind(reviewDeletedQueue())
                .to(reviewExchange())
                .with(REVIEW_DELETED_ROUTING_KEY);
    }

    @Bean
    public Binding reviewReportedBinding() {
        return BindingBuilder.bind(reviewReportedQueue())
                .to(reviewExchange())
                .with(REVIEW_REPORTED_ROUTING_KEY);
    }

    // External event queues
    @Bean
    public Queue sessionCompletedQueue() {
        return new Queue(SESSION_COMPLETED_QUEUE, true);
    }

    @Bean
    public Queue userRegisteredQueue() {
        return new Queue(USER_REGISTERED_QUEUE, true);
    }

    @Bean
    public Queue mentorRegisteredQueue() {
        return new Queue(MENTOR_REGISTERED_QUEUE, true);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
