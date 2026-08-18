package com.skillinfinity.payment.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Razorpay credentials — injected exclusively from environment variables /
 * Config Server (never hardcoded, never exposed to the frontend).
 *
 * <pre>
 *   RAZORPAY_KEY_ID        rzp_test_xxxx  (safe to return to the checkout UI)
 *   RAZORPAY_KEY_SECRET    xxxx           (server-side only)
 *   RAZORPAY_WEBHOOK_SECRET xxxx          (server-side only, webhook signature)
 * </pre>
 */
@Data
@Component
@ConfigurationProperties(prefix = "razorpay")
public class RazorpayProperties {

    /** Razorpay Key ID (test or live) — the only credential the checkout UI sees. */
    private String keyId;

    /** Razorpay Key Secret — must never leave the server. */
    private String keySecret;

    /** Razorpay webhook secret — used to verify inbound webhook signatures. */
    private String webhookSecret;

    /** Razorpay API base URL (defaults to the production API). */
    private String baseUrl = "https://api.razorpay.com";

    /** Whether the integration is active (keys configured). */
    public boolean isConfigured() {
        return keyId != null && !keyId.isBlank() && keySecret != null && !keySecret.isBlank();
    }
}
