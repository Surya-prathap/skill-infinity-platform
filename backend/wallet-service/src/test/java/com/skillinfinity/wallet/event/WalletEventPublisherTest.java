package com.skillinfinity.wallet.event;

import com.skillinfinity.wallet.config.RabbitMQConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class WalletEventPublisherTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Captor
    private ArgumentCaptor<Object> eventCaptor;

    private WalletEventPublisher eventPublisher;

    @BeforeEach
    void setUp() {
        eventPublisher = new WalletEventPublisher(rabbitTemplate);
    }

    @Test
    void shouldPublishWalletCreditedEvent() {
        UUID walletId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID transactionId = UUID.randomUUID();

        eventPublisher.publishWalletCredited(
                walletId, userId, transactionId, "TXN-001",
                BigDecimal.valueOf(100), BigDecimal.valueOf(600),
                "Credit", "REF-001", "PURCHASE");

        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.WALLET_EXCHANGE),
                eq(RabbitMQConfig.WALLET_CREDITED_ROUTING_KEY),
                eventCaptor.capture());

        WalletCreditedEvent event = (WalletCreditedEvent) eventCaptor.getValue();
        assertEquals(walletId, event.getWalletId());
        assertEquals(userId, event.getUserId());
        assertEquals(transactionId, event.getTransactionId());
        assertEquals(BigDecimal.valueOf(100), event.getAmount());
        assertEquals(BigDecimal.valueOf(600), event.getBalanceAfter());
    }

    @Test
    void shouldPublishWalletDebitedEvent() {
        UUID walletId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID transactionId = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID mentorId = UUID.randomUUID();

        eventPublisher.publishWalletDebited(
                walletId, userId, transactionId, "TXN-002",
                BigDecimal.valueOf(50), BigDecimal.valueOf(450),
                "Debit", "REF-002", sessionId, mentorId);

        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.WALLET_EXCHANGE),
                eq(RabbitMQConfig.WALLET_DEBITED_ROUTING_KEY),
                eventCaptor.capture());

        WalletDebitedEvent event = (WalletDebitedEvent) eventCaptor.getValue();
        assertEquals(walletId, event.getWalletId());
        assertEquals(BigDecimal.valueOf(50), event.getAmount());
        assertEquals(sessionId, event.getSessionId());
        assertEquals(mentorId, event.getMentorId());
    }

    @Test
    void shouldPublishCreditsPurchasedEvent() {
        UUID walletId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID transactionId = UUID.randomUUID();

        eventPublisher.publishCreditsPurchased(
                walletId, userId, transactionId, "TXN-003",
                BigDecimal.valueOf(100), "PG-REF-001",
                BigDecimal.valueOf(600));

        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.WALLET_EXCHANGE),
                eq(RabbitMQConfig.WALLET_CREDITS_PURCHASED_ROUTING_KEY),
                eventCaptor.capture());

        CreditsPurchasedEvent event = (CreditsPurchasedEvent) eventCaptor.getValue();
        assertEquals(walletId, event.getWalletId());
        assertEquals("PG-REF-001", event.getPaymentGatewayRef());
    }

    @Test
    void shouldPublishRefundCompletedEvent() {
        UUID walletId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID originalTransactionId = UUID.randomUUID();
        UUID refundTransactionId = UUID.randomUUID();

        eventPublisher.publishRefundCompleted(
                walletId, userId, originalTransactionId, refundTransactionId,
                BigDecimal.valueOf(100), "Session cancelled",
                BigDecimal.valueOf(600));

        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.WALLET_EXCHANGE),
                eq(RabbitMQConfig.WALLET_REFUND_COMPLETED_ROUTING_KEY),
                eventCaptor.capture());

        RefundCompletedEvent event = (RefundCompletedEvent) eventCaptor.getValue();
        assertEquals(walletId, event.getWalletId());
        assertEquals(originalTransactionId, event.getOriginalTransactionId());
        assertEquals(refundTransactionId, event.getRefundTransactionId());
        assertEquals("Session cancelled", event.getReason());
    }
}
