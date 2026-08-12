package com.skillinfinity.wallet.config;

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

    public static final String WALLET_EXCHANGE = "wallet.exchange";

    /** Exchange used by the payment service to publish purchase events. */
    public static final String PAYMENT_EXCHANGE = "payment.exchange";
    public static final String PAYMENT_CREDITS_PURCHASED_ROUTING_KEY = "payment.credits.purchased";
    public static final String PAYMENT_CREDITS_PURCHASED_QUEUE = "wallet.payment.credits.purchased.queue";

    /** Exchange used by the session service for lifecycle events. */
    public static final String SESSION_EXCHANGE = "session.exchange";
    public static final String SESSION_COMPLETED_ROUTING_KEY = "session.completed";
    public static final String SESSION_COMPLETED_QUEUE = "wallet.session.completed.queue";

    public static final String WALLET_CREDITED_QUEUE = "wallet.credited.queue";
    public static final String WALLET_DEBITED_QUEUE = "wallet.debited.queue";
    public static final String WALLET_CREDITS_PURCHASED_QUEUE = "wallet.credits.purchased.queue";
    public static final String WALLET_REFUND_COMPLETED_QUEUE = "wallet.refund.completed.queue";
    public static final String WALLET_FROZEN_QUEUE = "wallet.frozen.queue";
    public static final String WALLET_RELEASED_QUEUE = "wallet.released.queue";
    public static final String WALLET_REWARD_EARNED_QUEUE = "wallet.reward.earned.queue";
    public static final String WALLET_CREATED_QUEUE = "wallet.created.queue";

    public static final String WALLET_CREDITED_ROUTING_KEY = "wallet.credited";
    public static final String WALLET_DEBITED_ROUTING_KEY = "wallet.debited";
    public static final String WALLET_CREDITS_PURCHASED_ROUTING_KEY = "wallet.credits.purchased";
    public static final String WALLET_REFUND_COMPLETED_ROUTING_KEY = "wallet.refund.completed";
    public static final String WALLET_FROZEN_ROUTING_KEY = "wallet.frozen";
    public static final String WALLET_RELEASED_ROUTING_KEY = "wallet.released";
    public static final String WALLET_REWARD_EARNED_ROUTING_KEY = "wallet.reward.earned";
    public static final String WALLET_CREATED_ROUTING_KEY = "wallet.created";

    @Bean
    public DirectExchange walletExchange() {
        return new DirectExchange(WALLET_EXCHANGE);
    }

    @Bean
    public DirectExchange paymentExchange() {
        return new DirectExchange(PAYMENT_EXCHANGE);
    }

    @Bean
    public DirectExchange sessionExchange() {
        return new DirectExchange(SESSION_EXCHANGE);
    }

    @Bean
    public Queue sessionCompletedQueue() {
        return new Queue(SESSION_COMPLETED_QUEUE, true);
    }

    @Bean
    public Queue paymentCreditsPurchasedQueue() {
        return new Queue(PAYMENT_CREDITS_PURCHASED_QUEUE, true);
    }

    @Bean
    public Queue walletCreditedQueue() {
        return new Queue(WALLET_CREDITED_QUEUE, true);
    }

    @Bean
    public Queue walletDebitedQueue() {
        return new Queue(WALLET_DEBITED_QUEUE, true);
    }

    @Bean
    public Queue walletCreditsPurchasedQueue() {
        return new Queue(WALLET_CREDITS_PURCHASED_QUEUE, true);
    }

    @Bean
    public Queue walletRefundCompletedQueue() {
        return new Queue(WALLET_REFUND_COMPLETED_QUEUE, true);
    }

    @Bean
    public Queue walletFrozenQueue() {
        return new Queue(WALLET_FROZEN_QUEUE, true);
    }

    @Bean
    public Queue walletReleasedQueue() {
        return new Queue(WALLET_RELEASED_QUEUE, true);
    }

    @Bean
    public Queue walletRewardEarnedQueue() {
        return new Queue(WALLET_REWARD_EARNED_QUEUE, true);
    }

    @Bean
    public Queue walletCreatedQueue() {
        return new Queue(WALLET_CREATED_QUEUE, true);
    }

    @Bean
    public Binding sessionCompletedBinding() {
        return BindingBuilder.bind(sessionCompletedQueue())
                .to(sessionExchange())
                .with(SESSION_COMPLETED_ROUTING_KEY);
    }

    @Bean
    public Binding paymentCreditsPurchasedBinding() {
        return BindingBuilder.bind(paymentCreditsPurchasedQueue())
                .to(paymentExchange())
                .with(PAYMENT_CREDITS_PURCHASED_ROUTING_KEY);
    }

    @Bean
    public Binding walletCreditedBinding() {
        return BindingBuilder.bind(walletCreditedQueue())
                .to(walletExchange())
                .with(WALLET_CREDITED_ROUTING_KEY);
    }

    @Bean
    public Binding walletDebitedBinding() {
        return BindingBuilder.bind(walletDebitedQueue())
                .to(walletExchange())
                .with(WALLET_DEBITED_ROUTING_KEY);
    }

    @Bean
    public Binding walletCreditsPurchasedBinding() {
        return BindingBuilder.bind(walletCreditsPurchasedQueue())
                .to(walletExchange())
                .with(WALLET_CREDITS_PURCHASED_ROUTING_KEY);
    }

    @Bean
    public Binding walletRefundCompletedBinding() {
        return BindingBuilder.bind(walletRefundCompletedQueue())
                .to(walletExchange())
                .with(WALLET_REFUND_COMPLETED_ROUTING_KEY);
    }

    @Bean
    public Binding walletFrozenBinding() {
        return BindingBuilder.bind(walletFrozenQueue())
                .to(walletExchange())
                .with(WALLET_FROZEN_ROUTING_KEY);
    }

    @Bean
    public Binding walletReleasedBinding() {
        return BindingBuilder.bind(walletReleasedQueue())
                .to(walletExchange())
                .with(WALLET_RELEASED_ROUTING_KEY);
    }

    @Bean
    public Binding walletRewardEarnedBinding() {
        return BindingBuilder.bind(walletRewardEarnedQueue())
                .to(walletExchange())
                .with(WALLET_REWARD_EARNED_ROUTING_KEY);
    }

    @Bean
    public Binding walletCreatedBinding() {
        return BindingBuilder.bind(walletCreatedQueue())
                .to(walletExchange())
                .with(WALLET_CREATED_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
