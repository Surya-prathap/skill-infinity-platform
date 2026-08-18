package com.skillinfinity.payment.config;

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

    public static final String PAYMENT_EXCHANGE = "payment.exchange";

    public static final String PAYMENT_INITIATED_QUEUE = "payment.initiated.queue";
    public static final String PAYMENT_COMPLETED_QUEUE = "payment.completed.queue";
    public static final String PAYMENT_FAILED_QUEUE = "payment.failed.queue";
    public static final String REFUND_COMPLETED_QUEUE = "payment.refund.completed.queue";
    public static final String CREDITS_PURCHASED_QUEUE = "payment.credits.purchased.queue";
    public static final String SUBSCRIPTION_ACTIVATED_QUEUE = "payment.subscription.activated.queue";

    public static final String PAYMENT_INITIATED_ROUTING_KEY = "payment.initiated";
    public static final String PAYMENT_COMPLETED_ROUTING_KEY = "payment.completed";
    public static final String PAYMENT_FAILED_ROUTING_KEY = "payment.failed";
    public static final String REFUND_COMPLETED_ROUTING_KEY = "payment.refund.completed";
    public static final String CREDITS_PURCHASED_ROUTING_KEY = "payment.credits.purchased";
    public static final String SUBSCRIPTION_ACTIVATED_ROUTING_KEY = "payment.subscription.activated";

    @Bean
    public DirectExchange paymentExchange() {
        return new DirectExchange(PAYMENT_EXCHANGE);
    }

    @Bean
    public Queue paymentInitiatedQueue() {
        return new Queue(PAYMENT_INITIATED_QUEUE, true);
    }

    @Bean
    public Queue paymentCompletedQueue() {
        return new Queue(PAYMENT_COMPLETED_QUEUE, true);
    }

    @Bean
    public Queue paymentFailedQueue() {
        return new Queue(PAYMENT_FAILED_QUEUE, true);
    }

    @Bean
    public Queue refundCompletedQueue() {
        return new Queue(REFUND_COMPLETED_QUEUE, true);
    }

    @Bean
    public Queue creditsPurchasedQueue() {
        return new Queue(CREDITS_PURCHASED_QUEUE, true);
    }

    @Bean
    public Queue subscriptionActivatedQueue() {
        return new Queue(SUBSCRIPTION_ACTIVATED_QUEUE, true);
    }

    @Bean
    public Binding paymentInitiatedBinding() {
        return BindingBuilder.bind(paymentInitiatedQueue())
                .to(paymentExchange())
                .with(PAYMENT_INITIATED_ROUTING_KEY);
    }

    @Bean
    public Binding paymentCompletedBinding() {
        return BindingBuilder.bind(paymentCompletedQueue())
                .to(paymentExchange())
                .with(PAYMENT_COMPLETED_ROUTING_KEY);
    }

    @Bean
    public Binding paymentFailedBinding() {
        return BindingBuilder.bind(paymentFailedQueue())
                .to(paymentExchange())
                .with(PAYMENT_FAILED_ROUTING_KEY);
    }

    @Bean
    public Binding refundCompletedBinding() {
        return BindingBuilder.bind(refundCompletedQueue())
                .to(paymentExchange())
                .with(REFUND_COMPLETED_ROUTING_KEY);
    }

    @Bean
    public Binding creditsPurchasedBinding() {
        return BindingBuilder.bind(creditsPurchasedQueue())
                .to(paymentExchange())
                .with(CREDITS_PURCHASED_ROUTING_KEY);
    }

    @Bean
    public Binding subscriptionActivatedBinding() {
        return BindingBuilder.bind(subscriptionActivatedQueue())
                .to(paymentExchange())
                .with(SUBSCRIPTION_ACTIVATED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
