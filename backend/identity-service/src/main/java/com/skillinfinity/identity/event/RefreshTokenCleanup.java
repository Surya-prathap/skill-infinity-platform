package com.skillinfinity.identity.event;

import com.skillinfinity.identity.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Keeps {@code refresh_tokens} from growing without bound.
 *
 * <p>Every login and every token rotation inserts a new row; without cleanup
 * the table accumulates one row per login forever, slowing down every
 * {@code findByToken} and bloating the unique index on the token column.
 * Expired rows are purged hourly; revoked rows are kept for a short grace
 * period (so a just-logged-out client cannot be replayed) and then dropped.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RefreshTokenCleanup {

    /** Revoked tokens are forgotten this long after being revoked. */
    private static final long REVOKED_GRACE_HOURS = 24;

    private final RefreshTokenRepository refreshTokenRepository;

    @Scheduled(fixedDelay = 3_600_000, initialDelay = 600_000)
    @Transactional
    public void purgeStaleTokens() {
        try {
            int expired = refreshTokenRepository.deleteExpiredBefore(LocalDateTime.now());
            int revoked = refreshTokenRepository.deleteRevokedBefore(
                    LocalDateTime.now().minusHours(REVOKED_GRACE_HOURS));
            if (expired > 0 || revoked > 0) {
                log.info("Purged refresh tokens: {} expired, {} revoked", expired, revoked);
            }
        } catch (Exception e) {
            // Cleanup is best-effort — never let it take the service down.
            log.warn("Refresh token cleanup failed: {}", e.getMessage());
        }
    }
}
