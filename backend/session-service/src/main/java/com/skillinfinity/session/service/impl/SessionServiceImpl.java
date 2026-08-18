package com.skillinfinity.session.service.impl;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ForbiddenException;
import com.skillinfinity.session.client.MentorClient;
import com.skillinfinity.session.client.WalletClient;
import com.skillinfinity.session.dto.request.AttendanceRequest;
import com.skillinfinity.session.dto.request.BookingRequest;
import com.skillinfinity.session.dto.request.CancellationRequest;
import com.skillinfinity.session.dto.request.CommunitySessionRequest;
import com.skillinfinity.session.dto.request.RescheduleRequestDto;
import com.skillinfinity.session.dto.request.SearchRequest;
import com.skillinfinity.session.dto.request.SessionRequest;
import com.skillinfinity.session.dto.response.AttendanceResponse;
import com.skillinfinity.session.dto.response.BookingResponse;
import com.skillinfinity.session.dto.response.CommunityAllowanceResponse;
import com.skillinfinity.session.dto.response.CommunityImpactResponse;
import com.skillinfinity.session.dto.response.MeetingResponse;
import com.skillinfinity.session.dto.response.SessionResponse;
import com.skillinfinity.session.entity.Attendance;
import com.skillinfinity.session.entity.Booking;
import com.skillinfinity.session.entity.Cancellation;
import com.skillinfinity.session.entity.MeetingLink;
import com.skillinfinity.session.entity.RescheduleRequest;
import com.skillinfinity.session.entity.Session;
import com.skillinfinity.session.entity.SessionHistory;
import com.skillinfinity.session.entity.SessionParticipant;
import com.skillinfinity.session.entity.SessionReminder;
import com.skillinfinity.session.enumeration.AttendanceStatus;
import com.skillinfinity.session.enumeration.BookingStatus;
import com.skillinfinity.session.enumeration.MeetingProvider;
import com.skillinfinity.session.enumeration.ReminderType;
import com.skillinfinity.session.enumeration.SessionStatus;
import com.skillinfinity.session.event.SessionEventPublisher;
import com.skillinfinity.session.exception.BookingNotFoundException;
import com.skillinfinity.session.exception.CancellationNotAllowedException;
import com.skillinfinity.session.exception.DuplicateBookingException;
import com.skillinfinity.session.exception.InvalidSessionStateException;
import com.skillinfinity.session.exception.MeetingNotAvailableException;
import com.skillinfinity.session.exception.RescheduleNotAllowedException;
import com.skillinfinity.session.exception.SessionNotFoundException;
import com.skillinfinity.session.exception.SlotUnavailableException;
import com.skillinfinity.session.mapper.SessionMapper;
import com.skillinfinity.session.repository.AttendanceRepository;
import com.skillinfinity.session.repository.BookingRepository;
import com.skillinfinity.session.repository.CancellationRepository;
import com.skillinfinity.session.repository.MeetingLinkRepository;
import com.skillinfinity.session.repository.RescheduleRequestRepository;
import com.skillinfinity.session.repository.SessionHistoryRepository;
import com.skillinfinity.session.repository.SessionParticipantRepository;
import com.skillinfinity.session.repository.SessionReminderRepository;
import com.skillinfinity.session.repository.SessionRepository;
import com.skillinfinity.session.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionServiceImpl implements SessionService {

    private final SessionRepository sessionRepository;
    private final BookingRepository bookingRepository;
    private final SessionParticipantRepository sessionParticipantRepository;
    private final CancellationRepository cancellationRepository;
    private final RescheduleRequestRepository rescheduleRequestRepository;
    private final MeetingLinkRepository meetingLinkRepository;
    private final AttendanceRepository attendanceRepository;
    private final SessionHistoryRepository sessionHistoryRepository;
    private final SessionReminderRepository sessionReminderRepository;
    private final SessionMapper sessionMapper;
    private final SessionEventPublisher eventPublisher;
    private final WalletClient walletClient;
    private final MentorClient mentorClient;

    private static final int MAX_SESSIONS_PER_DAY = 5;
    private static final int MAX_RESCHEDULE_COUNT = 3;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final String ACTIVE_MENTOR_STATUS = "ACTIVE";

    /**
     * Minimum attendance for a credit transfer: 80% of the scheduled duration.
     * A participant who joined and stayed for at least this share qualifies;
     * otherwise the session's frozen credits are released back to the learner
     * and the mentor earns nothing.
     */
    private static final double ATTENDANCE_THRESHOLD = 0.8;

    /**
     * Community recognition levels (configurable via env/application.yml).
     * Earned through real contribution — never purchasable.
     */
    @Value("${community.recognition.thresholds:5,15,30,50}")
    private List<Integer> recognitionThresholds;

    @Value("${community.recognition.labels:Community Mentor,Active Contributor,Community Champion,Community Leader}")
    private List<String> recognitionLabels;

    @Value("${community.allowance.per-month:5}")
    private int communityMonthlyAllowance;

    /** Community session credit ceiling (spec: 3 credits). */
    @Value("${community.session.max-cost-credits:3}")
    private int communityMaxCostCredits;

    /** Community session learner capacity ceiling (spec: 20 learners). */
    @Value("${community.session.max-learners:20}")
    private int communityMaxLearners;

    /**
     * The REAL Discord meeting invite used for every session (e.g.
     * {@code https://discord.gg/AbCdEfGh}) — a permanent invite created in the
     * actual Skill Infinity Discord server. This is the ONLY meeting URL: it is
     * returned unchanged to both mentor and learner. Leave blank to store NO
     * meeting link; the UI then shows "Meeting link is not available yet.".
     * The service NEVER fabricates a discord.gg code.
     */
    @Value("${app.meeting.discord.url:}")
    private String discordMeetingUrl;

    /**
     * Legacy alias: a REAL invite code (the part after {@code https://discord.gg/}).
     * Used only when {@code app.meeting.discord.url} is blank. Never fabricated.
     */
    @Value("${app.meeting.discord.invite-code:}")
    private String discordInviteCode;

    /**
     * Join window: participants may join a session from this many minutes
     * before its start time until its end time.
     */
    @Value("${app.meeting.join-window-minutes:10}")
    private int joinWindowMinutes;

    // ============================================================
    // Session CRUD
    // ============================================================

    @Override
    @Transactional
    public SessionResponse createSession(SessionRequest request, UUID userId) {
        log.info("Creating session: mentorId={}, learnerId={}", request.getMentorId(), request.getLearnerId());

        validateSessionTime(request.getStartTime(), request.getEndTime());
        checkDuplicateBooking(request.getMentorId(), request.getLearnerId(), request.getStartTime(), request.getEndTime());
        validateSessionLimit(request.getMentorId(), request.getStartTime());

        Session session = sessionMapper.toEntity(request);
        session.setCreatedBy(userId.toString());
        session.setUpdatedBy(userId.toString());

        session = sessionRepository.save(session);

        createSessionParticipants(session, request.getMentorName(), request.getLearnerName());

        createSessionHistory(session.getId(), userId, "CREATED", null, session.getStatus().name(), "Session created");

        createMeetingLink(session);
        scheduleReminders(session);

        log.info("Session created successfully: sessionId={}", session.getId());
        return toUserResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public SessionResponse getSessionById(UUID sessionId, UUID userId) {
        Session session = findSessionById(sessionId);

        // Data isolation: only the session's participants may read its details
        // (which carry the Discord meeting invite). The meeting-link endpoint
        // already enforces the same rule for the actual join.
        if (!isSessionMember(session, userId)) {
            throw new ForbiddenException("You are not part of this session");
        }

        SessionResponse response = sessionMapper.toResponse(session);

        // Always serve the configured REAL Discord invite (never a stored or
        // fabricated URL). Returns null when no invite is configured.
        meetingLinkRepository.findBySessionIdAndActiveTrue(sessionId)
                .ifPresent(link -> response.setMeetingLink(toMeetingResponse(link)));

        return enrichJoinState(response);
    }

    /** True when the user is the mentor, the learner, or a joined participant. */
    private boolean isSessionMember(Session session, UUID userId) {
        return session.getMentorId().equals(userId)
                || session.getLearnerId().equals(userId)
                || sessionParticipantRepository.existsBySessionIdAndUserId(session.getId(), userId);
    }

    @Override
    @Transactional
    public SessionResponse updateSession(UUID sessionId, SessionRequest request, UUID userId) {
        Session session = findSessionById(sessionId);

        if (session.getStatus() != SessionStatus.SCHEDULED) {
            throw new InvalidSessionStateException("Cannot update session in " + session.getStatus() + " state");
        }

        session.setTitle(request.getTitle());
        session.setDescription(request.getDescription());
        session.setTopic(request.getTopic());
        session.setCategory(request.getCategory());
        session.setPrice(request.getPrice());
        session.setCurrency(request.getCurrency());
        session.setFree(request.isFree());

        if (request.getStartTime() != null && request.getEndTime() != null) {
            validateSessionTime(request.getStartTime(), request.getEndTime());
            session.setStartTime(request.getStartTime());
            session.setEndTime(request.getEndTime());
            session.setDurationMinutes(request.getDurationMinutes());
        }

        session.setUpdatedBy(userId.toString());
        session = sessionRepository.save(session);

        createSessionHistory(sessionId, userId, "UPDATED", null, session.getStatus().name(), "Session updated");

        log.info("Session updated: sessionId={}", sessionId);
        return toUserResponse(session);
    }

    @Override
    @Transactional
    public void deleteSession(UUID sessionId, UUID userId) {
        Session session = findSessionById(sessionId);

        if (session.getStatus() == SessionStatus.IN_PROGRESS || session.getStatus() == SessionStatus.COMPLETED) {
            throw new InvalidSessionStateException("Cannot delete session in " + session.getStatus() + " state");
        }

        sessionRepository.delete(session);
        log.info("Session deleted: sessionId={}", sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SessionResponse> getAllSessions(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Session> sessionPage = sessionRepository.findAll(pageable);

        List<SessionResponse> content = sessionPage.getContent().stream()
                .map(sessionMapper::toResponse)
                .toList();

        content.forEach(this::enrichJoinState);

        return PageResponse.of(content, page, size, sessionPage.getTotalElements());
    }

    // ============================================================
    // Booking
    // ============================================================

    @Override
    @Transactional
    public BookingResponse bookSession(BookingRequest request, UUID userId) {
        log.info("Booking session: mentorId={}, learnerId={}", request.getMentorId(), request.getLearnerId());

        // The real slot time is preferredStartTime (e.g. 2026-08-18T09:00).
        // preferredDate may only carry the calendar date (midnight), so
        // validating against it would check the wrong instant — and worse,
        // every booking on the same day would look like the same slot to the
        // duplicate check. Always resolve the actual session start/end.
        LocalDateTime slotStart = request.getPreferredStartTime() != null
                ? request.getPreferredStartTime()
                : request.getPreferredDate();
        LocalDateTime slotEnd = request.getPreferredEndTime() != null
                ? request.getPreferredEndTime()
                : slotStart.plusMinutes(request.getDurationMinutes());

        validateSessionTime(slotStart, slotEnd);

        // ---- Server-side enforcement (never trust the frontend) ----
        // 1. Mentor exists, is verified and active.
        MentorClient.MentorInfo mentor = mentorClient.getMentor(request.getMentorId());
        if (!mentor.verified() || !ACTIVE_MENTOR_STATUS.equals(mentor.status())) {
            throw new BadRequestException("This mentor is not accepting bookings yet");
        }

        // The learner is ALWAYS the authenticated user — a client-supplied
        // learnerId is never trusted (data isolation: no user may create a
        // booking or freeze credits on someone else's behalf).
        UUID learnerUserId = userId;

        // Bookings/sessions store the mentor's USER id (matching community
        // sessions and the wallet, which is keyed by user id). The mentor
        // entity id is only used to look up the mentor-service profile above.
        UUID mentorUserId = mentor.userId() != null ? mentor.userId() : request.getMentorId();

        // 2. The selected session type/duration maps to a configured pricing
        //    plan and the cost is computed from that plan (the credit amount
        //    sent by the frontend is ignored).
        MentorClient.PricingInfo pricing = resolvePricing(request, mentor.id());
        double cost = pricing.isFree() ? 0 : pricing.price().doubleValue();
        if (cost < 0) {
            throw new BadRequestException("Mentor pricing is invalid");
        }

        // 3. The requested slot belongs to the mentor's configured availability.
        List<MentorClient.AvailabilityInfo> availability = mentorClient.getAvailability(mentor.id());
        validateSlotInAvailability(slotStart, slotEnd, availability);

        // ---- Duplicate protection + idempotent retry ----
        // An existing session for this exact slot (a previous booking was
        // already approved) can never be re-booked.
        checkDuplicateSession(mentorUserId, slotStart, slotEnd);

        // The SAME learner re-submitting the same slot — e.g. the first
        // request committed but the response was lost and the frontend showed
        // a timeout — must NOT create a second booking or freeze credits
        // twice. Return the existing booking instead of failing or duplicating.
        Optional<Booking> existingOwnBooking = bookingRepository
                .findOverlappingByMentorAndLearner(mentorUserId, learnerUserId, slotStart, slotEnd);
        if (existingOwnBooking.isPresent()) {
            log.info("Booking already exists for this learner+slot — returning existing booking: bookingId={}",
                    existingOwnBooking.get().getId());
            return sessionMapper.toBookingResponse(existingOwnBooking.get());
        }

        // A DIFFERENT learner has already claimed this slot — hard reject.
        if (bookingRepository.existsOverlappingBooking(mentorUserId, slotStart, slotEnd)) {
            throw new DuplicateBookingException("This time slot is already booked or pending for the mentor");
        }
        validateSessionLimit(mentorUserId, slotStart);

        Booking booking = Booking.builder()
                .mentorId(mentorUserId)
                .learnerId(learnerUserId)
                .mentorName(request.getMentorName())
                .learnerName(request.getLearnerName())
                .topic(request.getTopic())
                .description(request.getDescription())
                .preferredDate(request.getPreferredDate())
                .preferredStartTime(request.getPreferredStartTime())
                .preferredEndTime(request.getPreferredEndTime())
                .durationMinutes(request.getDurationMinutes())
                .price(cost)
                .timezone(request.getTimezone())
                .status(BookingStatus.PENDING)
                .learnerMessage(request.getLearnerMessage())
                .learnerEmail(request.getLearnerEmail())
                .expiresAt(LocalDateTime.now().plusHours(48))
                .createdBy(userId.toString())
                .updatedBy(userId.toString())
                .build();

        booking = bookingRepository.save(booking);

        // Reserve the learner's credits (Welcome → Purchased → Learning).
        // Throws "Insufficient credits…" from the wallet when the balance is short.
        walletClient.freezeCredits(learnerUserId, cost,
                booking.getId(), "Booking hold for session: " + request.getTopic());

        eventPublisher.publishSessionBooked(null, mentorUserId, learnerUserId,
                booking.getId(), request.getMentorName(), request.getLearnerName(),
                request.getTopic(), request.getPreferredDate(), null,
                request.getTimezone(), request.getDurationMinutes());

        log.info("Booking created: bookingId={}, cost={} credits", booking.getId(), cost);
        return sessionMapper.toBookingResponse(booking);
    }

    // ============================================================
    // Booking queries (user-isolated)
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getMentorBookings(UUID userId, String status, int page, int size) {
        // Bookings store the mentor's user id (new data) but legacy rows may
        // still hold the mentor entity id. Match both so a mentor only ever
        // sees their own requests (no cross-mentor leakage, no empty dashboard).
        List<UUID> mentorIds = new java.util.ArrayList<>();
        mentorIds.add(userId);
        UUID entityId = resolveMentorEntityId(userId);
        if (entityId != null && !mentorIds.contains(entityId)) {
            mentorIds.add(entityId);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Booking> bookings = status != null && !status.isBlank()
                ? bookingRepository.findByMentorIdInAndStatus(mentorIds, parseBookingStatus(status), pageable)
                : bookingRepository.findByMentorIdInOrderByCreatedAtDesc(mentorIds, pageable);

        return PageResponse.of(bookings.getContent().stream()
                        .map(sessionMapper::toBookingResponse)
                        .toList(),
                page, size, bookings.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> getLearnerBookings(UUID learnerId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Booking> bookings = status != null && !status.isBlank()
                ? bookingRepository.findByLearnerIdAndStatus(learnerId, parseBookingStatus(status), pageable)
                : bookingRepository.findByLearnerIdOrderByCreatedAtDesc(learnerId, pageable);

        return PageResponse.of(bookings.getContent().stream()
                        .map(sessionMapper::toBookingResponse)
                        .toList(),
                page, size, bookings.getTotalElements());
    }

    private BookingStatus parseBookingStatus(String status) {
        try {
            return BookingStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid booking status: " + status);
        }
    }

    /**
     * Bridges the gateway's X-User-ID (a user id) to the mentor entity id that
     * bookings/sessions store. Returns null when the user has no mentor profile.
     */
    private UUID resolveMentorEntityId(UUID userId) {
        try {
            return mentorClient.getMentorIdByUserId(userId);
        } catch (RuntimeException e) {
            log.warn("Could not resolve mentor profile for userId={}: {}", userId, e.getMessage());
            return null;
        }
    }

    /**
     * True when the given user id identifies the booking's owning mentor.
     * Accepts both the mentor entity id (legacy callers) and the user id.
     */
    private boolean isBookingMentor(Booking booking, UUID userId) {
        if (booking.getMentorId().equals(userId)) {
            return true;
        }
        UUID mentorEntityId = resolveMentorEntityId(userId);
        return mentorEntityId != null && booking.getMentorId().equals(mentorEntityId);
    }

    /**
     * Matches the requested session to one of the mentor's pricing plans.
     * Preference order: explicit {@code pricingId}, then sessionType+duration
     * (the type is derived from the topic only when pricingId is absent and the
     * request carried it), then duration only. The backend always recomputes
     * the cost — the frontend-provided credit amount is never trusted.
     */
    private MentorClient.PricingInfo resolvePricing(BookingRequest request, UUID mentorId) {
        List<MentorClient.PricingInfo> plans = mentorClient.getPricing(mentorId);
        if (plans.isEmpty()) {
            throw new BadRequestException("This mentor has not configured session pricing yet");
        }

        MentorClient.PricingInfo match = null;
        if (request.getPricingId() != null) {
            match = plans.stream()
                    .filter(plan -> request.getPricingId().equals(plan.id()))
                    .findFirst()
                    .orElse(null);
        }
        if (match == null) {
            match = plans.stream()
                    .filter(plan -> plan.durationMinutes() != null
                            && plan.durationMinutes() == request.getDurationMinutes())
                    .findFirst()
                    .orElse(null);
        }
        if (match == null) {
            match = plans.get(0);
        }

        // A plan that exists but does not match the requested duration is a
        // booking-data mismatch — reject rather than silently charging the wrong
        // amount when the request explicitly targeted a different duration.
        if (match.durationMinutes() != null
                && request.getPricingId() == null
                && match.durationMinutes() != request.getDurationMinutes()) {
            throw new BadRequestException("The selected session type does not support "
                    + request.getDurationMinutes() + " minutes — pick a matching session type.");
        }
        return match;
    }

    /**
     * Backend enforcement of mentor availability: the requested slot must fall
     * entirely inside one of the mentor's configured windows for that date.
     * Recurring windows match by day-of-week; one-off windows by specificDate.
     * Break ranges are excluded, so a slot straddling a break is rejected.
     */
    private void validateSlotInAvailability(LocalDateTime slotStart, LocalDateTime slotEnd,
                                            List<MentorClient.AvailabilityInfo> availability) {
        if (availability == null || availability.isEmpty()) {
            throw new BadRequestException("This mentor has no availability configured for bookings");
        }

        DayOfWeek requestedDay = slotStart.getDayOfWeek();
        LocalTime requestedStart = slotStart.toLocalTime();
        LocalTime requestedEnd = slotEnd.toLocalTime();

        for (MentorClient.AvailabilityInfo window : availability) {
            // Archived/inactive windows must never be bookable.
            if (!window.active()) {
                continue;
            }
            boolean matchesDay = window.recurring()
                    ? requestedDay.name().equalsIgnoreCase(window.dayOfWeek())
                    : window.specificDate() != null && slotStart.toLocalDate().toString().equals(window.specificDate());
            if (!matchesDay) {
                continue;
            }

            LocalTime windowStart = parseTime(window.startTime());
            LocalTime windowEnd = parseTime(window.endTime());
            if (windowStart == null || windowEnd == null) {
                continue;
            }

            // Slot must be fully inside the working window.
            boolean inside = !requestedStart.isBefore(windowStart) && !requestedEnd.isAfter(windowEnd);
            if (!inside) {
                continue;
            }

            // Slot must not overlap a break range.
            if (window.breakStartTime() != null && window.breakEndTime() != null) {
                LocalTime breakStart = parseTime(window.breakStartTime());
                LocalTime breakEnd = parseTime(window.breakEndTime());
                if (breakStart != null && breakEnd != null
                        && requestedStart.isBefore(breakEnd) && requestedEnd.isAfter(breakStart)) {
                    continue;
                }
            }

            return; // matched a valid window
        }

        throw new BadRequestException(
                "This time slot is not within the mentor's availability. Please pick an available date and time.");
    }

    private LocalTime parseTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalTime.parse(value.trim(), TIME_FORMATTER);
        } catch (DateTimeParseException e) {
            try {
                return LocalTime.parse(value.trim());
            } catch (DateTimeParseException e2) {
                return null;
            }
        }
    }

    @Override
    @Transactional
    public BookingResponse approveBooking(UUID bookingId, UUID mentorId) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidSessionStateException("Booking is not in pending state");
        }

        if (!isBookingMentor(booking, mentorId)) {
            throw new BadRequestException("Only the mentor can approve this booking");
        }

        booking.setStatus(BookingStatus.APPROVED);
        booking.setApprovedAt(LocalDateTime.now());
        booking.setUpdatedBy(mentorId.toString());
        booking = bookingRepository.save(booking);

        Session session = createSessionFromBooking(booking);
        booking.setSessionId(session.getId());
        bookingRepository.save(booking);

        eventPublisher.publishSessionApproved(session.getId(), booking.getMentorId(),
                booking.getLearnerId(), booking.getId(),
                booking.getMentorName(), booking.getLearnerName(),
                booking.getTopic(), session.getStartTime(), session.getEndTime(),
                session.getTimezone(), session.getDurationMinutes());

        log.info("Booking approved: bookingId={}, sessionId={}", bookingId, session.getId());
        return sessionMapper.toBookingResponse(booking);
    }

    @Override
    @Transactional
    public BookingResponse rejectBooking(UUID bookingId, UUID mentorId, String reason) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidSessionStateException("Booking is not in pending state");
        }

        if (!isBookingMentor(booking, mentorId)) {
            throw new BadRequestException("Only the mentor can reject this booking");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(reason);
        booking.setRejectedAt(LocalDateTime.now());
        booking.setUpdatedBy(mentorId.toString());
        booking = bookingRepository.save(booking);

        // Release the learner's booking hold.
        walletClient.releaseCredits(booking.getLearnerId(), booking.getPrice(),
                booking.getId(), "Booking rejected by mentor");

        eventPublisher.publishSessionRejected(null, booking.getMentorId(),
                booking.getLearnerId(), booking.getId(),
                booking.getMentorName(), booking.getLearnerName(),
                booking.getTopic(), reason);

        log.info("Booking rejected: bookingId={}", bookingId);
        return sessionMapper.toBookingResponse(booking);
    }

    // ============================================================
    // Session Lifecycle
    // ============================================================

    @Override
    @Transactional
    public SessionResponse startSession(UUID sessionId, UUID userId) {
        Session session = findSessionById(sessionId);

        if (session.getStatus() != SessionStatus.APPROVED && session.getStatus() != SessionStatus.SCHEDULED) {
            throw new InvalidSessionStateException("Session must be in APPROVED or SCHEDULED state to start");
        }

        session.setStatus(SessionStatus.IN_PROGRESS);
        session.setStartedAt(LocalDateTime.now());
        session.setUpdatedBy(userId.toString());
        session = sessionRepository.save(session);

        createSessionHistory(sessionId, userId, "STARTED", "APPROVED", "IN_PROGRESS", "Session started");

        log.info("Session started: sessionId={}", sessionId);
        return toUserResponse(session);
    }

    @Override
    @Transactional
    public SessionResponse endSession(UUID sessionId, UUID userId) {
        Session session = findSessionById(sessionId);

        if (session.getStatus() != SessionStatus.IN_PROGRESS) {
            throw new InvalidSessionStateException("Session must be in IN_PROGRESS state to end");
        }

        session.setStatus(SessionStatus.COMPLETED);
        session.setEndedAt(LocalDateTime.now());
        session.setCompletedAt(LocalDateTime.now());
        session.setUpdatedBy(userId.toString());
        session = sessionRepository.save(session);

        createSessionHistory(sessionId, userId, "ENDED", "IN_PROGRESS", "COMPLETED", "Session ended");

        // Credits are settled ONLY on completion and ONLY when the 80%
        // attendance rule is met — see settleSessionOnCompletion.
        settleSessionOnCompletion(session);

        log.info("Session ended: sessionId={}", sessionId);
        return toUserResponse(session);
    }

    @Override
    @Transactional
    public SessionResponse completeSession(UUID sessionId, UUID userId) {
        Session session = findSessionById(sessionId);

        if (session.getStatus() == SessionStatus.COMPLETED) {
            throw new InvalidSessionStateException("Session is already completed");
        }

        session.setStatus(SessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        if (session.getEndedAt() == null) {
            session.setEndedAt(LocalDateTime.now());
        }
        session.setUpdatedBy(userId.toString());
        session = sessionRepository.save(session);

        createSessionHistory(sessionId, userId, "COMPLETED", null, "COMPLETED", "Session completed");

        // Credits transfer only after successful completion (see endSession).
        settleSessionOnCompletion(session);

        return toUserResponse(session);
    }

    @Override
    @Transactional
    public int autoCompleteExpiredSessions() {
        List<Session> expired = sessionRepository.findSessionsToAutoComplete(LocalDateTime.now());
        int completed = 0;
        for (Session session : expired) {
            try {
                completeExpiredSession(session);
                completed++;
            } catch (RuntimeException e) {
                // One stale/broken session (e.g. a wallet hold that was already
                // released, or a wallet hiccup) must never roll back the whole
                // batch — otherwise every session the job touched this run is
                // retried forever and the error spams logs every 2 minutes.
                log.warn("Session completion job: could not auto-complete session {}: {}",
                        session.getId(), e.getMessage());
            }
        }
        if (completed > 0) {
            log.info("Session completion job: auto-completed {} expired session(s)", completed);
        }
        return completed;
    }

    /**
     * Finishes a session whose scheduled window has passed: flips it to
     * COMPLETED and settles credits exactly once. Sessions that never started
     * (no one joined) end with attendance 0 — their frozen credits are
     * released, never silently transferred.
     */
    private void completeExpiredSession(Session session) {
        session.setStatus(SessionStatus.COMPLETED);
        session.setEndedAt(LocalDateTime.now());
        session.setCompletedAt(LocalDateTime.now());
        session.setUpdatedBy("system");
        session = sessionRepository.save(session);

        createSessionHistory(session.getId(), null, "AUTO_COMPLETED", null, "COMPLETED",
                "Session ended automatically at its scheduled end time");

        settleSessionOnCompletion(session);
    }

    // ============================================================
    // Reschedule
    // ============================================================

    @Override
    @Transactional
    public SessionResponse rescheduleSession(RescheduleRequestDto request, UUID userId) {
        Session session = findSessionById(request.getSessionId());

        if (session.getRescheduleCount() >= MAX_RESCHEDULE_COUNT) {
            throw new RescheduleNotAllowedException("Maximum reschedule limit reached");
        }

        if (session.getStatus() != SessionStatus.SCHEDULED && session.getStatus() != SessionStatus.APPROVED) {
            throw new InvalidSessionStateException("Cannot reschedule session in " + session.getStatus() + " state");
        }

        validateSessionTime(request.getProposedStartTime(), request.getProposedEndTime());

        RescheduleRequest rescheduleRequest = RescheduleRequest.builder()
                .sessionId(request.getSessionId())
                .bookingId(session.getBookingId())
                .requestedBy(userId)
                .originalStartTime(session.getStartTime())
                .originalEndTime(session.getEndTime())
                .proposedStartTime(request.getProposedStartTime())
                .proposedEndTime(request.getProposedEndTime())
                .reason(request.getReason())
                .status("APPROVED")
                .createdBy(userId.toString())
                .updatedBy(userId.toString())
                .build();

        rescheduleRequestRepository.save(rescheduleRequest);

        session.setStartTime(request.getProposedStartTime());
        session.setEndTime(request.getProposedEndTime());
        session.setRescheduleCount(session.getRescheduleCount() + 1);
        session.setStatus(SessionStatus.RESCHEDULED);
        session.setUpdatedBy(userId.toString());
        session = sessionRepository.save(session);

        createSessionHistory(session.getId(), userId, "RESCHEDULED", null, "RESCHEDULED",
                "Rescheduled from " + rescheduleRequest.getOriginalStartTime() + " to " + request.getProposedStartTime());

        eventPublisher.publishSessionRescheduled(session.getId(), session.getMentorId(),
                session.getLearnerId(), session.getBookingId(),
                session.getMentorName(), session.getLearnerName(),
                session.getTopic(), session.getStartTime(), session.getEndTime(),
                session.getTimezone(), session.getDurationMinutes(), request.getReason());

        log.info("Session rescheduled: sessionId={}", session.getId());
        return toUserResponse(session);
    }

    // ============================================================
    // Cancel
    // ============================================================

    @Override
    @Transactional
    public SessionResponse cancelSession(CancellationRequest request, UUID userId) {
        Session session = findSessionById(request.getSessionId());

        if (session.getStatus() == SessionStatus.COMPLETED || session.getStatus() == SessionStatus.CANCELLED) {
            throw new CancellationNotAllowedException("Cannot cancel session in " + session.getStatus() + " state");
        }

        Cancellation cancellation = Cancellation.builder()
                .sessionId(request.getSessionId())
                .bookingId(session.getBookingId())
                .cancelledBy(userId)
                .reason(request.getReason())
                .cancellationType(request.getCancellationType() != null ? request.getCancellationType() : "VOLUNTARY")
                .isRefundable(session.getStartTime().isAfter(LocalDateTime.now().plusHours(24)))
                .createdBy(userId.toString())
                .updatedBy(userId.toString())
                .build();

        cancellationRepository.save(cancellation);

        if (session.isCommunity()) {
            // Community sessions: each learner who joined a PAID (1–3 credit)
            // community session holds a credit reservation. Release every
            // learner's hold so cancelled sessions never transfer credits.
            // FREE community sessions hold nothing and are skipped.
            if (session.getPrice() > 0) {
                double holdCredits = session.getPrice();
                UUID sessionIdForHold = session.getId();
                sessionParticipantRepository.findBySessionIdAndRole(session.getId(), "LEARNER")
                        .forEach(learner -> walletClient.releaseCredits(
                                learner.getUserId(), holdCredits,
                                sessionIdForHold, "Community session cancelled"));
            }
        } else {
            // Professional sessions: release the learner's booking hold.
            walletClient.releaseCredits(session.getLearnerId(), session.getPrice(),
                    session.getId(), "Session cancelled");
        }

        session.setStatus(SessionStatus.CANCELLED);
        session.setCancellationReason(request.getReason());
        session.setCancelledBy(userId);
        session.setCancelledAt(LocalDateTime.now());
        session.setUpdatedBy(userId.toString());
        session = sessionRepository.save(session);

        if (session.getBookingId() != null) {
            bookingRepository.findById(session.getBookingId()).ifPresent(booking -> {
                booking.setStatus(BookingStatus.CANCELLED);
                booking.setUpdatedBy(userId.toString());
                bookingRepository.save(booking);
            });
        }

        createSessionHistory(session.getId(), userId, "CANCELLED", null, "CANCELLED",
                "Cancelled: " + (request.getReason() != null ? request.getReason() : "No reason provided"));

        eventPublisher.publishSessionCancelled(session.getId(), session.getMentorId(),
                session.getLearnerId(), session.getBookingId(),
                session.getMentorName(), session.getLearnerName(),
                session.getTopic(), request.getReason());

        log.info("Session cancelled: sessionId={}", session.getId());
        return toUserResponse(session);
    }

    // ============================================================
    // Queries
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SessionResponse> getUpcomingSessions(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startTime"));
        Page<Session> sessionPage = sessionRepository.findUpcomingByUserId(userId, LocalDateTime.now(), pageable);

        List<SessionResponse> content = sessionPage.getContent().stream()
                .map(sessionMapper::toResponse)
                .toList();

        attachMeetingLinks(content);
        content.forEach(this::enrichJoinState);

        return PageResponse.of(content, page, size, sessionPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SessionResponse> getSessionHistory(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startTime"));
        Page<Session> sessionPage = sessionRepository.findHistoryByUserId(userId, LocalDateTime.now(), pageable);

        List<SessionResponse> content = sessionPage.getContent().stream()
                .map(sessionMapper::toResponse)
                .toList();

        content.forEach(this::enrichJoinState);

        return PageResponse.of(content, page, size, sessionPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SessionResponse> searchSessions(SearchRequest request, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startTime"));
        Page<Session> sessionPage;

        if (request.getMentorId() != null) {
            sessionPage = sessionRepository.findByMentorId(request.getMentorId(), pageable);
        } else if (request.getLearnerId() != null) {
            sessionPage = sessionRepository.findByLearnerId(request.getLearnerId(), pageable);
        } else {
            sessionPage = sessionRepository.findAll(pageable);
        }

        List<SessionResponse> content = sessionPage.getContent().stream()
                .map(sessionMapper::toResponse)
                .toList();

        content.forEach(this::enrichJoinState);

        return PageResponse.of(content, page, size, sessionPage.getTotalElements());
    }

    // ============================================================
    // Attendance
    // ============================================================

    @Override
    @Transactional
    public AttendanceResponse markAttendance(AttendanceRequest request, UUID userId) {
        Session session = findSessionById(request.getSessionId());

        if (session.getStatus() != SessionStatus.IN_PROGRESS && session.getStatus() != SessionStatus.COMPLETED) {
            throw new InvalidSessionStateException("Cannot mark attendance for session in " + session.getStatus() + " state");
        }

        Attendance attendance = attendanceRepository
                .findBySessionIdAndUserId(request.getSessionId(), request.getUserId())
                .orElse(null);

        AttendanceStatus status;
        try {
            status = AttendanceStatus.valueOf(request.getAttendanceStatus());
        } catch (IllegalArgumentException e) {
            status = AttendanceStatus.PRESENT;
        }

        if (attendance == null) {
            attendance = Attendance.builder()
                    .sessionId(request.getSessionId())
                    .userId(request.getUserId())
                    .status(status)
                    .joinTime(request.getJoinTime())
                    .leaveTime(request.getLeaveTime())
                    .late(request.isLate())
                    .lateMinutes(request.getLateMinutes())
                    .deviceInfo(request.getDeviceInfo())
                    .markedBy(userId)
                    .markedAt(LocalDateTime.now())
                    .createdBy(userId.toString())
                    .updatedBy(userId.toString())
                    .build();

            if (request.getJoinTime() != null && request.getLeaveTime() != null) {
                attendance.setDurationSeconds(ChronoUnit.SECONDS.between(request.getJoinTime(), request.getLeaveTime()));
            }
        } else {
            attendance.setStatus(status);
            attendance.setLeaveTime(request.getLeaveTime());
            attendance.setUpdatedBy(userId.toString());

            if (request.getJoinTime() != null && request.getLeaveTime() != null) {
                attendance.setDurationSeconds(ChronoUnit.SECONDS.between(request.getJoinTime(), request.getLeaveTime()));
            }
        }

        attendance = attendanceRepository.save(attendance);

        log.info("Attendance marked: sessionId={}, userId={}, status={}",
                request.getSessionId(), request.getUserId(), status);
        return sessionMapper.toAttendanceResponse(attendance);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getAttendance(UUID sessionId, UUID userId) {
        Attendance attendance = attendanceRepository.findBySessionIdAndUserId(sessionId, userId)
                .orElse(null);

        if (attendance == null) {
            return null;
        }

        return sessionMapper.toAttendanceResponse(attendance);
    }

    // ============================================================
    // Meeting
    // ============================================================

    @Override
    @Transactional
    public MeetingResponse getMeetingLink(UUID sessionId, UUID userId) {
        Session session = findSessionById(sessionId);

        // 1. Only the session's participants may access its meeting.
        boolean isMember = session.getMentorId().equals(userId)
                || session.getLearnerId().equals(userId)
                || sessionParticipantRepository.existsBySessionIdAndUserId(sessionId, userId);
        if (!isMember) {
            throw new ForbiddenException("You are not part of this session");
        }

        // 2. Session must be approved/active — never pending, rejected or finished.
        switch (session.getStatus()) {
            case PENDING_APPROVAL, SCHEDULED, APPROVED, IN_PROGRESS -> {
                // ok — falls through to the join-window check
            }
            case REJECTED -> throw new BadRequestException("Session request was rejected.");
            case COMPLETED, CANCELLED, NO_SHOW, EXPIRED, RESCHEDULED ->
                    throw new BadRequestException("Session has ended.");
        }

        // 3. Join window: start - joinWindowMinutes → end. Never rely on the
        //    frontend alone for this timing.
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime joinOpensAt = session.getStartTime().minusMinutes(joinWindowMinutes);
        if (now.isBefore(joinOpensAt)) {
            throw new BadRequestException("Join will be available " + joinWindowMinutes
                    + " minutes before the session.");
        }
        if (now.isAfter(session.getEndTime())) {
            throw new BadRequestException("Session has ended.");
        }

        // 4. The meeting link is guaranteed to exist by the time the join
        //    window opens (created with the session). Legacy sessions created
        //    before link generation get one lazily — exactly ONE persisted
        //    link per session, shared by both participants, never regenerated.
        MeetingLink meetingLink = ensureMeetingLink(session);

        // 5. Record the join as attendance evidence. The first join in the
        //    window sets the join time (a rejoin never resets it) so the 80%
        //    attendance rule at completion has real data to work with.
        recordSessionJoin(session, userId);

        return sessionMapper.toMeetingResponse(meetingLink);
    }

    /**
     * Records a participant's join time as attendance evidence. The EARLIEST
     * join time wins — a rejoin (accidental Discord disconnect, browser
     * restart) must never reset the attendance clock.
     */
    private void recordSessionJoin(Session session, UUID userId) {
        LocalDateTime now = LocalDateTime.now();
        Attendance attendance = attendanceRepository
                .findBySessionIdAndUserId(session.getId(), userId)
                .orElse(null);
        if (attendance == null) {
            attendance = Attendance.builder()
                    .sessionId(session.getId())
                    .userId(userId)
                    .status(AttendanceStatus.PRESENT)
                    .joinTime(now)
                    .markedBy(userId)
                    .markedAt(now)
                    .createdBy(userId.toString())
                    .updatedBy(userId.toString())
                    .build();
            attendanceRepository.save(attendance);
        } else if (attendance.getJoinTime() == null || now.isBefore(attendance.getJoinTime())) {
            attendance.setJoinTime(now);
            attendance.setStatus(AttendanceStatus.PRESENT);
            attendance.setUpdatedBy(userId.toString());
            attendanceRepository.save(attendance);
        }
    }

    // ============================================================
    // Community Sessions
    // ============================================================

    @Override
    @Transactional
    public SessionResponse createCommunitySession(CommunitySessionRequest request, UUID mentorId) {
        validateSessionTime(request.getStartTime(), request.getEndTime());
        // Backend enforcement — never rely on frontend validation alone.
        validateCommunityCost(request.getCost());
        validateCommunityCapacity(request.getMaxParticipants());

        // Idempotency: a mentor can never schedule two sessions in the same
        // time slot. If a retried "Add Schedule" request reaches the backend
        // after the first attempt already committed (e.g. the response was
        // lost on a flaky connection and the browser showed a timeout), the
        // duplicate is rejected instead of silently creating two sessions.
        checkDuplicateBooking(mentorId, mentorId, request.getStartTime(), request.getEndTime());

        boolean trueFree = request.getCost() == 0;
        Session session = Session.builder()
                .title(request.getTopic())
                .description(request.getDescription())
                .mentorId(mentorId)
                .learnerId(mentorId) // host fills the slot; real learners join as participants
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes((int) ChronoUnit.MINUTES.between(request.getStartTime(), request.getEndTime()))
                .timezone(request.getTimezone())
                .status(SessionStatus.SCHEDULED)
                .topic(request.getTopic())
                .price(request.getCost())
                .currency("INR")
                .free(trueFree)
                .community(true)
                .maxParticipants(request.getMaxParticipants())
                .createdBy(mentorId.toString())
                .updatedBy(mentorId.toString())
                .build();
        session = sessionRepository.save(session);

        SessionParticipant host = SessionParticipant.builder()
                .sessionId(session.getId())
                .userId(mentorId)
                .role("MENTOR")
                .attendanceStatus(AttendanceStatus.NOT_MARKED)
                .isHost(true)
                .hasConsent(true)
                .joinedAt(LocalDateTime.now())
                .createdBy(mentorId.toString())
                .updatedBy(mentorId.toString())
                .build();
        sessionParticipantRepository.save(host);

        createSessionHistory(session.getId(), mentorId, "CREATED", null, "SCHEDULED",
                "Community session scheduled");
        createMeetingLink(session);
        scheduleReminders(session);

        log.info("Community session created: sessionId={}, mentorId={}", session.getId(), mentorId);
        return toUserResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SessionResponse> getUpcomingCommunitySessions(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startTime"));
        Page<Session> sessions = sessionRepository.findUpcomingCommunitySessions(LocalDateTime.now(), pageable);

        List<SessionResponse> content = sessions.getContent().stream()
                .map(sessionMapper::toResponse)
                .toList();

        // Batch the seat counts for the whole page in two queries instead of
        // one count query per session (N+1 on the community tab).
        if (!sessions.getContent().isEmpty()) {
            Map<UUID, Long> learnersBySession = countBySessionIds(sessions.getContent(), "LEARNER");
            Map<UUID, Long> totalBySession = countBySessionIds(sessions.getContent(), null);
            content.forEach(response -> {
                int capacity = response.getMaxParticipants() != null ? response.getMaxParticipants() : communityMaxLearners;
                long learners = learnersBySession.getOrDefault(response.getId(), 0L);
                response.setMaxParticipants(capacity);
                response.setLearnerCount((int) learners);
                response.setParticipantCount(totalBySession.getOrDefault(response.getId(), 0L).intValue());
                response.setRemainingSeats(Math.max(0, capacity - (int) learners));
            });
        }

        attachMeetingLinks(content);
        content.forEach(this::enrichJoinState);

        return PageResponse.of(content, page, size, sessions.getTotalElements());
    }

    /** Returns sessionId → participant count for the given sessions and role (null = all roles). */
    private Map<UUID, Long> countBySessionIds(List<Session> sessions, String role) {
        List<UUID> sessionIds = sessions.stream().map(Session::getId).toList();
        List<Object[]> rows = role != null
                ? sessionParticipantRepository.countLearnersBySessionIds(sessionIds)
                : sessionParticipantRepository.countBySessionIds(sessionIds);
        return rows.stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> ((Number) row[1]).longValue(),
                        (a, b) -> a));
    }

    @Override
    @Transactional
    public SessionResponse joinCommunitySession(UUID sessionId, UUID userId) {
        // Pessimistic row lock: concurrent bookings of the last seats are
        // serialized, so the capacity check below can never overbook.
        Session session = sessionRepository.findByIdForUpdate(sessionId)
                .orElseThrow(() -> new SessionNotFoundException("id", sessionId.toString()));
        if (!session.isCommunity()) {
            throw new BadRequestException("This session is not a community session");
        }
        if (session.getStatus() != SessionStatus.SCHEDULED) {
            throw new BadRequestException("This community session is no longer open for joining");
        }
        if (session.getStartTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This community session has already started");
        }
        if (session.getMentorId().equals(userId)) {
            throw new BadRequestException("You cannot join your own community session");
        }
        if (sessionParticipantRepository.existsBySessionIdAndUserId(sessionId, userId)) {
            throw new BadRequestException("You have already joined this community session");
        }

        // Capacity enforcement — a full session (maxParticipants learners)
        // rejects any further joins.
        int learnerCount = (int) sessionParticipantRepository.countBySessionIdAndRole(sessionId, "LEARNER");
        int capacity = session.getMaxParticipants() != null ? session.getMaxParticipants() : communityMaxLearners;
        if (learnerCount >= capacity) {
            throw new BadRequestException("This community session is full (" + capacity + "/"
                    + capacity + " seats taken). Join another session or book a professional session.");
        }

        double cost = session.getPrice();
        if (cost > 0) {
            // Paid community session (1–3 credits): reserve the learner's
            // credits now. They are transferred to the mentor only after the
            // session is successfully completed (SESSION_COMPLETED event).
            walletClient.freezeCredits(userId, cost, sessionId,
                    "Community session hold: " + session.getTopic());
        } else {
            // Only TRUE-FREE (0-credit) sessions consume the monthly
            // free-session allowance. Paid community sessions never do.
            CommunityAllowanceResponse allowance = getCommunityAllowance(userId);
            if (allowance.getRemaining() <= 0) {
                throw new BadRequestException("You have used your " + allowance.getLimit()
                        + " free community sessions for this month. Book a professional session or try again next month.");
            }
        }

        SessionParticipant learner = SessionParticipant.builder()
                .sessionId(sessionId)
                .userId(userId)
                .role("LEARNER")
                .attendanceStatus(AttendanceStatus.NOT_MARKED)
                .isHost(false)
                .hasConsent(true)
                .joinedAt(LocalDateTime.now())
                .createdBy(userId.toString())
                .updatedBy(userId.toString())
                .build();
        sessionParticipantRepository.save(learner);

        log.info("Learner {} joined community session {} (cost={} credits, learners={}/{})",
                userId, sessionId, cost, learnerCount + 1, capacity);
        SessionResponse response = toUserResponse(session);
        enrichCommunitySeats(response, sessionId, session);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityAllowanceResponse getCommunityAllowance(UUID userId) {
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        // Only TRUE-FREE (0-credit) community session joins count against the
        // monthly free-session allowance — paid community sessions never do.
        long used = sessionParticipantRepository
                .countFreeCommunityJoinsSince(userId, monthStart);
        int remaining = Math.max(0, communityMonthlyAllowance - (int) used);
        return CommunityAllowanceResponse.builder()
                .limit(communityMonthlyAllowance)
                .used((int) used)
                .remaining(remaining)
                .month(LocalDate.now().getMonth().name() + " " + LocalDate.now().getYear())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityImpactResponse getMentorCommunityImpact(UUID mentorId) {
        long completed = sessionRepository.countCompletedCommunityByMentor(mentorId);
        long learnersHelped = sessionParticipantRepository.countDistinctCommunityLearners(mentorId);
        long minutes = sessionRepository.sumCommunityMinutesByMentor(mentorId);
        double hours = Math.round(minutes / 60.0 * 10.0) / 10.0;

        int level = 0;
        for (int i = 0; i < recognitionThresholds.size(); i++) {
            if (completed >= recognitionThresholds.get(i)) {
                level = i + 1;
            }
        }

        String label = (level > 0 && level <= recognitionLabels.size())
                ? recognitionLabels.get(level - 1) : null;
        long nextLevelAt = 0;
        String nextLabel = null;
        if (level < recognitionThresholds.size()) {
            nextLevelAt = recognitionThresholds.get(level);
            nextLabel = recognitionLabels.get(level);
        }

        log.info("Community impact queried: mentorId={}, completed={}, learners={}, hours={}, level={}",
                mentorId, completed, learnersHelped, hours, level);
        return CommunityImpactResponse.builder()
                .completedSessions(completed)
                .learnersHelped(learnersHelped)
                .communityHours(hours)
                .level(level)
                .levelLabel(label)
                .nextLevelAt(nextLevelAt)
                .nextLevelLabel(nextLabel)
                .build();
    }

    // ============================================================
    // Private Helper Methods
    // ============================================================

    /**
     * Attaches each session's active meeting link so the UI can render the
     * "Join session" action directly from list responses (batched in a single
     * query to avoid N+1 lookups).
     */
    private void attachMeetingLinks(List<SessionResponse> responses) {
        if (responses.isEmpty()) {
            return;
        }
        List<UUID> sessionIds = responses.stream()
                .map(SessionResponse::getId)
                .toList();
        Map<UUID, MeetingLink> linksBySession = meetingLinkRepository
                .findBySessionIdInAndActiveTrue(sessionIds).stream()
                .collect(Collectors.toMap(MeetingLink::getSessionId, Function.identity(), (a, b) -> a));
        responses.forEach(response -> {
            MeetingLink link = linksBySession.get(response.getId());
            if (link != null) {
                // Serve the configured REAL invite, never a stored/legacy URL.
                response.setMeetingLink(toMeetingResponse(link));
            }
        });
    }

    /**
     * Maps a stored link to a response but ALWAYS overrides the URLs with the
     * configured REAL Discord invite. Returns {@code null} when no real invite
     * is configured (the frontend then shows "Meeting link is not available
     * yet." instead of a fake URL).
     */
    private MeetingResponse toMeetingResponse(MeetingLink link) {
        String joinUrl = resolveMeetingUrl();
        if (joinUrl == null) {
            return null;
        }
        MeetingResponse response = sessionMapper.toMeetingResponse(link);
        response.setMeetingUrl(joinUrl);
        response.setJoinUrl(joinUrl);
        return response;
    }

    /**
     * Populates the explicit join-state fields on a response so the frontend
     * never has to guess: {@code joinAvailableAt} (start - join window),
     * {@code joinAllowed} (server time + session status) and
     * {@code sessionLinkAvailable}. Call AFTER meeting links are attached.
     */
    private SessionResponse enrichJoinState(SessionResponse response) {
        if (response.getStartTime() == null || response.getEndTime() == null) {
            response.setJoinAllowed(false);
            return response;
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime joinOpensAt = response.getStartTime().minusMinutes(joinWindowMinutes);
        response.setJoinAvailableAt(joinOpensAt);

        SessionStatus status = response.getStatus();
        boolean joinableStatus = status == SessionStatus.SCHEDULED
                || status == SessionStatus.APPROVED
                || status == SessionStatus.IN_PROGRESS;
        boolean inWindow = !now.isBefore(joinOpensAt) && !now.isAfter(response.getEndTime());
        // Join eligibility is status + join window ONLY. The Join button stays
        // visible during the window for both mentor and learner (it must never
        // be removed). A missing real invite (blank DISCORD_MEETING_URL) is
        // reported through sessionLinkAvailable=false, and the join endpoint
        // then answers "Meeting link is not available yet." instead of opening
        // Discord — the backend never fabricates a URL.
        boolean linkAvailable = response.getMeetingLink() != null
                && (response.getMeetingLink().getJoinUrl() != null
                || response.getMeetingLink().getMeetingUrl() != null);
        response.setSessionLinkAvailable(linkAvailable);
        response.setJoinAllowed(joinableStatus && inWindow);
        return response;
    }

    /** Single-session responses: map + attach meeting link + enrich in one step. */
    private SessionResponse toUserResponse(Session session) {
        SessionResponse response = sessionMapper.toResponse(session);
        meetingLinkRepository.findBySessionIdAndActiveTrue(session.getId())
                .ifPresent(link -> response.setMeetingLink(toMeetingResponse(link)));
        return enrichJoinState(response);
    }

    private Session findSessionById(UUID sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new SessionNotFoundException("id", sessionId.toString()));
    }

    private Booking findBookingById(UUID bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("id", bookingId.toString()));
    }

    private void validateSessionTime(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new BadRequestException("Start time and end time are required");
        }

        if (startTime.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot book sessions in the past");
        }

        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("End time must be after start time");
        }

        if (ChronoUnit.MINUTES.between(startTime, endTime) > 480) {
            throw new BadRequestException("Session duration cannot exceed 8 hours");
        }

        // Minimum 10 minutes — 1 credit = 10 minutes of learning.
        if (ChronoUnit.MINUTES.between(startTime, endTime) < 10) {
            throw new BadRequestException("Session duration must be at least 10 minutes");
        }
    }

    /**
     * True when the mentor already has a session for this exact slot — the
     * slot can never be re-booked (used by the booking idempotency flow
     * BEFORE the learner-aware booking-overlap check).
     */
    private void checkDuplicateSession(UUID mentorId, LocalDateTime startTime, LocalDateTime endTime) {
        boolean exists = sessionRepository.existsByMentorIdAndStartTimeAndEndTimeAndStatusNotIn(
                mentorId, startTime, endTime,
                List.of(SessionStatus.CANCELLED, SessionStatus.REJECTED));
        if (exists) {
            throw new DuplicateBookingException("This time slot is already booked or pending for the mentor");
        }
    }

    private void checkDuplicateBooking(UUID mentorId, UUID learnerId, LocalDateTime startTime, LocalDateTime endTime) {
        boolean exists = sessionRepository.existsByMentorIdAndStartTimeAndEndTimeAndStatusNotIn(
                mentorId, startTime, endTime,
                List.of(SessionStatus.CANCELLED, SessionStatus.REJECTED));

        // Also reject overlapping PENDING/APPROVED bookings for the same
        // mentor — two learners must not double-book one mentor slot (and
        // freeze credits twice) before the mentor ever sees either booking.
        if (!exists) {
            exists = bookingRepository.existsOverlappingBooking(mentorId, startTime, endTime);
        }

        if (exists) {
            throw new DuplicateBookingException("This time slot is already booked or pending for the mentor");
        }
    }

    private void validateSessionLimit(UUID mentorId, LocalDateTime startTime) {
        LocalDateTime dayStart = startTime.toLocalDate().atStartOfDay();
        LocalDateTime dayEnd = dayStart.plusDays(1);

        long count = sessionRepository.countByMentorIdAndDateRange(mentorId, dayStart, dayEnd);
        if (count >= MAX_SESSIONS_PER_DAY) {
            throw new BadRequestException("Maximum session limit reached for this day");
        }
    }

    /**
     * Backend-enforced community session cost limit: 0 (TRUE FREE), 1, 2 or 3
     * credits. Anything above 3 credits must be rejected server-side.
     */
    private void validateCommunityCost(Integer cost) {
        if (cost == null) {
            throw new BadRequestException("Community session cost is required");
        }
        if (cost < 0 || cost > communityMaxCostCredits) {
            throw new BadRequestException("Community session cost must be between 0 and "
                    + communityMaxCostCredits + " credits");
        }
    }

    /**
     * Backend-enforced community session capacity: 1–20 learners. The mentor
     * cannot create a community session with unlimited participants.
     */
    private void validateCommunityCapacity(Integer maxParticipants) {
        if (maxParticipants == null) {
            throw new BadRequestException("Maximum learners is required");
        }
        if (maxParticipants < 1 || maxParticipants > communityMaxLearners) {
            throw new BadRequestException("Community session capacity must be between 1 and "
                    + communityMaxLearners + " learners");
        }
    }

    /**
     * Populates community seat fields on a response: learnerCount excludes the
     * host, remainingSeats = maxParticipants - learnerCount (0 when full).
     */
    /**
     * Settles the credit economy exactly once when a session completes.
     *
     * <p>The 80% attendance rule decides between transfer and release:
     *
     * <ul>
     *   <li><b>Professional sessions</b> — credits are transferred to the
     *       mentor ONLY when BOTH participants attended ≥ 80% of the scheduled
     *       duration (a booking accepted or a Join click is never enough).
     *       Otherwise the learner's frozen credits are released back.</li>
     *   <li><b>Paid community sessions</b> (1–3 credits) — each joined learner
     *       is settled individually against the same rule; attendees transfer,
     *       non-attendees get their hold released.</li>
     *   <li><b>0-credit sessions</b> — nothing to settle.</li>
     * </ul>
     *
     * Credit transfer happens exactly once: the session status transition to
     * COMPLETED is guarded by every caller (end/complete/auto-complete), and
     * the wallet-service additionally deduplicates on a per-session reference.
     */
    private void settleSessionOnCompletion(Session session) {
        if (session.isCommunity()) {
            if (session.getPrice() > 0) {
                sessionParticipantRepository.findBySessionIdAndRole(session.getId(), "LEARNER")
                        .forEach(learner -> {
                            if (attendanceEligible(learner.getUserId(), session)) {
                                eventPublisher.publishSessionCompleted(
                                        session.getId(), session.getMentorId(), learner.getUserId(),
                                        session.getBookingId(), session.getMentorName(), learner.getUserName(),
                                        session.getTopic(), session.getPrice(), true);
                            } else {
                                walletClient.releaseCredits(learner.getUserId(), session.getPrice(),
                                        session.getId(),
                                        "Community session completed without 80% attendance — credits released");
                            }
                        });
            }
            // 0-credit community sessions carry no credits — nothing to settle.
            return;
        }

        if (session.getPrice() <= 0) {
            return; // free professional session — nothing to settle
        }

        // Professional sessions created OUTSIDE the booking flow (direct
        // createSession) never had credits frozen at booking time, so there is
        // no hold to settle — releasing would fail on the frozen-balance check
        // and mark the session un-completable. Only booking-originated
        // sessions carry a hold.
        if (session.getBookingId() == null) {
            log.info("Session {} has no booking hold — skipping credit settlement", session.getId());
            return;
        }

        if (attendanceEligible(session.getMentorId(), session)
                && attendanceEligible(session.getLearnerId(), session)) {
            eventPublisher.publishSessionCompleted(session.getId(), session.getMentorId(),
                    session.getLearnerId(), session.getBookingId(),
                    session.getMentorName(), session.getLearnerName(), session.getTopic(),
                    session.getPrice(), false);
        } else {
            // Either participant missed the threshold — NO credit transfer.
            // Return the learner's frozen credits so they are never lost.
            walletClient.releaseCredits(session.getLearnerId(), session.getPrice(),
                    session.getId(), "Session completed without 80% attendance — credits released");
        }
    }

    /**
     * Whether a participant attended at least 80% of the scheduled duration.
     * Attendance is derived from the application state: the earliest recorded
     * join time (set when the participant fetches the meeting link during the
     * join window) through their leave time, or the session end when no leave
     * was recorded. A participant with no join record (e.g. a session that
     * never happened) is NOT eligible — credits are never transferred simply
     * because a booking was accepted.
     */
    private boolean attendanceEligible(UUID userId, Session session) {
        if (session.getStartTime() == null || session.getEndTime() == null
                || session.getDurationMinutes() <= 0) {
            return false;
        }
        Attendance attendance = attendanceRepository
                .findBySessionIdAndUserId(session.getId(), userId)
                .orElse(null);
        if (attendance == null || attendance.getJoinTime() == null) {
            return false;
        }

        LocalDateTime start = session.getStartTime();
        LocalDateTime end = session.getEndTime();
        LocalDateTime join = attendance.getJoinTime().isBefore(start) ? start : attendance.getJoinTime();
        LocalDateTime leave = attendance.getLeaveTime() != null ? attendance.getLeaveTime() : end;
        leave = leave.isAfter(end) ? end : leave;
        if (!leave.isAfter(join)) {
            return false;
        }

        long attendedMinutes = ChronoUnit.MINUTES.between(join, leave);
        long requiredMinutes = (long) Math.ceil(session.getDurationMinutes() * ATTENDANCE_THRESHOLD);
        return attendedMinutes >= requiredMinutes;
    }

    private void enrichCommunitySeats(SessionResponse response, UUID sessionId, Session session) {
        int capacity = session.getMaxParticipants() != null ? session.getMaxParticipants() : communityMaxLearners;
        int learnerCount = (int) sessionParticipantRepository.countBySessionIdAndRole(sessionId, "LEARNER");
        response.setMaxParticipants(capacity);
        response.setLearnerCount(learnerCount);
        response.setParticipantCount((int) sessionParticipantRepository.countBySessionId(sessionId));
        response.setRemainingSeats(Math.max(0, capacity - learnerCount));
    }

    private Session createSessionFromBooking(Booking booking) {
        LocalDateTime startTime = booking.getPreferredStartTime() != null
                ? booking.getPreferredStartTime()
                : booking.getPreferredDate();

        LocalDateTime endTime = booking.getPreferredEndTime() != null
                ? booking.getPreferredEndTime()
                : startTime.plusMinutes(booking.getDurationMinutes());

        Session session = Session.builder()
                .title(booking.getTopic())
                .description(booking.getDescription())
                .mentorId(booking.getMentorId())
                .learnerId(booking.getLearnerId())
                .mentorName(booking.getMentorName())
                .learnerName(booking.getLearnerName())
                .startTime(startTime)
                .endTime(endTime)
                .durationMinutes(booking.getDurationMinutes())
                .timezone(booking.getTimezone())
                .status(SessionStatus.APPROVED)
                .topic(booking.getTopic())
                .price(booking.getPrice())
                .currency("INR")
                .free(booking.getPrice() <= 0)
                .bookingId(booking.getId())
                .createdBy(booking.getCreatedBy())
                .updatedBy(booking.getUpdatedBy())
                .build();

        session = sessionRepository.save(session);

        createSessionParticipants(session, booking.getMentorName(), booking.getLearnerName());
        createSessionHistory(session.getId(), UUID.fromString(booking.getCreatedBy()), "CREATED_FROM_BOOKING",
                null, "APPROVED", "Session created from approved booking");
        createMeetingLink(session);
        scheduleReminders(session);

        return session;
    }

    private void createSessionParticipants(Session session, String mentorName, String learnerName) {
        SessionParticipant mentorParticipant = SessionParticipant.builder()
                .sessionId(session.getId())
                .userId(session.getMentorId())
                .userName(mentorName)
                .role("MENTOR")
                .attendanceStatus(AttendanceStatus.NOT_MARKED)
                .isHost(true)
                .hasConsent(true)
                .createdBy(session.getCreatedBy())
                .updatedBy(session.getUpdatedBy())
                .build();

        SessionParticipant learnerParticipant = SessionParticipant.builder()
                .sessionId(session.getId())
                .userId(session.getLearnerId())
                .userName(learnerName)
                .role("LEARNER")
                .attendanceStatus(AttendanceStatus.NOT_MARKED)
                .isHost(false)
                .hasConsent(true)
                .createdBy(session.getCreatedBy())
                .updatedBy(session.getUpdatedBy())
                .build();

        sessionParticipantRepository.save(mentorParticipant);
        sessionParticipantRepository.save(learnerParticipant);
    }

    /**
     * Returns the session's active meeting link, creating it idempotently when
     * missing (e.g. a session created before link generation existed). Safe
     * under concurrent first joins: re-checks before inserting and reuses an
     * existing (possibly deactivated) row instead of ever creating a duplicate.
     */
    private MeetingLink ensureMeetingLink(Session session) {
        // The ONLY meeting URL is the configured REAL Discord invite. Never
        // fabricate one — if no real invite is configured, no link exists.
        String joinUrl = resolveMeetingUrl();
        if (joinUrl == null) {
            throw new MeetingNotAvailableException("Meeting link is not available yet.");
        }

        Optional<MeetingLink> existing = meetingLinkRepository.findBySessionIdAndActiveTrue(session.getId());
        if (existing.isPresent()) {
            MeetingLink link = existing.get();
            // Heal legacy rows (previously fabricated or blank URLs): refresh
            // the stored link to the configured real invite when it differs.
            if (joinUrl.equals(link.getJoinUrl()) && joinUrl.equals(link.getMeetingUrl())) {
                return link;
            }
            link.setJoinUrl(joinUrl);
            link.setMeetingUrl(joinUrl);
            return meetingLinkRepository.save(link);
        }
        // Reuse a stale (deactivated) row before inserting a new one.
        Optional<MeetingLink> stale = meetingLinkRepository.findBySessionId(session.getId()).stream().findFirst();
        if (stale.isPresent()) {
            MeetingLink link = stale.get();
            link.setActive(true);
            link.setJoinUrl(joinUrl);
            link.setMeetingUrl(joinUrl);
            return meetingLinkRepository.save(link);
        }
        createMeetingLink(session);
        return meetingLinkRepository.findBySessionIdAndActiveTrue(session.getId())
                .orElseThrow(() -> new MeetingNotAvailableException("Meeting link is not available yet."));
    }

    /**
     * Meetings happen through Discord (no WebRTC). Exactly ONE meeting URL is
     * persisted per session and returned unchanged to every participant — it is
     * never regenerated on page load or on Join, and concurrent first joins
     * never create duplicates.
     *
     * The meeting URL is the configured REAL Discord invite
     * ({@code app.meeting.discord.url}, env {@code DISCORD_MEETING_URL}) — e.g.
     * {@code https://discord.gg/AbCdEfGh}. The service NEVER builds a URL like
     * {@code https://discord.gg/<random-string>}; a random string is not a
     * Discord invite. When no real invite is configured, no link row is stored
     * and the UI shows "Meeting link is not available yet.".
     */
    private void createMeetingLink(Session session) {
        // Idempotency guard: never insert a second link for a session that
        // already has one (concurrent Join requests from both participants).
        if (meetingLinkRepository.findBySessionIdAndActiveTrue(session.getId()).isPresent()) {
            return;
        }
        String joinUrl = resolveMeetingUrl();
        if (joinUrl == null) {
            // No real Discord invite configured — store nothing. The frontend
            // shows "Meeting link is not available yet." instead of a dead tab.
            return;
        }

        MeetingLink meetingLink = MeetingLink.builder()
                .sessionId(session.getId())
                .provider(MeetingProvider.DISCORD)
                .meetingId(session.getId().toString())
                .meetingUrl(joinUrl)
                .joinUrl(joinUrl)
                .active(true)
                .build();

        meetingLinkRepository.save(meetingLink);
    }

    /**
     * The REAL Discord meeting invite from configuration — the only URL ever
     * used for meetings. Returns {@code null} when no real invite is configured
     * so callers can show "Meeting link is not available yet." instead of
     * fabricating a fake invite.
     */
    private String resolveMeetingUrl() {
        if (discordMeetingUrl != null && !discordMeetingUrl.isBlank()) {
            return discordMeetingUrl.trim();
        }
        if (discordInviteCode != null && !discordInviteCode.isBlank()) {
            return "https://discord.gg/" + discordInviteCode.trim();
        }
        return null;
    }

    private void scheduleReminders(Session session) {
        LocalDateTime sessionStart = session.getStartTime();

        if (sessionStart.isAfter(LocalDateTime.now().plusHours(24))) {
            SessionReminder reminder24h = SessionReminder.builder()
                    .sessionId(session.getId())
                    .recipientId(session.getMentorId())
                    .type(ReminderType.EMAIL)
                    .reminderMinutesBefore(1440)
                    .scheduledAt(sessionStart.minusHours(24))
                    .sent(false)
                    .sentSuccessfully(false)
                    .retryCount(0)
                    .createdBy(session.getCreatedBy())
                    .updatedBy(session.getUpdatedBy())
                    .build();
            sessionReminderRepository.save(reminder24h);

            SessionReminder reminder24hLearner = SessionReminder.builder()
                    .sessionId(session.getId())
                    .recipientId(session.getLearnerId())
                    .type(ReminderType.EMAIL)
                    .reminderMinutesBefore(1440)
                    .scheduledAt(sessionStart.minusHours(24))
                    .sent(false)
                    .sentSuccessfully(false)
                    .retryCount(0)
                    .createdBy(session.getCreatedBy())
                    .updatedBy(session.getUpdatedBy())
                    .build();
            sessionReminderRepository.save(reminder24hLearner);
        }

        if (sessionStart.isAfter(LocalDateTime.now().plusHours(1))) {
            SessionReminder reminder1h = SessionReminder.builder()
                    .sessionId(session.getId())
                    .recipientId(session.getMentorId())
                    .type(ReminderType.EMAIL)
                    .reminderMinutesBefore(60)
                    .scheduledAt(sessionStart.minusHours(1))
                    .sent(false)
                    .sentSuccessfully(false)
                    .retryCount(0)
                    .createdBy(session.getCreatedBy())
                    .updatedBy(session.getUpdatedBy())
                    .build();
            sessionReminderRepository.save(reminder1h);

            SessionReminder reminder1hLearner = SessionReminder.builder()
                    .sessionId(session.getId())
                    .recipientId(session.getLearnerId())
                    .type(ReminderType.EMAIL)
                    .reminderMinutesBefore(60)
                    .scheduledAt(sessionStart.minusHours(1))
                    .sent(false)
                    .sentSuccessfully(false)
                    .retryCount(0)
                    .createdBy(session.getCreatedBy())
                    .updatedBy(session.getUpdatedBy())
                    .build();
            sessionReminderRepository.save(reminder1hLearner);
        }

        SessionReminder reminder15m = SessionReminder.builder()
                .sessionId(session.getId())
                .recipientId(session.getMentorId())
                .type(ReminderType.EMAIL)
                .reminderMinutesBefore(15)
                .scheduledAt(sessionStart.minusMinutes(15))
                .sent(false)
                .sentSuccessfully(false)
                .retryCount(0)
                .createdBy(session.getCreatedBy())
                .updatedBy(session.getUpdatedBy())
                .build();
        sessionReminderRepository.save(reminder15m);

        SessionReminder reminder15mLearner = SessionReminder.builder()
                .sessionId(session.getId())
                .recipientId(session.getLearnerId())
                .type(ReminderType.EMAIL)
                .reminderMinutesBefore(15)
                .scheduledAt(sessionStart.minusMinutes(15))
                .sent(false)
                .sentSuccessfully(false)
                .retryCount(0)
                .createdBy(session.getCreatedBy())
                .updatedBy(session.getUpdatedBy())
                .build();
        sessionReminderRepository.save(reminder15mLearner);
    }

    private void createSessionHistory(UUID sessionId, UUID performedBy, String action,
                                       String previousStatus, String newStatus, String details) {
        SessionHistory history = SessionHistory.builder()
                .sessionId(sessionId)
                .action(action)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .performedBy(performedBy)
                .details(details)
                .build();

        sessionHistoryRepository.save(history);
    }
}
