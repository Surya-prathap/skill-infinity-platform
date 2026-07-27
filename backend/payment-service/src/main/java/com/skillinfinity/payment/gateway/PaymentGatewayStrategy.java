package com.skillinfinity.payment.gateway;

import com.skillinfinity.payment.entity.Payment;
import com.skillinfinity.payment.enumeration.PaymentGateway;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Strategy interface for payment gateway integrations.
 * Each gateway implementation will provide its own logic for
 * creating orders, processing payments, verifying signatures,
 * and processing refunds.
 */
public interface PaymentGatewayStrategy {

    /**
     * Returns the gateway enum value this strategy handles.
     */
    PaymentGateway getGateway();

    /**
     * Creates an order in the payment gateway.
     *
     * @param payment the payment entity
     * @return gateway order ID
     */
    String createOrder(Payment payment);

    /**
     * Processes the payment through the gateway.
     *
     * @param payment the payment entity
     * @return true if payment was successful
     */
    boolean processPayment(Payment payment);

    /**
     * Verifies the payment signature/callback.
     *
     * @param payment the payment entity
     * @param gatewayPaymentId the gateway payment ID
     * @param gatewaySignature the gateway signature
     * @return true if signature is valid
     */
    boolean verifySignature(Payment payment, String gatewayPaymentId, String gatewaySignature);

    /**
     * Processes a refund through the gateway.
     *
     * @param payment the original payment entity
     * @param amount the refund amount
     * @param reason the reason for refund
     * @return gateway refund ID if successful
     */
    Optional<String> processRefund(Payment payment, BigDecimal amount, String reason);
}
