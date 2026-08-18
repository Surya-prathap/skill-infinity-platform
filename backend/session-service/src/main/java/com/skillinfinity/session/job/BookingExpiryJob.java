package com.skillinfinity.session.job;

import com.skillinfinity.session.client.WalletClient;
import com.skillinfinity.session.entity.Booking;
import com.skillinfinity.session.enumeration.BookingStatus;
import com.skillinfinity.session.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Releases the credit hold of bookings the mentor never acted on.
 *
 * <p>When a learner books a professional session, their credits are frozen for
 * the booking window (48h). If the mentor neither accepts nor rejects, that
 * hold would otherwise stay frozen forever — the learner's credits silently
 * disappear. This job flips such bookings to {@code EXPIRED} and returns the
 * held credits to the learner's wallet.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BookingExpiryJob {

    private final BookingRepository bookingRepository;
    private final WalletClient walletClient;

    /** Runs every 30 minutes; each run only touches bookings past their expiry. */
    @Scheduled(fixedDelayString = "${app.booking.expiry-job-interval-ms:1800000}",
            initialDelayString = "${app.booking.expiry-job-initial-delay-ms:60000}")
    @Transactional
    public void expireStaleBookings() {
        List<Booking> expired = bookingRepository.findExpiredBookings(LocalDateTime.now());
        if (expired.isEmpty()) {
            return;
        }

        int released = 0;
        for (Booking booking : expired) {
            // Idempotent per booking: the status flip below guarantees a
            // crashed/restarted job never releases the same hold twice.
            if (booking.getPrice() > 0) {
                walletClient.releaseCredits(booking.getLearnerId(), booking.getPrice(),
                        booking.getId(), "Booking request expired without a mentor response");
            }
            booking.setStatus(BookingStatus.EXPIRED);
            booking.setUpdatedBy("system");
            bookingRepository.save(booking);
            released++;
        }

        log.info("Booking expiry job: expired {} stale booking(s), released their credit holds", released);
    }
}
