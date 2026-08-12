package com.skillinfinity.wallet.event;

import com.skillinfinity.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Consumes the session service's {@code SessionCompletedEvent} and settles the
 * credit economy:
 *
 * <ul>
 *   <li>The learner's booking hold (frozen credits) becomes a real debit using
 *       WELCOME → PURCHASED → LEARNING priority.</li>
 *   <li>The mentor receives the session value split into learning credits and
 *       withdrawable credits per the configured ratio.</li>
 * </ul>
 *
 * Community (free) sessions carry {@code credits == 0} and are skipped — their
 * recognition is tracked separately by the session service.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SessionCompletedConsumer {

    private final WalletService walletService;

    @RabbitListener(queues = "${wallet.session.completed.queue:wallet.session.completed.queue}")
    public void handleSessionCompleted(Map<String, Object> event) {
        try {
            String eventType = event.get("eventType") != null ? event.get("eventType").toString() : "SESSION_COMPLETED";
            if (!"SESSION_COMPLETED".equals(eventType)) {
                return;
            }
            UUID sessionId = UUID.fromString(event.get("sessionId").toString());
            UUID mentorId = UUID.fromString(event.get("mentorId").toString());
            UUID learnerId = UUID.fromString(event.get("learnerId").toString());
            BigDecimal credits = event.get("credits") != null
                    ? new BigDecimal(event.get("credits").toString())
                    : BigDecimal.ZERO;

            walletService.settleSessionCredits(sessionId, learnerId, mentorId, credits);
            log.info("Settled completed session credits: sessionId={}, learnerId={}, mentorId={}, credits={}",
                    sessionId, learnerId, mentorId, credits);
        } catch (Exception e) {
            log.error("Failed to settle session completed event: {}", event, e);
        }
    }
}
