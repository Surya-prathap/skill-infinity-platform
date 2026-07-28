package com.skillinfinity.communication.event;

import com.skillinfinity.communication.enumeration.NotificationCategory;
import com.skillinfinity.communication.enumeration.NotificationChannel;
import com.skillinfinity.communication.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExternalEventConsumer {

    private final NotificationService notificationService;

    @RabbitListener(queues = "${communication.user.registered.queue:communication.user.registered.queue}")
    public void handleUserRegisteredEvent(Map<String, Object> event) {
        log.info("Received user registered event: {}", event.get("eventId"));
        try {
            UUID userId = UUID.fromString(event.get("userId").toString());
            String userName = (String) event.getOrDefault("userName", "User");

            notificationService.createInAppNotification(
                    userId,
                    "Welcome to Skill Infinity!",
                    "Welcome " + userName + "! We're excited to have you on board.",
                    NotificationCategory.SYSTEM
            );
        } catch (Exception e) {
            log.error("Failed to handle user registered event", e);
        }
    }

    @RabbitListener(queues = "${communication.session.booked.queue:communication.session.booked.queue}")
    public void handleSessionBookedEvent(Map<String, Object> event) {
        log.info("Received session booked event: {}", event.get("eventId"));
        try {
            UUID learnerId = UUID.fromString(event.get("learnerId").toString());
            UUID mentorId = UUID.fromString(event.get("mentorId").toString());
            UUID sessionId = UUID.fromString(event.get("sessionId").toString());
            String mentorName = (String) event.getOrDefault("mentorName", "Mentor");

            notificationService.createInAppNotification(
                    learnerId,
                    "Session Booked",
                    "Your session with " + mentorName + " has been booked successfully.",
                    NotificationCategory.BOOKING
            );
        } catch (Exception e) {
            log.error("Failed to handle session booked event", e);
        }
    }

    @RabbitListener(queues = "${communication.session.approved.queue:communication.session.approved.queue}")
    public void handleSessionApprovedEvent(Map<String, Object> event) {
        log.info("Received session approved event: {}", event.get("eventId"));
        try {
            UUID learnerId = UUID.fromString(event.get("learnerId").toString());
            UUID sessionId = UUID.fromString(event.get("sessionId").toString());
            String mentorName = (String) event.getOrDefault("mentorName", "Mentor");

            notificationService.createInAppNotification(
                    learnerId,
                    "Session Approved",
                    "Your session with " + mentorName + " has been approved.",
                    NotificationCategory.SESSION
            );
        } catch (Exception e) {
            log.error("Failed to handle session approved event", e);
        }
    }

    @RabbitListener(queues = "${communication.session.cancelled.queue:communication.session.cancelled.queue}")
    public void handleSessionCancelledEvent(Map<String, Object> event) {
        log.info("Received session cancelled event: {}", event.get("eventId"));
        try {
            UUID userId = UUID.fromString(event.get("userId").toString());
            UUID sessionId = UUID.fromString(event.get("sessionId").toString());

            notificationService.createInAppNotification(
                    userId,
                    "Session Cancelled",
                    "Your session has been cancelled.",
                    NotificationCategory.SESSION
            );
        } catch (Exception e) {
            log.error("Failed to handle session cancelled event", e);
        }
    }

    @RabbitListener(queues = "${communication.payment.completed.queue:communication.payment.completed.queue}")
    public void handlePaymentCompletedEvent(Map<String, Object> event) {
        log.info("Received payment completed event: {}", event.get("eventId"));
        try {
            UUID userId = UUID.fromString(event.get("userId").toString());
            String amount = event.getOrDefault("amount", "0").toString();

            notificationService.createInAppNotification(
                    userId,
                    "Payment Successful",
                    "Your payment of $" + amount + " has been processed successfully.",
                    NotificationCategory.PAYMENT
            );
        } catch (Exception e) {
            log.error("Failed to handle payment completed event", e);
        }
    }

    @RabbitListener(queues = "${communication.wallet.credited.queue:communication.wallet.credited.queue}")
    public void handleWalletCreditedEvent(Map<String, Object> event) {
        log.info("Received wallet credited event: {}", event.get("eventId"));
        try {
            UUID userId = UUID.fromString(event.get("userId").toString());
            String amount = event.getOrDefault("amount", "0").toString();

            notificationService.createInAppNotification(
                    userId,
                    "Wallet Credited",
                    "Your wallet has been credited with $" + amount + ".",
                    NotificationCategory.PAYMENT
            );
        } catch (Exception e) {
            log.error("Failed to handle wallet credited event", e);
        }
    }

    @RabbitListener(queues = "${communication.subscription.activated.queue:communication.subscription.activated.queue}")
    public void handleSubscriptionActivatedEvent(Map<String, Object> event) {
        log.info("Received subscription activated event: {}", event.get("eventId"));
        try {
            UUID userId = UUID.fromString(event.get("userId").toString());
            String planName = (String) event.getOrDefault("planName", "Premium");

            notificationService.createInAppNotification(
                    userId,
                    "Subscription Activated",
                    "Your " + planName + " subscription has been activated.",
                    NotificationCategory.SUBSCRIPTION
            );
        } catch (Exception e) {
            log.error("Failed to handle subscription activated event", e);
        }
    }
}
