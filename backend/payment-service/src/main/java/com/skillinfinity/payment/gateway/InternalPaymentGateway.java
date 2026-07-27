package com.skillinfinity.payment.gateway;

import com.skillinfinity.payment.entity.Payment;
import com.skillinfinity.payment.enumeration.PaymentGateway;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

/**
 * Internal payment gateway for processing credit-based payments.
 * This is the default gateway used when no external payment gateway is integrated.
 */
@Slf4j
@Component
public class InternalPaymentGateway implements PaymentGatewayStrategy {

    @Override
    public PaymentGateway getGateway() {
        return PaymentGateway.INTERNAL;
    }

    @Override
    public String createOrder(Payment payment) {
        String orderId = "INT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("Internal order created: orderId={}, paymentId={}", orderId, payment.getId());
        return orderId;
    }

    @Override
    public boolean processPayment(Payment payment) {
        log.info("Internal payment processed: paymentId={}, amount={}", payment.getId(), payment.getAmount());
        return true;
    }

    @Override
    public boolean verifySignature(Payment payment, String gatewayPaymentId, String gatewaySignature) {
        log.info("Internal signature verified: paymentId={}", payment.getId());
        return true;
    }

    @Override
    public Optional<String> processRefund(Payment payment, BigDecimal amount, String reason) {
        String refundId = "INT-REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("Internal refund processed: paymentId={}, amount={}, refundId={}",
                payment.getId(), amount, refundId);
        return Optional.of(refundId);
    }
}
