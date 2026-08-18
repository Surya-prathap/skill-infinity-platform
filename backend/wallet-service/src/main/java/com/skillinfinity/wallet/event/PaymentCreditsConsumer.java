package com.skillinfinity.wallet.event;

import com.skillinfinity.wallet.dto.request.CreditRequest;
import com.skillinfinity.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Consumes the payment service's {@code CreditsPurchasedEvent} and credits
 * the learner's wallet. The reference ID is the payment ID, so the wallet's
 * duplicate-reference guard prevents double-crediting for the same payment
 * (e.g. a redelivered RabbitMQ message).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentCreditsConsumer {

    private static final String CREDIT_PURCHASE_REFERENCE_TYPE = "CREDIT_PURCHASE";

    private final WalletService walletService;

    @RabbitListener(queues = "${wallet.payment.credits.purchased.queue:wallet.payment.credits.purchased.queue}")
    public void handleCreditsPurchased(Map<String, Object> event) {
        log.info("Received credits purchased event: paymentId={}", event.get("paymentId"));
        try {
            UUID userId = UUID.fromString(event.get("userId").toString());
            BigDecimal credits = new BigDecimal(event.get("credits").toString());
            String paymentId = event.get("paymentId") != null ? event.get("paymentId").toString() : null;
            String gatewayPaymentId = event.get("gatewayPaymentId") != null
                    ? event.get("gatewayPaymentId").toString() : null;

            walletService.creditWallet(userId, CreditRequest.builder()
                    .amount(credits)
                    .description("Credit purchase confirmed — credits added to your wallet")
                    .referenceId(paymentId != null ? "PAY-" + paymentId : null)
                    .referenceType(CREDIT_PURCHASE_REFERENCE_TYPE)
                    .paymentGatewayRef(gatewayPaymentId)
                    .build());
        } catch (Exception e) {
            log.error("Failed to process credits purchased event: paymentId={}",
                    event.get("paymentId"), e);
        }
    }
}
