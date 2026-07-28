package com.skillinfinity.communication.service.impl;

import com.skillinfinity.communication.dto.request.EmailRequest;
import com.skillinfinity.communication.entity.EmailHistory;
import com.skillinfinity.communication.entity.EmailTemplate;
import com.skillinfinity.communication.event.CommunicationEventPublisher;
import com.skillinfinity.communication.event.EmailSentEvent;
import com.skillinfinity.communication.exception.EmailFailedException;
import com.skillinfinity.communication.repository.EmailHistoryRepository;
import com.skillinfinity.communication.repository.EmailTemplateRepository;
import com.skillinfinity.communication.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final EmailTemplateRepository emailTemplateRepository;
    private final EmailHistoryRepository emailHistoryRepository;
    private final CommunicationEventPublisher eventPublisher;

    @Value("${communication.email.from-address:noreply@skillinfinity.com}")
    private String fromAddress;

    @Value("${communication.email.from-name:Skill Infinity}")
    private String fromName;

    @Override
    public void sendEmail(EmailRequest request) {
        log.info("Sending email to: {} with template: {}", request.getRecipientEmail(), request.getTemplateName());

        try {
            String htmlContent = processTemplate(request.getTemplateName(), request.getVariables());

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress, fromName);
            helper.setTo(request.getRecipientEmail());
            helper.setSubject(request.getSubject());

            if (htmlContent != null) {
                helper.setText(htmlContent, true);
            } else if (request.getTextBody() != null) {
                helper.setText(request.getTextBody());
            } else {
                helper.setText(request.getSubject());
            }

            mailSender.send(message);

            EmailHistory history = EmailHistory.builder()
                    .id(UUID.randomUUID())
                    .recipientEmail(request.getRecipientEmail())
                    .recipientName(request.getRecipientName())
                    .subject(request.getSubject())
                    .templateName(request.getTemplateName())
                    .status("SENT")
                    .sentAt(LocalDateTime.now())
                    .build();
            emailHistoryRepository.save(history);

            eventPublisher.publishEmailSent(new EmailSentEvent(
                    history.getId(), request.getRecipientEmail(),
                    request.getTemplateName(), request.getSubject()
            ));

            log.info("Email sent successfully to: {}", request.getRecipientEmail());

        } catch (MailException | MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to send email to: {}", request.getRecipientEmail(), e);

            EmailHistory history = EmailHistory.builder()
                    .id(UUID.randomUUID())
                    .recipientEmail(request.getRecipientEmail())
                    .recipientName(request.getRecipientName())
                    .subject(request.getSubject())
                    .templateName(request.getTemplateName())
                    .status("FAILED")
                    .errorMessage(e.getMessage())
                    .build();
            emailHistoryRepository.save(history);

            throw new EmailFailedException("Failed to send email to " + request.getRecipientEmail(), e);
        }
    }

    @Override
    public void sendTemplatedEmail(String recipientEmail, String recipientName, String templateName, Map<String, Object> variables) {
        Optional<EmailTemplate> templateOpt = emailTemplateRepository.findByTemplateNameAndActiveTrue(templateName);

        String subject;
        if (templateOpt.isPresent()) {
            subject = templateOpt.get().getSubject();
        } else {
            subject = "Notification from Skill Infinity";
        }

        EmailRequest request = EmailRequest.builder()
                .recipientEmail(recipientEmail)
                .recipientName(recipientName)
                .subject(subject)
                .templateName(templateName)
                .variables(variables)
                .build();

        sendEmail(request);
    }

    @Override
    public void sendWelcomeEmail(String recipientEmail, String recipientName) {
        sendTemplatedEmail(recipientEmail, recipientName, "welcome",
                Map.of("name", recipientName, "platform", "Skill Infinity"));
    }

    @Override
    public void sendPasswordResetEmail(String recipientEmail, String resetLink) {
        sendTemplatedEmail(recipientEmail, null, "password-reset",
                Map.of("resetLink", resetLink, "platform", "Skill Infinity"));
    }

    @Override
    public void sendEmailVerificationEmail(String recipientEmail, String verificationLink) {
        sendTemplatedEmail(recipientEmail, null, "email-verification",
                Map.of("verificationLink", verificationLink, "platform", "Skill Infinity"));
    }

    @Override
    public void sendBookingConfirmationEmail(String recipientEmail, String recipientName, Map<String, Object> sessionDetails) {
        sendTemplatedEmail(recipientEmail, recipientName, "booking-confirmation", sessionDetails);
    }

    @Override
    public void sendPaymentReceiptEmail(String recipientEmail, String recipientName, Map<String, Object> paymentDetails) {
        sendTemplatedEmail(recipientEmail, recipientName, "payment-receipt", paymentDetails);
    }

    private String processTemplate(String templateName, Map<String, Object> variables) {
        Optional<EmailTemplate> templateOpt = emailTemplateRepository.findByTemplateNameAndActiveTrue(templateName);
        if (templateOpt.isEmpty()) {
            log.warn("Email template not found: {}", templateName);
            return null;
        }

        EmailTemplate template = templateOpt.get();
        String htmlContent = template.getBodyHtml();

        if (variables != null) {
            for (Map.Entry<String, Object> entry : variables.entrySet()) {
                htmlContent = htmlContent.replace("{{" + entry.getKey() + "}}",
                        entry.getValue() != null ? entry.getValue().toString() : "");
            }
        }

        return htmlContent;
    }
}
