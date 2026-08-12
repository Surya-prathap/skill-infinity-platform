package com.skillinfinity.session.service.impl;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.common.exception.BadRequestException;
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
import com.skillinfinity.session.dto.response.CalendarResponse;
import com.skillinfinity.session.dto.response.CommunityAllowanceResponse;
import com.skillinfinity.session.dto.response.CommunityImpactResponse;
import com.skillinfinity.session.dto.response.MeetingResponse;
import com.skillinfinity.session.dto.response.SessionResponse;
import com.skillinfinity.session.entity.Attendance;
import com.skillinfinity.session.entity.Booking;
import com.skillinfinity.session.entity.CalendarEvent;
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
import com.skillinfinity.session.repository.CalendarEventRepository;
import com.skillinfinity.session.repository.CancellationRepository;
import com.skillinfinity.session.repository.MeetingLinkRepository;
import com.skillinfinity.session.repository.RescheduleRequestRepository;
import com.skillinfinity.session.repository.SessionHistoryRepository;
import com.skillinfinity.session.repository.SessionNotesRepository;
import com.skillinfinity.session.repository.SessionParticipantRepository;
import com.skillinfinity.session.repository.SessionReminderRepository;
import com.skillinfinity.session.repository.SessionRepository;
import com.skillinfinity.session.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
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
    private final SessionNotesRepository sessionNotesRepository;
    private final CalendarEventRepository calendarEventRepository;
    private final SessionMapper sessionMapper;
    private final SessionEventPublisher eventPublisher;
    private final WalletClient walletClient;

    private static final int MAX_SESSIONS_PER_DAY = 5;
    private static final int MAX_RESCHEDULE_COUNT = 3;

    /**
     * Community recognition levels (configurable via env/application.yml).
     * Earned through real contribution — never purchasable.
     */
    @Value("${community.recognition.thresholds:5,15,30,50}")
    private List<Integer> recognitionThresholds;

    @Value("${community.recognition.labels:Community Mentor,Active Contributor,Community Champion,Community Leader}")
    private List<String> recognitionLabels;

    @Value("${community.allowance.per-month:3}")
    private int communityMonthlyAllowance;

    // ============================================================
    // Session CRUD
    // ============================================================

    @Override
    @Transactional
    @CacheEvict(value = {"upcomingSessions", "mentorSchedule", "popularTimeSlots"}, allEntries = true)
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
        return sessionMapper.toResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "sessionDetails", key = "#sessionId", unless = "#result == null")
    public SessionResponse getSessionById(UUID sessionId) {
        Session session = findSessionById(sessionId);
        SessionResponse response = sessionMapper.toResponse(session);

        meetingLinkRepository.findBySessionIdAndActiveTrue(sessionId)
                .ifPresent(link -> response.setMeetingLink(sessionMapper.toMeetingResponse(link)));

        return response;
    }

    @Override
    @Transactional
    @CacheEvict(value = {"sessionDetails", "upcomingSessions", "mentorSchedule"}, allEntries = true)
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
        return sessionMapper.toResponse(session);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"sessionDetails", "upcomingSessions", "mentorSchedule", "popularTimeSlots"}, allEntries = true)
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

        return PageResponse.of(content, page, size, sessionPage.getTotalElements());
    }

    // ============================================================
    // Booking
    // ============================================================

    @Override
    @Transactional
    @CacheEvict(value = {"upcomingSessions", "mentorSchedule", "popularTimeSlots"}, allEntries = true)
    public BookingResponse bookSession(BookingRequest request, UUID userId) {
        log.info("Booking session: mentorId={}, learnerId={}", request.getMentorId(), request.getLearnerId());

        validateSessionTime(request.getPreferredDate(), request.getPreferredDate().plusMinutes(request.getDurationMinutes()));
        checkDuplicateBooking(request.getMentorId(), request.getLearnerId(),
                request.getPreferredDate(),
                request.getPreferredDate().plusMinutes(request.getDurationMinutes()));
        validateSessionLimit(request.getMentorId(), request.getPreferredDate());

        Booking booking = Booking.builder()
                .mentorId(request.getMentorId())
                .learnerId(request.getLearnerId())
                .mentorName(request.getMentorName())
                .learnerName(request.getLearnerName())
                .topic(request.getTopic())
                .description(request.getDescription())
                .preferredDate(request.getPreferredDate())
                .preferredStartTime(request.getPreferredStartTime())
                .preferredEndTime(request.getPreferredEndTime())
                .durationMinutes(request.getDurationMinutes())
                .price(request.getCredits())
                .timezone(request.getTimezone())
                .status(BookingStatus.PENDING)
                .learnerMessage(request.getLearnerMessage())
                .expiresAt(LocalDateTime.now().plusHours(48))
                .createdBy(userId.toString())
                .updatedBy(userId.toString())
                .build();

        booking = bookingRepository.save(booking);

        // Reserve the learner's credits (Welcome → Purchased → Learning).
        // Throws "Insufficient credits…" from the wallet when the balance is short.
        walletClient.freezeCredits(request.getLearnerId(), request.getCredits(),
                booking.getId(), "Booking hold for session: " + request.getTopic());

        eventPublisher.publishSessionBooked(null, request.getMentorId(), request.getLearnerId(),
                booking.getId(), request.getMentorName(), request.getLearnerName(),
                request.getTopic(), request.getPreferredDate(), null,
                request.getTimezone(), request.getDurationMinutes());

        log.info("Booking created: bookingId={}", booking.getId());
        return sessionMapper.toBookingResponse(booking);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"upcomingSessions", "sessionDetails", "mentorSchedule"}, allEntries = true)
    public BookingResponse approveBooking(UUID bookingId, UUID mentorId) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidSessionStateException("Booking is not in pending state");
        }

        if (!booking.getMentorId().equals(mentorId)) {
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
    @CacheEvict(value = {"upcomingSessions", "sessionDetails"}, allEntries = true)
    public BookingResponse rejectBooking(UUID bookingId, UUID mentorId, String reason) {
        Booking booking = findBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidSessionStateException("Booking is not in pending state");
        }

        if (!booking.getMentorId().equals(mentorId)) {
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
    @CacheEvict(value = {"sessionDetails", "upcomingSessions", "mentorSchedule"}, allEntries = true)
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
        return sessionMapper.toResponse(session);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"sessionDetails", "upcomingSessions", "mentorSchedule"}, allEntries = true)
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

        eventPublisher.publishSessionCompleted(sessionId, session.getMentorId(),
                session.getLearnerId(), session.getBookingId(),
                session.getMentorName(), session.getLearnerName(), session.getTopic(),
                session.isCommunity() ? 0 : session.getPrice(), session.isCommunity());

        log.info("Session ended: sessionId={}", sessionId);
        return sessionMapper.toResponse(session);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"sessionDetails", "upcomingSessions", "mentorSchedule"}, allEntries = true)
    public SessionResponse completeSession(UUID sessionId, UUID userId) {
        Session session = findSessionById(sessionId);

        if (session.getStatus() == SessionStatus.COMPLETED) {
            throw new InvalidSessionStateException("Session is already completed");
        }

        if (session.getStatus() != SessionStatus.IN_PROGRESS) {
            session.setStatus(SessionStatus.COMPLETED);
        } else {
            session.setStatus(SessionStatus.COMPLETED);
        }

        session.setCompletedAt(LocalDateTime.now());
        session.setUpdatedBy(userId.toString());
        session = sessionRepository.save(session);

        createSessionHistory(sessionId, userId, "COMPLETED", session.getStatus().name(), "COMPLETED", "Session completed");

        eventPublisher.publishSessionCompleted(sessionId, session.getMentorId(),
                session.getLearnerId(), session.getBookingId(),
                session.getMentorName(), session.getLearnerName(), session.getTopic(),
                session.isCommunity() ? 0 : session.getPrice(), session.isCommunity());

        return sessionMapper.toResponse(session);
    }

    // ============================================================
    // Reschedule
    // ============================================================

    @Override
    @Transactional
    @CacheEvict(value = {"sessionDetails", "upcomingSessions", "mentorSchedule", "popularTimeSlots"}, allEntries = true)
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
        return sessionMapper.toResponse(session);
    }

    // ============================================================
    // Cancel
    // ============================================================

    @Override
    @Transactional
    @CacheEvict(value = {"sessionDetails", "upcomingSessions", "mentorSchedule", "popularTimeSlots"}, allEntries = true)
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

        // Release the learner's booking hold on cancellation.
        walletClient.releaseCredits(session.getLearnerId(), session.getPrice(),
                session.getId(), "Session cancelled");

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
        return sessionMapper.toResponse(session);
    }

    // ============================================================
    // Queries
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "upcomingSessions", key = "#userId + '-' + #page + '-' + #size", unless = "#result == null")
    public PageResponse<SessionResponse> getUpcomingSessions(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startTime"));
        Page<Session> sessionPage = sessionRepository.findUpcomingByUserId(userId, LocalDateTime.now(), pageable);

        List<SessionResponse> content = sessionPage.getContent().stream()
                .map(sessionMapper::toResponse)
                .toList();

        attachMeetingLinks(content);

        return PageResponse.of(content, page, size, sessionPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SessionResponse> getSessionHistory(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startTime"));
        Page<Session> sessionPage = sessionRepository.findByUserId(userId, pageable);

        List<SessionResponse> content = sessionPage.getContent().stream()
                .map(sessionMapper::toResponse)
                .toList();

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
    @Transactional(readOnly = true)
    public MeetingResponse getMeetingLink(UUID sessionId) {
        MeetingLink meetingLink = meetingLinkRepository.findBySessionIdAndActiveTrue(sessionId)
                .orElseThrow(() -> new MeetingNotAvailableException("No meeting link available for session: " + sessionId));

        return sessionMapper.toMeetingResponse(meetingLink);
    }

    // ============================================================
    // Calendar
    // ============================================================

    @Override
    @Transactional(readOnly = true)
    public CalendarResponse getCalendar(UUID userId, String startDate, String endDate) {
        List<Session> sessions;

        if (startDate != null && endDate != null) {
            LocalDateTime start = LocalDateTime.parse(startDate);
            LocalDateTime end = LocalDateTime.parse(endDate);

            List<Session> mentorSessions = sessionRepository.findByMentorIdAndTimeRange(userId, start, end);
            List<Session> learnerSessions = sessionRepository.findByLearnerIdAndTimeRange(userId, start, end);

            sessions = mentorSessions;
            sessions.addAll(learnerSessions.stream()
                    .filter(s -> mentorSessions.stream().noneMatch(ms -> ms.getId().equals(s.getId())))
                    .toList());
        } else {
            sessions = sessionRepository.findByUserId(userId, PageRequest.of(0, 100)).getContent();
        }

        List<CalendarResponse.CalendarEventResponse> events = sessions.stream()
                .map(session -> CalendarResponse.CalendarEventResponse.builder()
                        .id(session.getId())
                        .sessionId(session.getId())
                        .title(session.getTitle())
                        .description(session.getDescription())
                        .startTime(session.getStartTime())
                        .endTime(session.getEndTime())
                        .timezone(session.getTimezone())
                        .location(session.getTopic())
                        .build())
                .toList();

        return CalendarResponse.builder()
                .events(events)
                .build();
    }

    @Override
    public String exportCalendarIcs(UUID userId) {
        // Placeholder for ICS export - will be implemented with iCal4j integration
        return "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Skill Infinity//Session Service//EN\nEND:VCALENDAR";
    }

    // ============================================================
    // Community Sessions
    // ============================================================

    @Override
    @Transactional
    @CacheEvict(value = {"upcomingSessions", "mentorSchedule"}, allEntries = true)
    public SessionResponse createCommunitySession(CommunitySessionRequest request, UUID mentorId) {
        validateSessionTime(request.getStartTime(), request.getEndTime());

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
                .price(0)
                .currency("INR")
                .free(true)
                .community(true)
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
        return sessionMapper.toResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SessionResponse> getUpcomingCommunitySessions(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startTime"));
        Page<Session> sessions = sessionRepository.findUpcomingCommunitySessions(LocalDateTime.now(), pageable);

        List<SessionResponse> content = sessions.getContent().stream()
                .map(s -> {
                    SessionResponse response = sessionMapper.toResponse(s);
                    response.setParticipantCount((int) sessionParticipantRepository.countBySessionId(s.getId()));
                    return response;
                })
                .toList();

        attachMeetingLinks(content);

        return PageResponse.of(content, page, size, sessions.getTotalElements());
    }

    @Override
    @Transactional
    @CacheEvict(value = {"upcomingSessions", "sessionDetails"}, allEntries = true)
    public SessionResponse joinCommunitySession(UUID sessionId, UUID userId) {
        Session session = findSessionById(sessionId);
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

        CommunityAllowanceResponse allowance = getCommunityAllowance(userId);
        if (allowance.getRemaining() <= 0) {
            throw new BadRequestException("You have used your " + allowance.getLimit()
                    + " free community sessions for this month. Book a professional session or try again next month.");
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

        log.info("Learner {} joined community session {}", userId, sessionId);
        SessionResponse response = sessionMapper.toResponse(session);
        response.setParticipantCount((int) sessionParticipantRepository.countBySessionId(sessionId));
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public CommunityAllowanceResponse getCommunityAllowance(UUID userId) {
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        long used = sessionParticipantRepository
                .countByUserIdAndRoleAndJoinedAtGreaterThanEqual(userId, "LEARNER", monthStart);
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
                response.setMeetingLink(sessionMapper.toMeetingResponse(link));
            }
        });
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

        if (ChronoUnit.MINUTES.between(startTime, endTime) < 15) {
            throw new BadRequestException("Session duration must be at least 15 minutes");
        }
    }

    private void checkDuplicateBooking(UUID mentorId, UUID learnerId, LocalDateTime startTime, LocalDateTime endTime) {
        boolean exists = sessionRepository.existsByMentorIdAndStartTimeAndEndTimeAndStatusNotIn(
                mentorId, startTime, endTime,
                List.of(SessionStatus.CANCELLED, SessionStatus.REJECTED));

        if (exists) {
            throw new DuplicateBookingException("A session already exists for this time slot");
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
     * Creates the meeting link for a session. The join URL points at the
     * platform's own meeting room ({@code /meet/<sessionId>}) so learners and
     * mentors attend the session inside the app — the frontend meeting room
     * resolves the session id and starts the call there.
     */
    private void createMeetingLink(Session session) {
        String roomPath = "/meet/" + session.getId();
        MeetingLink meetingLink = MeetingLink.builder()
                .sessionId(session.getId())
                .provider(MeetingProvider.CUSTOM)
                .meetingId(session.getId().toString())
                .meetingUrl(roomPath)
                .joinUrl(roomPath)
                .active(true)
                .build();

        meetingLinkRepository.save(meetingLink);
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
