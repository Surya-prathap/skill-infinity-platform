package com.skillinfinity.session.job;

import com.skillinfinity.session.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Auto-completes sessions whose scheduled window has fully passed.
 *
 * <p>A session must NEVER stay \"active\" (or silently hold frozen credits)
 * past its end time. This job runs periodically and hands every expired
 * session to the session service, which:
 *
 * <ol>
 *   <li>flips the session to {@code COMPLETED} (moving it into history),</li>
 *   <li>calculates attendance from the recorded join times,</li>
 *   <li>transfers credits to the mentor when BOTH participants attended ≥ 80%,
 *       or releases the learner's frozen credits otherwise.</li>
 * </ol>
 *
 * The completion is guarded by the session status transition + the wallet's
 * per-session reference, so a session is never settled twice.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SessionCompletionJob {

    private final SessionService sessionService;

    /** Runs every 2 minutes; each run only touches sessions past their end time. */
    @Scheduled(fixedDelayString = "${app.session.completion-job-interval-ms:120000}",
            initialDelayString = "${app.session.completion-job-initial-delay-ms:60000}")
    public void autoCompleteExpiredSessions() {
        int completed = sessionService.autoCompleteExpiredSessions();
        if (completed > 0) {
            log.info("Session completion job: completed {} session(s) and settled their credits", completed);
        }
    }
}
