package com.skillinfinity.wallet.event;

import com.skillinfinity.wallet.config.RabbitMQConfig;
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
public class WalletEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishWalletCredited(UUID walletId, UUID userId, UUID transactionId,
                                       String transactionNumber, BigDecimal amount,
                                       BigDecimal balanceAfter, String description,
                                       String referenceId, String referenceType) {
        WalletCreditedEvent event = WalletCreditedEvent.builder()
                .walletId(walletId)
                .userId(userId)
                .transactionId(transactionId)
                .transactionNumber(transactionNumber)
                .amount(amount)
                .balanceAfter(balanceAfter)
                .description(description)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .timestamp(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.WALLET_EXCHANGE,
                RabbitMQConfig.WALLET_CREDITED_ROUTING_KEY, event);
        log.info("Published WalletCreditedEvent: walletId={}, amount={}", walletId, amount);
    }

    public void publishWalletDebited(UUID walletId, UUID userId, UUID transactionId,
                                      String transactionNumber, BigDecimal amount,
                                      BigDecimal balanceAfter, String description,
                                      String referenceId, UUID sessionId, UUID mentorId) {
        WalletDebitedEvent event = WalletDebitedEvent.builder()
                .walletId(walletId)
                .userId(userId)
                .transactionId(transactionId)
                .transactionNumber(transactionNumber)
                .amount(amount)
                .balanceAfter(balanceAfter)
                .description(description)
                .referenceId(referenceId)
                .sessionId(sessionId)
                .mentorId(mentorId)
                .timestamp(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.WALLET_EXCHANGE,
                RabbitMQConfig.WALLET_DEBITED_ROUTING_KEY, event);
        log.info("Published WalletDebitedEvent: walletId={}, amount={}", walletId, amount);
    }

    public void publishCreditsPurchased(UUID walletId, UUID userId, UUID transactionId,
                                         String transactionNumber, BigDecimal amount,
                                         String paymentGatewayRef, BigDecimal balanceAfter) {
        CreditsPurchasedEvent event = CreditsPurchasedEvent.builder()
                .walletId(walletId)
                .userId(userId)
                .transactionId(transactionId)
                .transactionNumber(transactionNumber)
                .amount(amount)
                .paymentGatewayRef(paymentGatewayRef)
                .balanceAfter(balanceAfter)
                .timestamp(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.WALLET_EXCHANGE,
                RabbitMQConfig.WALLET_CREDITS_PURCHASED_ROUTING_KEY, event);
        log.info("Published CreditsPurchasedEvent: walletId={}, amount={}", walletId, amount);
    }

    public void publishRefundCompleted(UUID walletId, UUID userId, UUID originalTransactionId,
                                        UUID refundTransactionId, BigDecimal refundAmount,
                                        String reason, BigDecimal balanceAfter) {
        RefundCompletedEvent event = RefundCompletedEvent.builder()
                .walletId(walletId)
                .userId(userId)
                .originalTransactionId(originalTransactionId)
                .refundTransactionId(refundTransactionId)
                .refundAmount(refundAmount)
                .reason(reason)
                .balanceAfter(balanceAfter)
                .timestamp(LocalDateTime.now())
                .build();

        rabbitTemplate.convertAndSend(RabbitMQConfig.WALLET_EXCHANGE,
                RabbitMQConfig.WALLET_REFUND_COMPLETED_ROUTING_KEY, event);
        log.info("Published RefundCompletedEvent: walletId={}, amount={}", walletId, refundAmount);
    }
}
