package com.skillinfinity.session.client;

import com.skillinfinity.common.exception.ServiceException;
import com.skillinfinity.common.filter.GatewayHeaderAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Thin client for the wallet-service credit hold endpoints. Used during the
 * professional booking lifecycle:
 *
 * <ul>
 *   <li>book → freeze (validates sufficient credits — rejects with
 *       "Insufficient credits." when the balance cannot cover the session)</li>
 *   <li>reject/cancel → release (refund the hold)</li>
 * </ul>
 *
 * The wallet-service resolves the learner wallet from the trusted X-User-ID
 * header, mirroring how admin-service forwards verification decisions.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WalletClient {

    private final RestTemplate restTemplate;

    @Value("${app.services.wallet-service-url:http://wallet-service:8085}")
    private String walletServiceUrl;

    public void freezeCredits(UUID userId, double credits, UUID bookingId, String description) {
        if (credits <= 0) {
            return;
        }
        call(userId, "/api/v1/wallet/freeze-by-user", credits, bookingId, description);
    }

    public void releaseCredits(UUID userId, double credits, UUID bookingId, String description) {
        if (credits <= 0) {
            return;
        }
        call(userId, "/api/v1/wallet/release-by-user", credits, bookingId, description);
    }

    private void call(UUID userId, String path, double credits, UUID referenceId, String description) {
        String baseUrl = walletServiceUrl.endsWith("/")
                ? walletServiceUrl.substring(0, walletServiceUrl.length() - 1)
                : walletServiceUrl;

        HttpHeaders headers = new HttpHeaders();
        headers.set(GatewayHeaderAuthenticationFilter.USER_ID_HEADER, userId.toString());
        headers.set(GatewayHeaderAuthenticationFilter.USER_ROLES_HEADER, "ROLE_LEARNER,ROLE_MENTOR");

        Map<String, Object> body = Map.of(
                "amount", BigDecimal.valueOf(credits),
                "reason", description,
                "referenceId", referenceId.toString());

        try {
            restTemplate.exchange(baseUrl + path, HttpMethod.POST,
                    new HttpEntity<>(body, headers), String.class);
            log.info("Wallet {} {} credits for user {} (reference {})",
                    path.contains("freeze") ? "froze" : "released", credits, userId, referenceId);
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            // A 4xx from the wallet is a business rejection (insufficient
            // balance, frozen wallet, duplicate reference, …). Pass its message
            // through so the user sees the real reason instead of a generic
            // "insufficient credits" that fires even when the wallet is fine.
            String reason = "Insufficient credits. Please purchase credits or use an available community session.";
            if (e.getResponseBodyAsString() != null && !e.getResponseBodyAsString().isBlank()) {
                reason = e.getResponseBodyAsString();
            }
            log.warn("Wallet {} rejected: userId={}, credits={}, reference={}, status={}",
                    path, userId, credits, referenceId, e.getStatusCode().value());
            throw new ServiceException(sanitize(reason), HttpStatus.BAD_REQUEST);
        } catch (RestClientException e) {
            // Transport-level failure (wallet down, timeout) — the hold was NOT
            // placed, so this is an infrastructure error, not an insufficient
            // balance. Never report "insufficient credits" for a network issue.
            log.error("Wallet {} unreachable: userId={}, credits={}, reference={}",
                    path, userId, credits, referenceId, e);
            throw new ServiceException(
                    "Booking could not be completed right now. Please try again.",
                    HttpStatus.SERVICE_UNAVAILABLE);
        }
    }

    /** Keeps only the user-facing part of a wallet error payload. */
    private String sanitize(String raw) {
        if (raw == null || raw.isBlank()) {
            return "Insufficient credits. Please purchase credits or use an available community session.";
        }
        // Strip JSON envelope if present — take the message field when available.
        String trimmed = raw.trim();
        int idx = trimmed.indexOf("\"message\"");
        if (idx >= 0) {
            int colon = trimmed.indexOf(':', idx);
            int start = trimmed.indexOf('"', colon + 1);
            int end = trimmed.indexOf('"', start + 1);
            if (start >= 0 && end > start) {
                return trimmed.substring(start + 1, end);
            }
        }
        return trimmed.length() > 200 ? trimmed.substring(0, 200) : trimmed;
    }
}
