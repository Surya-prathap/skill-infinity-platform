package com.skillinfinity.mentor.config;

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

    public static final String MENTOR_EXCHANGE = "mentor.exchange";
    public static final String MENTOR_REGISTERED_QUEUE = "mentor.registered.queue";
    public static final String MENTOR_PROFILE_UPDATED_QUEUE = "mentor.profile.updated.queue";
    public static final String MENTOR_AVAILABILITY_UPDATED_QUEUE = "mentor.availability.updated.queue";
    public static final String MENTOR_VERIFIED_QUEUE = "mentor.verified.queue";
    public static final String MENTOR_REGISTERED_ROUTING_KEY = "mentor.registered";
    public static final String MENTOR_PROFILE_UPDATED_ROUTING_KEY = "mentor.profile.updated";
    public static final String MENTOR_AVAILABILITY_UPDATED_ROUTING_KEY = "mentor.availability.updated";
    public static final String MENTOR_VERIFIED_ROUTING_KEY = "mentor.verified";

    @Bean
    public DirectExchange mentorExchange() {
        return new DirectExchange(MENTOR_EXCHANGE);
    }

    @Bean
    public Queue mentorRegisteredQueue() {
        return new Queue(MENTOR_REGISTERED_QUEUE, true);
    }

    @Bean
    public Queue mentorProfileUpdatedQueue() {
        return new Queue(MENTOR_PROFILE_UPDATED_QUEUE, true);
    }

    @Bean
    public Queue mentorAvailabilityUpdatedQueue() {
        return new Queue(MENTOR_AVAILABILITY_UPDATED_QUEUE, true);
    }

    @Bean
    public Queue mentorVerifiedQueue() {
        return new Queue(MENTOR_VERIFIED_QUEUE, true);
    }

    @Bean
    public Binding mentorRegisteredBinding() {
        return BindingBuilder.bind(mentorRegisteredQueue())
                .to(mentorExchange())
                .with(MENTOR_REGISTERED_ROUTING_KEY);
    }

    @Bean
    public Binding mentorProfileUpdatedBinding() {
        return BindingBuilder.bind(mentorProfileUpdatedQueue())
                .to(mentorExchange())
                .with(MENTOR_PROFILE_UPDATED_ROUTING_KEY);
    }

    @Bean
    public Binding mentorAvailabilityUpdatedBinding() {
        return BindingBuilder.bind(mentorAvailabilityUpdatedQueue())
                .to(mentorExchange())
                .with(MENTOR_AVAILABILITY_UPDATED_ROUTING_KEY);
    }

    @Bean
    public Binding mentorVerifiedBinding() {
        return BindingBuilder.bind(mentorVerifiedQueue())
                .to(mentorExchange())
                .with(MENTOR_VERIFIED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
