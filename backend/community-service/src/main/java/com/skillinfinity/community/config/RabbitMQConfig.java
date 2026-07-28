package com.skillinfinity.community.config;

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

    public static final String COMMUNITY_EXCHANGE = "community.exchange";
    public static final String POST_CREATED_QUEUE = "community.post.created.queue";
    public static final String COMMENT_CREATED_QUEUE = "community.comment.created.queue";

    public static final String POST_CREATED_ROUTING_KEY = "community.post.created";
    public static final String COMMENT_CREATED_ROUTING_KEY = "community.comment.created";

    // External event queues consumed by community service
    public static final String SESSION_COMPLETED_QUEUE = "community.session.completed.queue";
    public static final String USER_REGISTERED_QUEUE = "community.user.registered.queue";
    public static final String MENTOR_REGISTERED_QUEUE = "community.mentor.registered.queue";

    public static final String SESSION_COMPLETED_ROUTING_KEY = "session.completed";
    public static final String USER_REGISTERED_ROUTING_KEY = "user.registered";
    public static final String MENTOR_REGISTERED_ROUTING_KEY = "mentor.registered";

    @Bean
    public DirectExchange communityExchange() {
        return new DirectExchange(COMMUNITY_EXCHANGE);
    }

    @Bean
    public Queue postCreatedQueue() {
        return new Queue(POST_CREATED_QUEUE, true);
    }

    @Bean
    public Queue commentCreatedQueue() {
        return new Queue(COMMENT_CREATED_QUEUE, true);
    }

    @Bean
    public Binding postCreatedBinding() {
        return BindingBuilder.bind(postCreatedQueue())
                .to(communityExchange())
                .with(POST_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding commentCreatedBinding() {
        return BindingBuilder.bind(commentCreatedQueue())
                .to(communityExchange())
                .with(COMMENT_CREATED_ROUTING_KEY);
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
