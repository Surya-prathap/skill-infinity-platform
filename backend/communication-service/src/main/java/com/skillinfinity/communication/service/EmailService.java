package com.skillinfinity.communication.service;

import com.skillinfinity.communication.dto.request.EmailRequest;

import java.util.Map;

public interface EmailService {

    void sendEmail(EmailRequest request);

    void sendTemplatedEmail(String recipientEmail, String recipientName, String templateName, Map<String, Object> variables);

    void sendWelcomeEmail(String recipientEmail, String recipientName);

    void sendPasswordResetEmail(String recipientEmail, String resetLink);

    void sendEmailVerificationEmail(String recipientEmail, String verificationLink);

    void sendBookingConfirmationEmail(String recipientEmail, String recipientName, Map<String, Object> sessionDetails);

    void sendPaymentReceiptEmail(String recipientEmail, String recipientName, Map<String, Object> paymentDetails);
}
