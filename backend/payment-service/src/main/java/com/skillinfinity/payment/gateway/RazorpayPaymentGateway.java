package com.skillinfinity.payment.gateway;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.skillinfinity.payment.config.RazorpayProperties;
import com.skillinfinity.payment.entity.Payment;
import com.skillinfinity.payment.enumeration.PaymentGateway;
import com.skillinfinity.payment.exception.PaymentFailedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;

/**
 * Razorpay gateway strategy (TEST MODE during development).
 *
 * <p>All Razorpay calls are server-side via the official SDK. The key secret
 * and webhook secret live only in {@link RazorpayProperties} (environment),
 * never in responses or logs. The checkout UI only ever receives the Key ID.</p>
 *
 * <p>Amounts are converted to paise (₹1 = 100 paise) as required by the
 * Razorpay API.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RazorpayPaymentGateway implements PaymentGatewayStrategy {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String CURRENCY_INR = "INR";

    private final RazorpayProperties razorpayProperties;

    @Override
    public PaymentGateway getGateway() {
        return PaymentGateway.RAZORPAY;
    }

    /** Builds the SDK client from the configured (test/live) credentials. */
    public RazorpayClient createClient() {
        ensureConfigured();
        try {
            return new RazorpayClient(razorpayProperties.getKeyId(), razorpayProperties.getKeySecret());
        } catch (RazorpayException e) {
            log.error("Razorpay client creation failed: {}", e.getMessage());
            throw new PaymentFailedException("Razorpay client could not be created");
        }
    }

    /**
     * Razorpay Key ID — the ONLY credential safe to expose to the browser
     * (required by the checkout). The secret is never returned.
     */
    public String getKeyId() {
        return razorpayProperties.getKeyId();
    }

    @Override
    public String createOrder(Payment payment) {
        ensureConfigured();
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", toPaise(payment.getTotalAmount() != null ? payment.getTotalAmount() : payment.getAmount()));
            orderRequest.put("currency", CURRENCY_INR);
            orderRequest.put("receipt", payment.getPaymentNumber());

            JSONObject notes = new JSONObject();
            notes.put("paymentId", payment.getId() != null ? payment.getId().toString() : null);
            notes.put("referenceType", payment.getReferenceType());
            orderRequest.put("notes", notes);

            Order order = createClient().orders.create(orderRequest);
            String orderId = order.get("id");
            log.info("Razorpay order created: orderId={}, paymentId={}, amountPaise={}",
                    orderId, payment.getId(), orderRequest.getInt("amount"));
            return orderId;
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: paymentId={}, reason={}", payment.getId(), e.getMessage());
            throw new PaymentFailedException("Razorpay order could not be created: " + e.getMessage());
        }
    }

    @Override
    public boolean processPayment(Payment payment) {
        // The payment is considered processed only after the signature has been
        // verified server-side (verifySignature). Nothing to do at the gateway.
        log.info("Razorpay payment verified and processed: paymentId={}, orderId={}",
                payment.getId(), payment.getGatewayOrderId());
        return true;
    }

    @Override
    public boolean verifySignature(Payment payment, String gatewayPaymentId, String gatewaySignature) {
        if (gatewayPaymentId == null || gatewayPaymentId.isBlank() || gatewaySignature == null || gatewaySignature.isBlank()) {
            log.warn("Razorpay signature verification skipped — missing payment/signature for paymentId={}", payment.getId());
            return false;
        }
        String payload = payment.getGatewayOrderId() + "|" + gatewayPaymentId;
        return verifyHmac(payload, gatewaySignature);
    }

    /**
     * Verifies a Razorpay subscription first-charge signature. Razorpay signs
     * subscription payments as {@code HMAC(subscription_id + "|" + payment_id)}.
     */
    public boolean verifySubscriptionSignature(String razorpaySubscriptionId, String gatewayPaymentId, String gatewaySignature) {
        if (razorpaySubscriptionId == null || razorpaySubscriptionId.isBlank()
                || gatewayPaymentId == null || gatewayPaymentId.isBlank()
                || gatewaySignature == null || gatewaySignature.isBlank()) {
            log.warn("Razorpay subscription signature verification skipped — missing data");
            return false;
        }
        String payload = razorpaySubscriptionId + "|" + gatewayPaymentId;
        return verifyHmac(payload, gatewaySignature);
    }

    /** Verifies an inbound Razorpay webhook using the webhook secret. */
    public boolean verifyWebhookSignature(String payload, String signature) {
        if (payload == null || signature == null || signature.isBlank()
                || razorpayProperties.getWebhookSecret() == null || razorpayProperties.getWebhookSecret().isBlank()) {
            log.warn("Razorpay webhook signature verification skipped — missing payload/signature/secret");
            return false;
        }
        try {
            return Utils.verifyWebhookSignature(payload, signature, razorpayProperties.getWebhookSecret());
        } catch (Exception e) {
            log.warn("Razorpay webhook signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public Optional<String> processRefund(Payment payment, BigDecimal amount, String reason) {
        ensureConfigured();
        try {
            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", toPaise(amount));
            if (reason != null && !reason.isBlank()) {
                refundRequest.put("notes", new JSONObject().put("reason", reason));
            }
            com.razorpay.Refund refund = createClient().payments.refund(payment.getGatewayPaymentId(), refundRequest);
            String refundId = refund.get("id");
            log.info("Razorpay refund processed: refundId={}, paymentId={}, amount={}", refundId, payment.getId(), amount);
            return Optional.ofNullable(refundId);
        } catch (RazorpayException e) {
            log.error("Razorpay refund failed: paymentId={}, reason={}", payment.getId(), e.getMessage());
            return Optional.empty();
        }
    }

    /** Converts an INR BigDecimal into paise (int) for the Razorpay API. */
    private int toPaise(BigDecimal amountInr) {
        if (amountInr == null) {
            return 0;
        }
        return amountInr.multiply(BigDecimal.valueOf(100)).setScale(0, java.math.RoundingMode.HALF_UP).intValueExact();
    }

    /** Constant-time HMAC-SHA256 comparison of {@code payload} signed with the key secret. */
    private boolean verifyHmac(String payload, String signature) {
        ensureConfigured();
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(
                    razorpayProperties.getKeySecret().getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            byte[] expected = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            byte[] actual = toHex(expected).getBytes(StandardCharsets.UTF_8);
            return MessageDigest.isEqual(actual, signature.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            log.error("Razorpay signature verification error: {}", e.getMessage());
            return false;
        }
    }

    private String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private void ensureConfigured() {
        if (!razorpayProperties.isConfigured()) {
            throw new PaymentFailedException(
                    "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
        }
    }
}
