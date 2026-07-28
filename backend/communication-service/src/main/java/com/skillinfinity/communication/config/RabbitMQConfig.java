package com.skillinfinity.communication.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String COMMUNICATION_EXCHANGE = "communication.exchange";
    public static final String NOTIFICATION_SENT_QUEUE = "communication.notification.sent.queue";
    public static final String EMAIL_SENT_QUEUE = "communication.email.sent.queue";
    public static final String PUSH_SENT_QUEUE = "communication.push.sent.queue";

    public static final String NOTIFICATION_SENT_ROUTING_KEY = "communication.notification.sent";
    public static final String EMAIL_SENT_ROUTING_KEY = "communication.email.sent";
    public static final String PUSH_SENT_ROUTING_KEY = "communication.push.sent";

    // External event queues consumed by communication service
    public static final String USER_REGISTERED_QUEUE = "communication.user.registered.queue";
    public static final String SESSION_BOOKED_QUEUE = "communication.session.booked.queue";
    public static final String SESSION_APPROVED_QUEUE = "communication.session.approved.queue";
    public static final String SESSION_CANCELLED_QUEUE = "communication.session.cancelled.queue";
    public static final String PAYMENT_COMPLETED_QUEUE = "communication.payment.completed.queue";
    public static final String WALLET_CREDITED_QUEUE = "communication.wallet.credited.queue";
    public static final String SUBSCRIPTION_ACTIVATED_QUEUE = "communication.subscription.activated.queue";

    public static final String USER_REGISTERED_ROUTING_KEY = "user.registered";
    public static final String SESSION_BOOKED_ROUTING_KEY = "session.booked";
    public static final String SESSION_APPROVED_ROUTING_KEY = "session.approved";
    public static final String SESSION_CANCELLED_ROUTING_KEY = "session.cancelled";
    public static final String PAYMENT_COMPLETED_ROUTING_KEY = "payment.completed";
    public static final String WALLET_CREDITED_ROUTING_KEY = "wallet.credited";
    public static final String SUBSCRIPTION_ACTIVATED_ROUTING_KEY = "subscription.activated";

    @Bean
    public DirectExchange communicationExchange() {
        return new DirectExchange(COMMUNICATION_EXCHANGE);
    }

    @Bean
    public Queue notificationSentQueue() {
        return new Queue(NOTIFICATION_SENT_QUEUE, true);
    }

    @Bean
    public Queue emailSentQueue() {
        return new Queue(EMAIL_SENT_QUEUE, true);
    }

    @Bean
    public Queue pushSentQueue() {
        return new Queue(PUSH_SENT_QUEUE, true);
    }

    @Bean
    public Binding notificationSentBinding() {
        return BindingBuilder.bind(notificationSentQueue())
                .to(communicationExchange())
                .with(NOTIFICATION_SENT_ROUTING_KEY);
    }

    @Bean
    public Binding emailSentBinding() {
        return BindingBuilder.bind(emailSentQueue())
                .to(communicationExchange())
                .with(EMAIL_SENT_ROUTING_KEY);
    }

    @Bean
    public Binding pushSentBinding() {
        return BindingBuilder.bind(pushSentQueue())
                .to(communicationExchange())
                .with(PUSH_SENT_ROUTING_KEY);
    }

    // External event queues
    @Bean
    public Queue userRegisteredQueue() {
        return new Queue(USER_REGISTERED_QUEUE, true);
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
    public Queue sessionCancelledQueue() {
        return new Queue(SESSION_CANCELLED_QUEUE, true);
    }

    @Bean
    public Queue paymentCompletedQueue() {
        return new Queue(PAYMENT_COMPLETED_QUEUE, true);
    }

    @Bean
    public Queue walletCreditedQueue() {
        return new Queue(WALLET_CREDITED_QUEUE, true);
    }

    @Bean
    public Queue subscriptionActivatedQueue() {
        return new Queue(SUBSCRIPTION_ACTIVATED_QUEUE, true);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
