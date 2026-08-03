package com.skillinfinity.common.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

/**
 * Registry for custom business metrics exposed via Micrometer/Prometheus.
 * Provides counters and timers for key business operations.
 */
@Slf4j
@Component
public class CustomBusinessMetrics {

    private final MeterRegistry meterRegistry;

    // Authentication metrics
    @Getter
    private final Counter registrationCounter;
    @Getter
    private final Counter loginCounter;
    @Getter
    private final Counter loginFailureCounter;
    @Getter
    private final Counter tokenRefreshCounter;

    // Session metrics
    @Getter
    private final Counter sessionBookedCounter;
    @Getter
    private final Counter sessionCompletedCounter;
    @Getter
    private final Counter sessionCancelledCounter;

    // Payment metrics
    @Getter
    private final Counter paymentInitiatedCounter;
    @Getter
    private final Counter paymentCompletedCounter;
    @Getter
    private final Counter paymentFailedCounter;
    @Getter
    private final Counter refundCounter;

    // Wallet metrics
    @Getter
    private final Counter walletCreditCounter;
    @Getter
    private final Counter walletDebitCounter;

    // Community metrics
    @Getter
    private final Counter postCreatedCounter;
    @Getter
    private final Counter commentAddedCounter;

    // Notification metrics
    @Getter
    private final Counter notificationSentCounter;
    @Getter
    private final Counter emailSentCounter;

    // Admin metrics
    @Getter
    private final Counter adminActionCounter;

    // Timers
    @Getter
    private final Timer apiResponseTimer;
    @Getter
    private final Timer dbQueryTimer;
    @Getter
    private final Timer externalServiceCallTimer;

    public CustomBusinessMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;

        // Initialize counters
        this.registrationCounter = Counter.builder("skillinfinity.auth.registrations")
                .description("Total user registrations")
                .register(meterRegistry);

        this.loginCounter = Counter.builder("skillinfinity.auth.logins")
                .description("Total successful logins")
                .register(meterRegistry);

        this.loginFailureCounter = Counter.builder("skillinfinity.auth.login.failures")
                .description("Total failed login attempts")
                .register(meterRegistry);

        this.tokenRefreshCounter = Counter.builder("skillinfinity.auth.token.refreshes")
                .description("Total token refresh operations")
                .register(meterRegistry);

        this.sessionBookedCounter = Counter.builder("skillinfinity.sessions.booked")
                .description("Total sessions booked")
                .register(meterRegistry);

        this.sessionCompletedCounter = Counter.builder("skillinfinity.sessions.completed")
                .description("Total sessions completed")
                .register(meterRegistry);

        this.sessionCancelledCounter = Counter.builder("skillinfinity.sessions.cancelled")
                .description("Total sessions cancelled")
                .register(meterRegistry);

        this.paymentInitiatedCounter = Counter.builder("skillinfinity.payments.initiated")
                .description("Total payments initiated")
                .register(meterRegistry);

        this.paymentCompletedCounter = Counter.builder("skillinfinity.payments.completed")
                .description("Total payments completed")
                .register(meterRegistry);

        this.paymentFailedCounter = Counter.builder("skillinfinity.payments.failed")
                .description("Total payments failed")
                .register(meterRegistry);

        this.refundCounter = Counter.builder("skillinfinity.payments.refunds")
                .description("Total refunds processed")
                .register(meterRegistry);

        this.walletCreditCounter = Counter.builder("skillinfinity.wallet.credits")
                .description("Total wallet credit operations")
                .register(meterRegistry);

        this.walletDebitCounter = Counter.builder("skillinfinity.wallet.debits")
                .description("Total wallet debit operations")
                .register(meterRegistry);

        this.postCreatedCounter = Counter.builder("skillinfinity.community.posts")
                .description("Total posts created")
                .register(meterRegistry);

        this.commentAddedCounter = Counter.builder("skillinfinity.community.comments")
                .description("Total comments added")
                .register(meterRegistry);

        this.notificationSentCounter = Counter.builder("skillinfinity.notifications.sent")
                .description("Total notifications sent")
                .register(meterRegistry);

        this.emailSentCounter = Counter.builder("skillinfinity.emails.sent")
                .description("Total emails sent")
                .register(meterRegistry);

        this.adminActionCounter = Counter.builder("skillinfinity.admin.actions")
                .description("Total admin actions performed")
                .register(meterRegistry);

        // Initialize timers
        this.apiResponseTimer = Timer.builder("skillinfinity.api.response.time")
                .description("API response time")
                .publishPercentiles(0.5, 0.75, 0.95, 0.99)
                .publishPercentileHistogram()
                .register(meterRegistry);

        this.dbQueryTimer = Timer.builder("skillinfinity.db.query.time")
                .description("Database query execution time")
                .publishPercentiles(0.5, 0.75, 0.95, 0.99)
                .register(meterRegistry);

        this.externalServiceCallTimer = Timer.builder("skillinfinity.external.service.call.time")
                .description("External service call duration")
                .publishPercentiles(0.5, 0.75, 0.95, 0.99)
                .register(meterRegistry);
    }

    @PostConstruct
    public void init() {
        log.info("Custom business metrics registered successfully");
    }

    public void recordApiResponseTime(long millis) {
        apiResponseTimer.record(millis, TimeUnit.MILLISECONDS);
    }

    public void recordDbQueryTime(long millis) {
        dbQueryTimer.record(millis, TimeUnit.MILLISECONDS);
    }

    public void recordExternalServiceCallTime(long millis) {
        externalServiceCallTimer.record(millis, TimeUnit.MILLISECONDS);
    }
}
