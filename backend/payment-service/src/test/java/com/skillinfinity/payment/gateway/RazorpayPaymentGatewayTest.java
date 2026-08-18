package com.skillinfinity.payment.gateway;

import com.skillinfinity.payment.config.RazorpayProperties;
import com.skillinfinity.payment.entity.Payment;
import com.skillinfinity.payment.enumeration.PaymentGateway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class RazorpayPaymentGatewayTest {

    private static final String KEY_ID = "rzp_test_xxxxxxxx";
    private static final String KEY_SECRET = "test_key_secret";

    private RazorpayPaymentGateway gateway;

    @BeforeEach
    void setUp() {
        RazorpayProperties properties = new RazorpayProperties();
        properties.setKeyId(KEY_ID);
        properties.setKeySecret(KEY_SECRET);
        properties.setWebhookSecret("test_webhook_secret");
        gateway = new RazorpayPaymentGateway(properties);
    }

    private Payment payment(String orderId) {
        return Payment.builder()
                .id(UUID.randomUUID())
                .paymentNumber("PAY-TEST-0001")
                .amount(new BigDecimal("109.00"))
                .currency("INR")
                .gateway(PaymentGateway.RAZORPAY)
                .gatewayOrderId(orderId)
                .build();
    }

    private String hmacSha256(String payload, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] bytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    @Test
    void verifiesValidPaymentSignature() throws Exception {
        String orderId = "order_abc123";
        String paymentId = "pay_xyz789";
        String signature = hmacSha256(orderId + "|" + paymentId, KEY_SECRET);

        assertThat(gateway.verifySignature(payment(orderId), paymentId, signature)).isTrue();
    }

    @Test
    void rejectsInvalidPaymentSignature() {
        assertThat(gateway.verifySignature(payment("order_abc123"), "pay_xyz789", "deadbeef")).isFalse();
    }

    @Test
    void rejectsMissingPaymentIdOrSignature() {
        assertThat(gateway.verifySignature(payment("order_abc123"), null, "sig")).isFalse();
        assertThat(gateway.verifySignature(payment("order_abc123"), "pay_1", null)).isFalse();
    }

    @Test
    void verifiesSubscriptionSignatureUsingSubscriptionId() throws Exception {
        String subscriptionId = "sub_abc123";
        String paymentId = "pay_xyz789";
        String signature = hmacSha256(subscriptionId + "|" + paymentId, KEY_SECRET);

        assertThat(gateway.verifySubscriptionSignature(subscriptionId, paymentId, signature)).isTrue();
        assertThat(gateway.verifySubscriptionSignature(subscriptionId, paymentId, "wrong")).isFalse();
    }

    @Test
    void verifiesWebhookSignature() throws Exception {
        String payload = "{\"event\":\"payment.captured\"}";
        String signature = hmacSha256(payload, "test_webhook_secret");

        assertThat(gateway.verifyWebhookSignature(payload, signature)).isTrue();
        assertThat(gateway.verifyWebhookSignature(payload, "wrong")).isFalse();
    }

    @Test
    void exposesKeyIdButNeverKeySecret() {
        assertThat(gateway.getKeyId()).isEqualTo(KEY_ID);
        // The secret must never be exposed through the gateway API.
        assertThat(gateway.toString()).doesNotContain(KEY_SECRET);
    }
}
