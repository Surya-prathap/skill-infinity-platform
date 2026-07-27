package com.skillinfinity.payment.event;

import com.skillinfinity.payment.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishPaymentInitiated(UUID paymentId, UUID userId, String paymentNumber,
                                         BigDecimal amount, String currency, String gateway,
                                         String description) {
        PaymentInitiatedEvent event = PaymentInitiatedEvent.builder()
                .paymentId(paymentId)
                .userId(userId)
                .paymentNumber(paymentNumber)
                .amount(amount)
                .currency(currency)
                .gateway(gateway)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE,
                RabbitMQConfig.PAYMENT_INITIATED_ROUTING_KEY, event);
        log.info("Published PaymentInitiatedEvent: paymentId={}, amount={}", paymentId, amount);
    }

    public void publishPaymentCompleted(UUID paymentId, UUID userId, String paymentNumber,
                                         BigDecimal amount, BigDecimal credits, String currency,
                                         String gatewayPaymentId, String gatewayOrderId,
                                         String description) {
        PaymentCompletedEvent event = PaymentCompletedEvent.builder()
                .paymentId(paymentId)
                .userId(userId)
                .paymentNumber(paymentNumber)
                .amount(amount)
                .credits(credits)
                .currency(currency)
                .gatewayPaymentId(gatewayPaymentId)
                .gatewayOrderId(gatewayOrderId)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE,
                RabbitMQConfig.PAYMENT_COMPLETED_ROUTING_KEY, event);
        log.info("Published PaymentCompletedEvent: paymentId={}, amount={}", paymentId, amount);
    }

    public void publishPaymentFailed(UUID paymentId, UUID userId, String paymentNumber,
                                      BigDecimal amount, String failureReason, String failureCode) {
        PaymentFailedEvent event = PaymentFailedEvent.builder()
                .paymentId(paymentId)
                .userId(userId)
                .paymentNumber(paymentNumber)
                .amount(amount)
                .failureReason(failureReason)
                .failureCode(failureCode)
                .timestamp(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE,
                RabbitMQConfig.PAYMENT_FAILED_ROUTING_KEY, event);
        log.info("Published PaymentFailedEvent: paymentId={}, reason={}", paymentId, failureReason);
    }

    public void publishRefundCompleted(UUID refundId, UUID paymentId, UUID userId,
                                        String refundNumber, BigDecimal refundAmount, String reason) {
        RefundCompletedEvent event = RefundCompletedEvent.builder()
                .refundId(refundId)
                .paymentId(paymentId)
                .userId(userId)
                .refundNumber(refundNumber)
                .refundAmount(refundAmount)
                .reason(reason)
                .timestamp(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE,
                RabbitMQConfig.REFUND_COMPLETED_ROUTING_KEY, event);
        log.info("Published RefundCompletedEvent: refundId={}, amount={}", refundId, refundAmount);
    }

    public void publishCreditsPurchased(UUID paymentId, UUID userId, String paymentNumber,
                                         BigDecimal amount, BigDecimal credits,
                                         String gateway, String gatewayPaymentId) {
        CreditsPurchasedEvent event = CreditsPurchasedEvent.builder()
                .paymentId(paymentId)
                .userId(userId)
                .paymentNumber(paymentNumber)
                .amount(amount)
                .credits(credits)
                .gateway(gateway)
                .gatewayPaymentId(gatewayPaymentId)
                .timestamp(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE,
                RabbitMQConfig.CREDITS_PURCHASED_ROUTING_KEY, event);
        log.info("Published CreditsPurchasedEvent: paymentId={}, credits={}", paymentId, credits);
    }

    public void publishSubscriptionActivated(UUID subscriptionId, UUID userId, UUID planId,
                                              String planName, LocalDateTime startedAt,
                                              LocalDateTime expiresAt, Boolean autoRenew) {
        SubscriptionActivatedEvent event = SubscriptionActivatedEvent.builder()
                .subscriptionId(subscriptionId)
                .userId(userId)
                .planId(planId)
                .planName(planName)
                .startedAt(startedAt)
                .expiresAt(expiresAt)
                .autoRenew(autoRenew)
                .timestamp(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.PAYMENT_EXCHANGE,
                RabbitMQConfig.SUBSCRIPTION_ACTIVATED_ROUTING_KEY, event);
        log.info("Published SubscriptionActivatedEvent: subscriptionId={}, plan={}", subscriptionId, planName);
    }
}
