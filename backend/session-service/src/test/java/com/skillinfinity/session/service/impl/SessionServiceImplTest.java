package com.skillinfinity.session.service.impl;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ForbiddenException;
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
import com.skillinfinity.session.client.MentorClient;
import com.skillinfinity.session.client.WalletClient;
import com.skillinfinity.session.enumeration.SessionStatus;
import com.skillinfinity.session.event.SessionEventPublisher;
import com.skillinfinity.session.exception.BookingNotFoundException;
import com.skillinfinity.session.exception.CancellationNotAllowedException;
import com.skillinfinity.session.exception.DuplicateBookingException;
import com.skillinfinity.session.exception.InvalidSessionStateException;
import com.skillinfinity.session.exception.MeetingNotAvailableException;
import com.skillinfinity.session.exception.RescheduleNotAllowedException;
import com.skillinfinity.session.exception.SessionNotFoundException;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceImplTest {

    @Mock
    private SessionRepository sessionRepository;
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private SessionParticipantRepository sessionParticipantRepository;
    @Mock
    private CancellationRepository cancellationRepository;
    @Mock
    private RescheduleRequestRepository rescheduleRequestRepository;
    @Mock
    private MeetingLinkRepository meetingLinkRepository;
    @Mock
    private AttendanceRepository attendanceRepository;
    @Mock
    private SessionHistoryRepository sessionHistoryRepository;
    @Mock
    private SessionReminderRepository sessionReminderRepository;
    @Mock
    private SessionMapper sessionMapper;
    @Mock
    private SessionEventPublisher eventPublisher;
    @Mock
    private WalletClient walletClient;
    @Mock
    private MentorClient mentorClient;

    @Captor
    private ArgumentCaptor<Session> sessionCaptor;
    @Captor
    private ArgumentCaptor<Booking> bookingCaptor;
    @Captor
    private ArgumentCaptor<Cancellation> cancellationCaptor;
    @Captor
    private ArgumentCaptor<RescheduleRequest> rescheduleRequestCaptor;
    @Captor
    private ArgumentCaptor<Attendance> attendanceCaptor;
    @Captor
    private ArgumentCaptor<SessionHistory> sessionHistoryCaptor;
    @Captor
    private ArgumentCaptor<MeetingLink> meetingLinkCaptor;
    @Captor
    private ArgumentCaptor<SessionReminder> sessionReminderCaptor;
    @Captor
    private ArgumentCaptor<SessionParticipant> participantCaptor;

    private SessionServiceImpl sessionService;

    private UUID userId;
    private UUID mentorId;
    private UUID learnerId;
    private UUID sessionId;
    private UUID bookingId;
    private Session session;
    private SessionRequest sessionRequest;
    private BookingRequest bookingRequest;
    private SessionResponse sessionResponse;
    private BookingResponse bookingResponse;

    @BeforeEach
    void setUp() {
        sessionService = new SessionServiceImpl(
                sessionRepository, bookingRepository, sessionParticipantRepository,
                cancellationRepository, rescheduleRequestRepository, meetingLinkRepository,
                attendanceRepository, sessionHistoryRepository, sessionReminderRepository,
                sessionMapper, eventPublisher, walletClient, mentorClient
        );

        // @Value fields are not injected when the service is constructed
        // directly — set the configured business rules used by community logic.
        org.springframework.test.util.ReflectionTestUtils.setField(sessionService, "communityMonthlyAllowance", 3);
        org.springframework.test.util.ReflectionTestUtils.setField(sessionService, "communityMaxCostCredits", 3);
        org.springframework.test.util.ReflectionTestUtils.setField(sessionService, "communityMaxLearners", 20);
        org.springframework.test.util.ReflectionTestUtils.setField(sessionService, "discordMeetingUrl", "https://discord.gg/abc123");
        org.springframework.test.util.ReflectionTestUtils.setField(sessionService, "discordInviteCode", "");
        org.springframework.test.util.ReflectionTestUtils.setField(sessionService, "joinWindowMinutes", 10);

        userId = UUID.randomUUID();
        mentorId = UUID.randomUUID();
        learnerId = UUID.randomUUID();
        sessionId = UUID.randomUUID();
        bookingId = UUID.randomUUID();

        sessionRequest = SessionRequest.builder()
                .title("Test Session")
                .description("Test Description")
                .mentorId(mentorId)
                .learnerId(learnerId)
                .mentorName("Mentor")
                .learnerName("Learner")
                .startTime(LocalDateTime.now().plusDays(2))
                .endTime(LocalDateTime.now().plusDays(2).plusHours(1))
                .durationMinutes(60)
                .timezone("UTC")
                .topic("Testing")
                .category("Technology")
                .price(0)
                .currency("INR")
                .free(true)
                .build();

        session = Session.builder()
                .id(sessionId)
                .title("Test Session")
                .description("Test Description")
                .mentorId(mentorId)
                .learnerId(learnerId)
                .mentorName("Mentor")
                .learnerName("Learner")
                .startTime(LocalDateTime.now().plusDays(2))
                .endTime(LocalDateTime.now().plusDays(2).plusHours(1))
                .durationMinutes(60)
                .timezone("UTC")
                .status(SessionStatus.SCHEDULED)
                .topic("Testing")
                .bookingId(bookingId)
                .price(0)
                .currency("INR")
                .free(true)
                .rescheduleCount(0)
                .build();

        sessionResponse = SessionResponse.builder()
                .id(sessionId)
                .title("Test Session")
                .status(SessionStatus.SCHEDULED)
                .build();

        // Use a FIXED local time inside the test availability window
        // (09:00–17:00) so this test is deterministic regardless of the hour
        // the suite runs. `now().plusHours(10)` put the slot outside the
        // window whenever the suite ran after 07:00, making the booking test
        // fail at 08:00 and pass at 06:00.
        LocalDateTime slotDay = LocalDateTime.now().plusDays(3).withHour(10).withMinute(0);
        bookingRequest = BookingRequest.builder()
                .mentorId(mentorId)
                .learnerId(learnerId)
                .mentorName("Mentor")
                .learnerName("Learner")
                .topic("Java Session")
                .description("Need help with Java")
                .preferredDate(slotDay)
                .preferredStartTime(slotDay)
                .preferredEndTime(slotDay.plusHours(1))
                .durationMinutes(60)
                .timezone("UTC")
                .learnerMessage("Please help")
                .build();

        bookingResponse = BookingResponse.builder()
                .id(bookingId)
                .mentorId(mentorId)
                .learnerId(learnerId)
                .status(BookingStatus.PENDING)
                .build();
    }

    // ============================================================
    // Create Session Tests
    // ============================================================

    @Test
    void shouldCreateSessionSuccessfully() {
        when(sessionMapper.toEntity(sessionRequest)).thenReturn(session);
        when(sessionRepository.save(any(Session.class))).thenReturn(session);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);
        when(sessionParticipantRepository.save(any(SessionParticipant.class))).thenReturn(null);
        when(sessionHistoryRepository.save(any(SessionHistory.class))).thenReturn(null);
        when(meetingLinkRepository.save(any(MeetingLink.class))).thenReturn(null);
        when(sessionReminderRepository.save(any(SessionReminder.class))).thenReturn(null);

        SessionResponse result = sessionService.createSession(sessionRequest, userId);

        assertNotNull(result);
        assertEquals(sessionId, result.getId());
        verify(sessionRepository, times(1)).save(any(Session.class));
        verify(sessionParticipantRepository, times(2)).save(any(SessionParticipant.class));
        verify(sessionHistoryRepository, times(1)).save(any(SessionHistory.class));
        verify(meetingLinkRepository, times(1)).save(any(MeetingLink.class));
        verify(sessionReminderRepository, atLeast(1)).save(any(SessionReminder.class));
    }

    @Test
    void shouldThrowExceptionWhenCreatingSessionWithPastTime() {
        sessionRequest.setStartTime(LocalDateTime.now().minusDays(1));
        sessionRequest.setEndTime(LocalDateTime.now().minusDays(1).plusHours(1));

        assertThrows(BadRequestException.class, () ->
                sessionService.createSession(sessionRequest, userId));
    }

    @Test
    void shouldThrowExceptionWhenEndTimeBeforeStartTime() {
        sessionRequest.setStartTime(LocalDateTime.now().plusDays(2));
        sessionRequest.setEndTime(LocalDateTime.now().plusDays(2).minusHours(1));

        assertThrows(BadRequestException.class, () ->
                sessionService.createSession(sessionRequest, userId));
    }

    @Test
    void shouldThrowExceptionWhenDuplicateBooking() {
        when(sessionRepository.existsByMentorIdAndStartTimeAndEndTimeAndStatusNotIn(
                any(), any(), any(), anyList())).thenReturn(true);

        assertThrows(DuplicateBookingException.class, () ->
                sessionService.createSession(sessionRequest, userId));
    }

    // ============================================================
    // Get Session Tests
    // ============================================================

    @Test
    void shouldGetSessionByIdSuccessfully() {
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionParticipantRepository.existsBySessionIdAndUserId(sessionId, userId)).thenReturn(true);
        when(sessionMapper.toResponse(session)).thenReturn(sessionResponse);
        when(meetingLinkRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.empty());

        SessionResponse result = sessionService.getSessionById(sessionId, userId);

        assertNotNull(result);
        assertEquals(sessionId, result.getId());
    }

    @Test
    void shouldThrowExceptionWhenSessionNotFound() {
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        assertThrows(SessionNotFoundException.class, () ->
                sessionService.getSessionById(sessionId, userId));
    }

    @Test
    void shouldForbidNonParticipantFromReadingSessionDetails() {
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        // A stranger who is neither mentor, learner nor a joined participant
        // must be rejected (no session details / Discord invite leak).
        UUID stranger = UUID.randomUUID();
        assertThrows(ForbiddenException.class, () ->
                sessionService.getSessionById(sessionId, stranger));
    }

    // ============================================================
    // Update Session Tests
    // ============================================================

    @Test
    void shouldUpdateSessionSuccessfully() {
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);
        when(sessionHistoryRepository.save(any(SessionHistory.class))).thenReturn(null);

        SessionResponse result = sessionService.updateSession(sessionId, sessionRequest, userId);

        assertNotNull(result);
        verify(sessionRepository, times(1)).save(any(Session.class));
        verify(sessionHistoryRepository, times(1)).save(any(SessionHistory.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonScheduledSession() {
        session.setStatus(SessionStatus.IN_PROGRESS);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        assertThrows(InvalidSessionStateException.class, () ->
                sessionService.updateSession(sessionId, sessionRequest, userId));
    }

    // ============================================================
    // Delete Session Tests
    // ============================================================

    @Test
    void shouldDeleteSessionSuccessfully() {
        session.setStatus(SessionStatus.SCHEDULED);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        sessionService.deleteSession(sessionId, userId);

        verify(sessionRepository, times(1)).delete(session);
    }

    @Test
    void shouldThrowExceptionWhenDeletingInProgressSession() {
        session.setStatus(SessionStatus.IN_PROGRESS);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        assertThrows(InvalidSessionStateException.class, () ->
                sessionService.deleteSession(sessionId, userId));
    }

    // ============================================================
    // Booking Tests
    // ============================================================

    @Test
    void shouldBookSessionSuccessfully() {
        // The booking slot must match a verified mentor's pricing + availability.
        String day = bookingRequest.getPreferredStartTime().getDayOfWeek().name();
        when(mentorClient.getMentor(mentorId))
                .thenReturn(new MentorClient.MentorInfo(mentorId, userId, "ACTIVE", true));
        when(mentorClient.getPricing(mentorId)).thenReturn(List.of(
                new MentorClient.PricingInfo(UUID.randomUUID(), "ONE_ON_ONE",
                        java.math.BigDecimal.valueOf(6), 60, false)));
        when(mentorClient.getAvailability(mentorId)).thenReturn(List.of(
                new MentorClient.AvailabilityInfo(day, "09:00", "17:00", null, null, 60, true, null, true)));

        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));
        when(sessionMapper.toBookingResponse(any(Booking.class))).thenReturn(bookingResponse);

        BookingResponse result = sessionService.bookSession(bookingRequest, userId);

        assertNotNull(result);
        verify(bookingRepository, times(1)).save(any(Booking.class));
        // The backend computes the cost from the mentor's pricing (6 credits) —
        // the frontend-provided amount is never trusted. The credits are frozen
        // for the AUTHENTICATED user, never a client-supplied learnerId.
        verify(walletClient, times(1)).freezeCredits(eq(userId), eq(6.0), any(), anyString());
        // The booking must be owned by the authenticated user (data isolation).
        ArgumentCaptor<Booking> bookingCaptor = ArgumentCaptor.forClass(Booking.class);
        verify(bookingRepository, atLeastOnce()).save(bookingCaptor.capture());
        Booking saved = bookingCaptor.getAllValues().stream()
                .filter(b -> b.getLearnerId() != null)
                .findFirst().orElseThrow();
        assertEquals(userId, saved.getLearnerId());
        verify(eventPublisher, times(1)).publishSessionBooked(
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), anyInt());
    }

    @Test
    void shouldReturnExistingBookingOnIdempotentRetry() {
        // The first attempt committed but its response was lost (frontend
        // timeout). The retry must return the existing booking — never create
        // a duplicate or freeze credits a second time.
        String day = bookingRequest.getPreferredStartTime().getDayOfWeek().name();
        when(mentorClient.getMentor(mentorId))
                .thenReturn(new MentorClient.MentorInfo(mentorId, userId, "ACTIVE", true));
        when(mentorClient.getPricing(mentorId)).thenReturn(List.of(
                new MentorClient.PricingInfo(UUID.randomUUID(), "ONE_ON_ONE",
                        java.math.BigDecimal.valueOf(6), 60, false)));
        when(mentorClient.getAvailability(mentorId)).thenReturn(List.of(
                new MentorClient.AvailabilityInfo(day, "09:00", "17:00", null, null, 60, true, null, true)));

        Booking existing = Booking.builder()
                .id(bookingId)
                .mentorId(userId)
                .learnerId(userId)
                .status(BookingStatus.PENDING)
                .preferredStartTime(bookingRequest.getPreferredStartTime())
                .preferredEndTime(bookingRequest.getPreferredEndTime())
                .build();
        when(bookingRepository.findOverlappingByMentorAndLearner(eq(userId), eq(userId), any(), any()))
                .thenReturn(Optional.of(existing));
        when(sessionMapper.toBookingResponse(existing)).thenReturn(bookingResponse);

        BookingResponse result = sessionService.bookSession(bookingRequest, userId);

        assertNotNull(result);
        verify(bookingRepository, never()).save(any(Booking.class));
        verify(walletClient, never()).freezeCredits(any(), anyDouble(), any(), anyString());
    }

    @Test
    void shouldAutoCompleteExpiredSessions() {
        // A session whose scheduled window passed is completed automatically
        // and, with both participants attending, its credits transfer once.
        session.setStatus(SessionStatus.IN_PROGRESS);
        session.setPrice(2.0);
        session.setFree(false);
        when(sessionRepository.findSessionsToAutoComplete(any())).thenReturn(List.of(session));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);
        when(sessionHistoryRepository.save(any(SessionHistory.class))).thenReturn(null);
        when(attendanceRepository.findBySessionIdAndUserId(eq(sessionId), eq(mentorId)))
                .thenReturn(Optional.of(attendanceRecord(session, mentorId)));
        when(attendanceRepository.findBySessionIdAndUserId(eq(sessionId), eq(learnerId)))
                .thenReturn(Optional.of(attendanceRecord(session, learnerId)));

        int completed = sessionService.autoCompleteExpiredSessions();

        assertEquals(1, completed);
        assertEquals(SessionStatus.COMPLETED, session.getStatus());
        verify(eventPublisher, times(1)).publishSessionCompleted(
                eq(sessionId), eq(mentorId), eq(learnerId), any(), any(), any(), any(), eq(2.0), eq(false));
    }

    @Test
    void shouldReleaseFrozenCreditsWhenAttendanceBelowThreshold() {
        // The mentor attended but the learner never joined → NO credit
        // transfer; the learner's frozen credits are released back.
        session.setStatus(SessionStatus.IN_PROGRESS);
        session.setPrice(2.0);
        session.setFree(false);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);
        when(sessionHistoryRepository.save(any(SessionHistory.class))).thenReturn(null);
        when(attendanceRepository.findBySessionIdAndUserId(eq(sessionId), eq(mentorId)))
                .thenReturn(Optional.of(attendanceRecord(session, mentorId)));
        // learner has no attendance record → below the 80% threshold

        sessionService.endSession(sessionId, userId);

        assertEquals(SessionStatus.COMPLETED, session.getStatus());
        verify(eventPublisher, never()).publishSessionCompleted(
                any(), any(), any(), any(), any(), any(), any(), anyDouble(), anyBoolean());
        verify(walletClient, times(1)).releaseCredits(eq(learnerId), eq(2.0), eq(sessionId), anyString());
    }

    @Test
    void shouldRejectBookingOutsideMentorAvailability() {
        when(mentorClient.getMentor(mentorId))
                .thenReturn(new MentorClient.MentorInfo(mentorId, userId, "ACTIVE", true));
        // Availability exists, but the requested 10:00–11:00 slot is outside it.
        String day = bookingRequest.getPreferredStartTime().getDayOfWeek().name();
        when(mentorClient.getPricing(mentorId)).thenReturn(List.of(
                new MentorClient.PricingInfo(UUID.randomUUID(), "ONE_ON_ONE",
                        java.math.BigDecimal.valueOf(6), 60, false)));
        when(mentorClient.getAvailability(mentorId)).thenReturn(List.of(
                new MentorClient.AvailabilityInfo(day, "14:00", "17:00", null, null, 60, true, null, true)));

        assertThrows(BadRequestException.class, () ->
                sessionService.bookSession(bookingRequest, userId));

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void shouldThrowExceptionWhenBookingInThePast() {
        // The real slot time (preferredStartTime) is what gets validated — the
        // session start must be in the future.
        bookingRequest.setPreferredStartTime(LocalDateTime.now().minusHours(2));
        bookingRequest.setPreferredEndTime(LocalDateTime.now().minusHours(1));

        assertThrows(BadRequestException.class, () ->
                sessionService.bookSession(bookingRequest, userId));
    }

    // ============================================================
    // Approve Booking Tests
    // ============================================================

    @Test
    void shouldApproveBookingSuccessfully() {
        Booking pendingBooking = Booking.builder()
                .id(bookingId)
                .mentorId(mentorId)
                .learnerId(learnerId)
                .mentorName("Mentor")
                .learnerName("Learner")
                .topic("Java")
                .preferredDate(LocalDateTime.now().plusDays(3))
                .durationMinutes(60)
                .status(BookingStatus.PENDING)
                .createdBy(learnerId.toString())
                .updatedBy(learnerId.toString())
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(pendingBooking);
        when(sessionRepository.save(any(Session.class))).thenReturn(session);
        when(sessionMapper.toBookingResponse(any(Booking.class))).thenReturn(bookingResponse);
        when(sessionParticipantRepository.save(any(SessionParticipant.class))).thenReturn(null);
        when(sessionHistoryRepository.save(any(SessionHistory.class))).thenReturn(null);
        when(meetingLinkRepository.save(any(MeetingLink.class))).thenReturn(null);
        when(sessionReminderRepository.save(any(SessionReminder.class))).thenReturn(null);

        BookingResponse result = sessionService.approveBooking(bookingId, mentorId);

        assertNotNull(result);
        verify(bookingRepository, times(2)).save(any(Booking.class));
        verify(sessionRepository, times(1)).save(any(Session.class));
        verify(eventPublisher, times(1)).publishSessionApproved(
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), anyInt());
    }

    @Test
    void shouldThrowExceptionWhenApprovingNonPendingBooking() {
        Booking approvedBooking = Booking.builder()
                .id(bookingId)
                .mentorId(mentorId)
                .status(BookingStatus.APPROVED)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(approvedBooking));

        assertThrows(InvalidSessionStateException.class, () ->
                sessionService.approveBooking(bookingId, mentorId));
    }

    @Test
    void shouldThrowExceptionWhenNonMentorApproves() {
        Booking pendingBooking = Booking.builder()
                .id(bookingId)
                .mentorId(mentorId)
                .status(BookingStatus.PENDING)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(pendingBooking));

        assertThrows(BadRequestException.class, () ->
                sessionService.approveBooking(bookingId, UUID.randomUUID()));
    }

    // ============================================================
    // Reject Booking Tests
    // ============================================================

    @Test
    void shouldRejectBookingSuccessfully() {
        Booking pendingBooking = Booking.builder()
                .id(bookingId)
                .mentorId(mentorId)
                .learnerId(learnerId)
                .status(BookingStatus.PENDING)
                .build();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(pendingBooking);
        when(sessionMapper.toBookingResponse(any(Booking.class))).thenReturn(bookingResponse);

        BookingResponse result = sessionService.rejectBooking(bookingId, mentorId, "Not available");

        assertNotNull(result);
        assertEquals(BookingStatus.REJECTED, pendingBooking.getStatus());
        assertEquals("Not available", pendingBooking.getRejectionReason());
        verify(eventPublisher, times(1)).publishSessionRejected(
                any(), any(), any(), any(), any(), any(), any(), anyString());
    }

    // ============================================================
    // Session Lifecycle Tests
    // ============================================================

    @Test
    void shouldStartSessionSuccessfully() {
        session.setStatus(SessionStatus.APPROVED);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);
        when(sessionHistoryRepository.save(any(SessionHistory.class))).thenReturn(null);

        SessionResponse result = sessionService.startSession(sessionId, userId);

        assertNotNull(result);
        assertEquals(SessionStatus.IN_PROGRESS, session.getStatus());
        assertNotNull(session.getStartedAt());
    }

    @Test
    void shouldThrowExceptionWhenStartingCompletedSession() {
        session.setStatus(SessionStatus.COMPLETED);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        assertThrows(InvalidSessionStateException.class, () ->
                sessionService.startSession(sessionId, userId));
    }

    @Test
    void shouldEndSessionSuccessfully() {
        session.setStatus(SessionStatus.IN_PROGRESS);
        session.setPrice(2.0);
        session.setFree(false);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);
        when(sessionHistoryRepository.save(any(SessionHistory.class))).thenReturn(null);
        // Both participants attended ≥80% of the session → credits transfer.
        when(attendanceRepository.findBySessionIdAndUserId(eq(sessionId), eq(mentorId)))
                .thenReturn(Optional.of(attendanceRecord(session, mentorId)));
        when(attendanceRepository.findBySessionIdAndUserId(eq(sessionId), eq(learnerId)))
                .thenReturn(Optional.of(attendanceRecord(session, learnerId)));

        SessionResponse result = sessionService.endSession(sessionId, userId);

        assertNotNull(result);
        assertEquals(SessionStatus.COMPLETED, session.getStatus());
        assertNotNull(session.getEndedAt());
        assertNotNull(session.getCompletedAt());
        verify(eventPublisher, times(1)).publishSessionCompleted(
                eq(sessionId), eq(mentorId), eq(learnerId), any(), any(), any(), any(), eq(2.0), eq(false));
    }

    @Test
    void shouldThrowExceptionWhenEndingNonInProgressSession() {
        session.setStatus(SessionStatus.SCHEDULED);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        assertThrows(InvalidSessionStateException.class, () ->
                sessionService.endSession(sessionId, userId));
    }

    @Test
    void shouldCompleteSessionSuccessfully() {
        session.setStatus(SessionStatus.IN_PROGRESS);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);
        when(sessionHistoryRepository.save(any(SessionHistory.class))).thenReturn(null);

        SessionResponse result = sessionService.completeSession(sessionId, userId);

        assertNotNull(result);
        assertEquals(SessionStatus.COMPLETED, session.getStatus());
        assertNotNull(session.getCompletedAt());
    }

    // ============================================================
    // Reschedule Tests
    // ============================================================

    @Test
    void shouldRescheduleSessionSuccessfully() {
        RescheduleRequestDto request = RescheduleRequestDto.builder()
                .sessionId(sessionId)
                .proposedStartTime(LocalDateTime.now().plusDays(5))
                .proposedEndTime(LocalDateTime.now().plusDays(5).plusHours(1))
                .reason("Schedule conflict")
                .build();

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);
        when(rescheduleRequestRepository.save(any(RescheduleRequest.class))).thenReturn(null);
        when(sessionHistoryRepository.save(any(SessionHistory.class))).thenReturn(null);

        SessionResponse result = sessionService.rescheduleSession(request, userId);

        assertNotNull(result);
        assertEquals(1, session.getRescheduleCount());
        assertEquals(SessionStatus.RESCHEDULED, session.getStatus());
        verify(eventPublisher, times(1)).publishSessionRescheduled(
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), anyInt(), anyString());
    }

    @Test
    void shouldThrowExceptionWhenExceedingMaxReschedule() {
        session.setRescheduleCount(3);
        RescheduleRequestDto request = RescheduleRequestDto.builder()
                .sessionId(sessionId)
                .proposedStartTime(LocalDateTime.now().plusDays(5))
                .proposedEndTime(LocalDateTime.now().plusDays(5).plusHours(1))
                .build();

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        assertThrows(RescheduleNotAllowedException.class, () ->
                sessionService.rescheduleSession(request, userId));
    }

    // ============================================================
    // Cancel Session Tests
    // ============================================================

    @Test
    void shouldCancelSessionSuccessfully() {
        CancellationRequest request = CancellationRequest.builder()
                .sessionId(sessionId)
                .reason("Personal emergency")
                .cancellationType("VOLUNTARY")
                .build();

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);
        when(cancellationRepository.save(any(Cancellation.class))).thenReturn(null);
        when(sessionHistoryRepository.save(any(SessionHistory.class))).thenReturn(null);

        SessionResponse result = sessionService.cancelSession(request, userId);

        assertNotNull(result);
        assertEquals(SessionStatus.CANCELLED, session.getStatus());
        assertEquals("Personal emergency", session.getCancellationReason());
        verify(eventPublisher, times(1)).publishSessionCancelled(
                any(), any(), any(), any(), any(), any(), any(), anyString());
    }

    @Test
    void shouldThrowExceptionWhenCancellingCompletedSession() {
        session.setStatus(SessionStatus.COMPLETED);
        CancellationRequest request = CancellationRequest.builder()
                .sessionId(sessionId)
                .build();

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        assertThrows(CancellationNotAllowedException.class, () ->
                sessionService.cancelSession(request, userId));
    }

    // ============================================================
    // Upcoming Sessions Tests
    // ============================================================

    @Test
    void shouldGetUpcomingSessions() {
        Page<Session> sessionPage = new PageImpl<>(List.of(session));
        when(sessionRepository.findUpcomingByUserId(any(), any(), any())).thenReturn(sessionPage);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);

        PageResponse<SessionResponse> result = sessionService.getUpcomingSessions(userId, 0, 20);

        assertNotNull(result);
        assertEquals(1, result.content().size());
        assertFalse(result.empty());
    }

    // ============================================================
    // Session History Tests
    // ============================================================

    @Test
    void shouldGetSessionHistory() {
        Page<Session> sessionPage = new PageImpl<>(List.of(session));
        when(sessionRepository.findHistoryByUserId(any(), any(), any())).thenReturn(sessionPage);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);

        PageResponse<SessionResponse> result = sessionService.getSessionHistory(userId, 0, 20);

        assertNotNull(result);
        assertEquals(1, result.content().size());
    }

    // ============================================================
    // Search Sessions Tests
    // ============================================================

    @Test
    void shouldSearchSessions() {
        SearchRequest searchRequest = SearchRequest.builder()
                .mentorId(mentorId)
                .build();

        Page<Session> sessionPage = new PageImpl<>(List.of(session));
        when(sessionRepository.findByMentorId(any(), any())).thenReturn(sessionPage);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);

        PageResponse<SessionResponse> result = sessionService.searchSessions(searchRequest, 0, 20);

        assertNotNull(result);
        assertEquals(1, result.content().size());
    }

    // ============================================================
    // Attendance Tests
    // ============================================================

    @Test
    void shouldMarkAttendanceSuccessfully() {
        AttendanceRequest request = AttendanceRequest.builder()
                .sessionId(sessionId)
                .userId(learnerId)
                .attendanceStatus("PRESENT")
                .late(false)
                .build();

        session.setStatus(SessionStatus.IN_PROGRESS);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(attendanceRepository.findBySessionIdAndUserId(sessionId, learnerId)).thenReturn(Optional.empty());
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(i -> i.getArgument(0));
        when(sessionMapper.toAttendanceResponse(any(Attendance.class))).thenReturn(
                AttendanceResponse.builder().build());

        AttendanceResponse result = sessionService.markAttendance(request, userId);

        assertNotNull(result);
        verify(attendanceRepository, times(1)).save(any(Attendance.class));
    }

    @Test
    void shouldThrowExceptionWhenMarkingAttendanceForNonActiveSession() {
        AttendanceRequest request = AttendanceRequest.builder()
                .sessionId(sessionId)
                .userId(learnerId)
                .attendanceStatus("PRESENT")
                .build();

        session.setStatus(SessionStatus.SCHEDULED);
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        assertThrows(InvalidSessionStateException.class, () ->
                sessionService.markAttendance(request, userId));
    }

    // ============================================================
    // Meeting Link Tests
    // ============================================================

    @Test
    void shouldGetMeetingLinkSuccessfully() {
        // The caller must belong to the session and the current time must be
        // inside the join window (start - 10min → end).
        session.setStatus(SessionStatus.APPROVED);
        session.setStartTime(LocalDateTime.now().plusMinutes(5));
        session.setEndTime(LocalDateTime.now().plusMinutes(65));
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        MeetingLink meetingLink = MeetingLink.builder()
                .id(UUID.randomUUID())
                .sessionId(sessionId)
                .meetingUrl("https://discord.gg/abc123")
                .joinUrl("https://discord.gg/abc123")
                .active(true)
                .build();

        when(meetingLinkRepository.findBySessionIdAndActiveTrue(sessionId))
                .thenReturn(Optional.of(meetingLink));
        when(sessionMapper.toMeetingResponse(any())).thenReturn(
                com.skillinfinity.session.dto.response.MeetingResponse.builder()
                        .meetingUrl("https://discord.gg/abc123")
                        .build());

        com.skillinfinity.session.dto.response.MeetingResponse result =
                sessionService.getMeetingLink(sessionId, mentorId);

        assertNotNull(result);
        assertEquals("https://discord.gg/abc123", result.getMeetingUrl());
    }

    @Test
    void shouldLazilyCreateMeetingLinkWhenMissing() {
        // Legacy sessions with no persisted link still get one: the join
        // endpoint guarantees a link exists once the window is open, and
        // concurrent joins never create duplicates.
        session.setStatus(SessionStatus.APPROVED);
        session.setStartTime(LocalDateTime.now().plusMinutes(5));
        session.setEndTime(LocalDateTime.now().plusMinutes(65));
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        MeetingLink created = MeetingLink.builder()
                .id(UUID.randomUUID())
                .sessionId(sessionId)
                .meetingUrl("https://discord.gg/0000000000")
                .joinUrl("https://discord.gg/0000000000")
                .active(true)
                .build();

        // Sequence: ensureMeetingLink finds nothing → createMeetingLink's
        // idempotency guard also finds nothing → it saves → the re-query
        // after creation returns the persisted link.
        when(meetingLinkRepository.findBySessionIdAndActiveTrue(sessionId))
                .thenReturn(Optional.empty(), Optional.empty(), Optional.of(created));
        when(meetingLinkRepository.findBySessionId(sessionId)).thenReturn(List.of());
        when(meetingLinkRepository.save(any(MeetingLink.class))).thenReturn(created);
        when(sessionMapper.toMeetingResponse(any())).thenReturn(
                com.skillinfinity.session.dto.response.MeetingResponse.builder()
                        .meetingUrl("https://discord.gg/0000000000")
                        .build());

        com.skillinfinity.session.dto.response.MeetingResponse result =
                sessionService.getMeetingLink(sessionId, mentorId);

        assertNotNull(result);
        assertEquals("https://discord.gg/0000000000", result.getMeetingUrl());
        verify(meetingLinkRepository).save(any(MeetingLink.class));
    }

    @Test
    void shouldNotFabricateMeetingLinkWhenNoRealInviteConfigured() {
        // No DISCORD_MEETING_URL / DISCORD_INVITE_CODE configured: the join
        // endpoint must NOT fabricate a discord.gg URL. It reports that no
        // meeting link is available instead.
        org.springframework.test.util.ReflectionTestUtils.setField(sessionService, "discordMeetingUrl", "");
        org.springframework.test.util.ReflectionTestUtils.setField(sessionService, "discordInviteCode", "");

        session.setStatus(SessionStatus.APPROVED);
        session.setStartTime(LocalDateTime.now().plusMinutes(5));
        session.setEndTime(LocalDateTime.now().plusMinutes(65));
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        assertThrows(MeetingNotAvailableException.class, () ->
                sessionService.getMeetingLink(sessionId, mentorId));
        verify(meetingLinkRepository, never()).save(any(MeetingLink.class));
    }

    @Test
    void shouldRejectMeetingLinkOutsideJoinWindow() {
        // Session starts in 2 days — well before the 10-minute join window.
        session.setStatus(SessionStatus.APPROVED);
        session.setStartTime(LocalDateTime.now().plusDays(2));
        session.setEndTime(LocalDateTime.now().plusDays(2).plusHours(1));
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));

        assertThrows(BadRequestException.class, () ->
                sessionService.getMeetingLink(sessionId, mentorId));
    }

    @Test
    void shouldRejectMeetingLinkForNonParticipant() {
        session.setStatus(SessionStatus.APPROVED);
        session.setStartTime(LocalDateTime.now().plusMinutes(5));
        session.setEndTime(LocalDateTime.now().plusMinutes(65));
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionParticipantRepository.existsBySessionIdAndUserId(sessionId, userId))
                .thenReturn(false);

        // userId is not this session's mentor or learner.
        assertThrows(ForbiddenException.class, () ->
                sessionService.getMeetingLink(sessionId, userId));
    }

    // ============================================================
    // Get All Sessions Tests
    // ============================================================

    @Test
    void shouldGetAllSessions() {
        Page<Session> sessionPage = new PageImpl<>(List.of(session));
        when(sessionRepository.findAll(any(Pageable.class))).thenReturn(sessionPage);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);

        PageResponse<SessionResponse> result = sessionService.getAllSessions(0, 20);

        assertNotNull(result);
        assertEquals(1, result.content().size());
    }

    // ============================================================
    // Community Session Tests
    // ============================================================

    private CommunitySessionRequest communityRequest(Integer cost, Integer maxParticipants) {
        return CommunitySessionRequest.builder()
                .topic("Java Resume Screening")
                .description("Resume review for juniors")
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(1).plusHours(1))
                .timezone("UTC")
                .cost(cost)
                .maxParticipants(maxParticipants)
                .build();
    }

    private void stubCommunityCreate() {
        // The mocked save never runs @PrePersist, so assign the id the
        // service assigns in production (needed by createMeetingLink).
        when(sessionRepository.save(any(Session.class))).thenAnswer(i -> {
            Session saved = i.getArgument(0);
            if (saved.getId() == null) {
                saved.setId(UUID.randomUUID());
            }
            return saved;
        });
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);
        when(sessionParticipantRepository.save(any(SessionParticipant.class))).thenReturn(null);
        when(sessionHistoryRepository.save(any(SessionHistory.class))).thenReturn(null);
        when(meetingLinkRepository.save(any(MeetingLink.class))).thenReturn(null);
        when(sessionReminderRepository.save(any(SessionReminder.class))).thenReturn(null);
    }

    @Test
    void shouldCreateTrueFreeCommunitySession() {
        stubCommunityCreate();

        sessionService.createCommunitySession(communityRequest(0, 20), mentorId);

        verify(sessionRepository).save(sessionCaptor.capture());
        Session saved = sessionCaptor.getValue();
        assertEquals(0.0, saved.getPrice(), 0.001);
        assertTrue(saved.isFree());
        assertTrue(saved.isCommunity());
        assertEquals(Integer.valueOf(20), saved.getMaxParticipants());
    }

    @Test
    void shouldCreatePaidCommunitySession() {
        stubCommunityCreate();

        sessionService.createCommunitySession(communityRequest(2, 10), mentorId);

        verify(sessionRepository).save(sessionCaptor.capture());
        Session saved = sessionCaptor.getValue();
        assertEquals(2.0, saved.getPrice(), 0.001);
        assertFalse(saved.isFree());
        assertTrue(saved.isCommunity());
        assertEquals(Integer.valueOf(10), saved.getMaxParticipants());
    }

    @Test
    void shouldRejectCommunityCostAboveThreeCredits() {
        assertThrows(BadRequestException.class, () ->
                sessionService.createCommunitySession(communityRequest(4, 20), mentorId));
    }

    @Test
    void shouldRejectNegativeCommunityCost() {
        assertThrows(BadRequestException.class, () ->
                sessionService.createCommunitySession(communityRequest(-1, 20), mentorId));
    }

    @Test
    void shouldRejectCommunityCapacityAboveTwenty() {
        assertThrows(BadRequestException.class, () ->
                sessionService.createCommunitySession(communityRequest(0, 21), mentorId));
    }

    @Test
    void shouldRejectCommunityCapacityBelowOne() {
        assertThrows(BadRequestException.class, () ->
                sessionService.createCommunitySession(communityRequest(0, 0), mentorId));
    }

    private Session communitySession(double price, Integer maxParticipants, SessionStatus status) {
        return Session.builder()
                .id(sessionId)
                .title("Community")
                .mentorId(mentorId)
                .learnerId(mentorId)
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(1).plusHours(1))
                .durationMinutes(60)
                .status(status)
                .topic("Java")
                .price(price)
                .free(price == 0)
                .community(true)
                .maxParticipants(maxParticipants)
                .build();
    }

    @Test
    void shouldJoinTrueFreeCommunitySessionWithoutFreezing() {
        Session community = communitySession(0, 20, SessionStatus.SCHEDULED);
        when(sessionRepository.findByIdForUpdate(sessionId)).thenReturn(Optional.of(community));
        when(sessionParticipantRepository.existsBySessionIdAndUserId(sessionId, learnerId)).thenReturn(false);
        when(sessionParticipantRepository.countBySessionIdAndRole(sessionId, "LEARNER")).thenReturn(0L);
        when(sessionParticipantRepository.countFreeCommunityJoinsSince(any(), any())).thenReturn(0L);
        when(sessionParticipantRepository.save(any(SessionParticipant.class))).thenReturn(null);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);

        sessionService.joinCommunitySession(sessionId, learnerId);

        verify(walletClient, never()).freezeCredits(any(), anyDouble(), any(), anyString());
        verify(sessionParticipantRepository, times(1)).save(any(SessionParticipant.class));
    }

    @Test
    void shouldFreezeCreditsWhenJoiningPaidCommunitySession() {
        Session community = communitySession(2, 20, SessionStatus.SCHEDULED);
        when(sessionRepository.findByIdForUpdate(sessionId)).thenReturn(Optional.of(community));
        when(sessionParticipantRepository.existsBySessionIdAndUserId(sessionId, learnerId)).thenReturn(false);
        when(sessionParticipantRepository.countBySessionIdAndRole(sessionId, "LEARNER")).thenReturn(0L);
        when(sessionParticipantRepository.save(any(SessionParticipant.class))).thenReturn(null);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);

        sessionService.joinCommunitySession(sessionId, learnerId);

        verify(walletClient, times(1)).freezeCredits(eq(learnerId), eq(2.0), eq(sessionId), anyString());
        verify(sessionParticipantRepository, times(1)).save(any(SessionParticipant.class));
    }

    @Test
    void shouldRejectJoinWhenCommunitySessionIsFull() {
        Session community = communitySession(0, 20, SessionStatus.SCHEDULED);
        when(sessionRepository.findByIdForUpdate(sessionId)).thenReturn(Optional.of(community));
        when(sessionParticipantRepository.existsBySessionIdAndUserId(sessionId, learnerId)).thenReturn(false);
        when(sessionParticipantRepository.countBySessionIdAndRole(sessionId, "LEARNER")).thenReturn(20L);

        assertThrows(BadRequestException.class, () ->
                sessionService.joinCommunitySession(sessionId, learnerId));

        verify(walletClient, never()).freezeCredits(any(), anyDouble(), any(), anyString());
        verify(sessionParticipantRepository, never()).save(any(SessionParticipant.class));
    }

    @Test
    void shouldRejectJoinWhenFreeAllowanceExhausted() {
        Session community = communitySession(0, 20, SessionStatus.SCHEDULED);
        when(sessionRepository.findByIdForUpdate(sessionId)).thenReturn(Optional.of(community));
        when(sessionParticipantRepository.existsBySessionIdAndUserId(sessionId, learnerId)).thenReturn(false);
        when(sessionParticipantRepository.countBySessionIdAndRole(sessionId, "LEARNER")).thenReturn(0L);
        when(sessionParticipantRepository.countFreeCommunityJoinsSince(any(), any())).thenReturn(3L);

        assertThrows(BadRequestException.class, () ->
                sessionService.joinCommunitySession(sessionId, learnerId));

        verify(walletClient, never()).freezeCredits(any(), anyDouble(), any(), anyString());
        verify(sessionParticipantRepository, never()).save(any(SessionParticipant.class));
    }

    @Test
    void shouldReleaseLearnerHoldsWhenPaidCommunitySessionCancelled() {
        Session community = communitySession(2, 20, SessionStatus.SCHEDULED);
        UUID joiner = UUID.randomUUID();
        SessionParticipant learnerParticipant = SessionParticipant.builder()
                .sessionId(sessionId)
                .userId(joiner)
                .role("LEARNER")
                .build();

        CancellationRequest request = CancellationRequest.builder()
                .sessionId(sessionId)
                .reason("Mentor unavailable")
                .build();

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(community));
        when(sessionParticipantRepository.findBySessionIdAndRole(sessionId, "LEARNER"))
                .thenReturn(List.of(learnerParticipant));
        when(sessionRepository.save(any(Session.class))).thenReturn(community);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);
        when(cancellationRepository.save(any(Cancellation.class))).thenReturn(null);
        when(sessionHistoryRepository.save(any(SessionHistory.class))).thenReturn(null);

        sessionService.cancelSession(request, mentorId);

        verify(walletClient, times(1)).releaseCredits(eq(joiner), eq(2.0), eq(sessionId), anyString());
        verify(eventPublisher, times(1)).publishSessionCancelled(
                any(), any(), any(), any(), any(), any(), any(), anyString());
    }

    @Test
    void shouldPublishPerLearnerCompletionForPaidCommunitySession() {
        Session community = communitySession(2, 20, SessionStatus.IN_PROGRESS);
        UUID learnerA = UUID.randomUUID();
        UUID learnerB = UUID.randomUUID();
        SessionParticipant pa = SessionParticipant.builder().sessionId(sessionId).userId(learnerA).role("LEARNER").build();
        SessionParticipant pb = SessionParticipant.builder().sessionId(sessionId).userId(learnerB).role("LEARNER").build();

        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(community));
        when(sessionParticipantRepository.findBySessionIdAndRole(sessionId, "LEARNER"))
                .thenReturn(List.of(pa, pb));
        when(sessionRepository.save(any(Session.class))).thenReturn(community);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);
        when(sessionHistoryRepository.save(any(SessionHistory.class))).thenReturn(null);
        // Both learners attended ≥80% → the mentor is credited once per learner.
        when(attendanceRepository.findBySessionIdAndUserId(eq(sessionId), eq(learnerA)))
                .thenReturn(Optional.of(attendanceRecord(community, learnerA)));
        when(attendanceRepository.findBySessionIdAndUserId(eq(sessionId), eq(learnerB)))
                .thenReturn(Optional.of(attendanceRecord(community, learnerB)));

        sessionService.endSession(sessionId, mentorId);

        verify(eventPublisher, times(2)).publishSessionCompleted(
                eq(sessionId), eq(mentorId), any(), any(), any(), any(), any(), eq(2.0), eq(true));
    }

    /** An attendance record whose join is within the session → ≥80% attendance. */
    private Attendance attendanceRecord(Session s, UUID who) {
        return Attendance.builder()
                .sessionId(s.getId())
                .userId(who)
                .status(AttendanceStatus.PRESENT)
                .joinTime(s.getStartTime().plusMinutes(1))
                .build();
    }

    @Test
    void shouldRejectJoinWhenLearnerHasInsufficientCredits() {
        // TEST 7 — a learner without enough balance to cover the cost of a
        // paid community session must be rejected with a clear error; the
        // wallet hold fails and no participant record is created.
        Session community = communitySession(2, 20, SessionStatus.SCHEDULED);
        when(sessionRepository.findByIdForUpdate(sessionId)).thenReturn(Optional.of(community));
        when(sessionParticipantRepository.existsBySessionIdAndUserId(sessionId, learnerId)).thenReturn(false);
        when(sessionParticipantRepository.countBySessionIdAndRole(sessionId, "LEARNER")).thenReturn(0L);
        doThrow(new BadRequestException("Insufficient credits — your balance cannot cover 2 credits"))
                .when(walletClient).freezeCredits(eq(learnerId), eq(2.0), eq(sessionId), anyString());

        assertThrows(BadRequestException.class, () ->
                sessionService.joinCommunitySession(sessionId, learnerId));

        verify(sessionParticipantRepository, never()).save(any(SessionParticipant.class));
    }

    @Test
    void shouldCountOnlyFreeCommunityJoinsForAllowance() {
        when(sessionParticipantRepository.countFreeCommunityJoinsSince(eq(learnerId), any())).thenReturn(2L);

        CommunityAllowanceResponse allowance = sessionService.getCommunityAllowance(learnerId);

        assertEquals(3, allowance.getLimit());
        assertEquals(2, allowance.getUsed());
        assertEquals(1, allowance.getRemaining());
        verify(sessionParticipantRepository, times(1)).countFreeCommunityJoinsSince(eq(learnerId), any());
        verify(sessionParticipantRepository, never()).countByUserIdAndRoleAndJoinedAtGreaterThanEqual(any(), any(), any());
    }
}
