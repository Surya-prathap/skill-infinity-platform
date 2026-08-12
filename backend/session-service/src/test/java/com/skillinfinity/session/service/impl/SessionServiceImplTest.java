package com.skillinfinity.session.service.impl;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.session.dto.request.AttendanceRequest;
import com.skillinfinity.session.dto.request.BookingRequest;
import com.skillinfinity.session.dto.request.CancellationRequest;
import com.skillinfinity.session.dto.request.RescheduleRequestDto;
import com.skillinfinity.session.dto.request.SearchRequest;
import com.skillinfinity.session.dto.request.SessionRequest;
import com.skillinfinity.session.dto.response.AttendanceResponse;
import com.skillinfinity.session.dto.response.BookingResponse;
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
import com.skillinfinity.session.repository.CalendarEventRepository;
import com.skillinfinity.session.repository.CancellationRepository;
import com.skillinfinity.session.repository.MeetingLinkRepository;
import com.skillinfinity.session.repository.RescheduleRequestRepository;
import com.skillinfinity.session.repository.SessionHistoryRepository;
import com.skillinfinity.session.repository.SessionNotesRepository;
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
    private SessionNotesRepository sessionNotesRepository;
    @Mock
    private CalendarEventRepository calendarEventRepository;
    @Mock
    private SessionMapper sessionMapper;
    @Mock
    private SessionEventPublisher eventPublisher;
    @Mock
    private WalletClient walletClient;

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
                sessionNotesRepository, calendarEventRepository,
                sessionMapper, eventPublisher, walletClient
        );

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

        bookingRequest = BookingRequest.builder()
                .mentorId(mentorId)
                .learnerId(learnerId)
                .mentorName("Mentor")
                .learnerName("Learner")
                .topic("Java Session")
                .description("Need help with Java")
                .preferredDate(LocalDateTime.now().plusDays(3))
                .preferredStartTime(LocalDateTime.now().plusDays(3).plusHours(10))
                .preferredEndTime(LocalDateTime.now().plusDays(3).plusHours(11))
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
        when(sessionMapper.toResponse(session)).thenReturn(sessionResponse);
        when(meetingLinkRepository.findBySessionIdAndActiveTrue(sessionId)).thenReturn(Optional.empty());

        SessionResponse result = sessionService.getSessionById(sessionId);

        assertNotNull(result);
        assertEquals(sessionId, result.getId());
    }

    @Test
    void shouldThrowExceptionWhenSessionNotFound() {
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.empty());

        assertThrows(SessionNotFoundException.class, () ->
                sessionService.getSessionById(sessionId));
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
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArgument(0));
        when(sessionMapper.toBookingResponse(any(Booking.class))).thenReturn(bookingResponse);

        BookingResponse result = sessionService.bookSession(bookingRequest, userId);

        assertNotNull(result);
        verify(bookingRepository, times(1)).save(any(Booking.class));
        verify(eventPublisher, times(1)).publishSessionBooked(
                any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), anyInt());
    }

    @Test
    void shouldThrowExceptionWhenBookingInThePast() {
        bookingRequest.setPreferredDate(LocalDateTime.now().minusDays(1));

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
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(session));
        when(sessionRepository.save(any(Session.class))).thenReturn(session);
        when(sessionMapper.toResponse(any(Session.class))).thenReturn(sessionResponse);
        when(sessionHistoryRepository.save(any(SessionHistory.class))).thenReturn(null);

        SessionResponse result = sessionService.endSession(sessionId, userId);

        assertNotNull(result);
        assertEquals(SessionStatus.COMPLETED, session.getStatus());
        assertNotNull(session.getEndedAt());
        assertNotNull(session.getCompletedAt());
        verify(eventPublisher, times(1)).publishSessionCompleted(
                any(), any(), any(), any(), any(), any(), any(), anyDouble(), anyBoolean());
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
        when(sessionRepository.findByUserId(any(), any())).thenReturn(sessionPage);
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
        MeetingLink meetingLink = MeetingLink.builder()
                .id(UUID.randomUUID())
                .sessionId(sessionId)
                .meetingUrl("https://meet.example.com/123")
                .active(true)
                .build();

        when(meetingLinkRepository.findBySessionIdAndActiveTrue(sessionId))
                .thenReturn(Optional.of(meetingLink));
        when(sessionMapper.toMeetingResponse(any())).thenReturn(
                com.skillinfinity.session.dto.response.MeetingResponse.builder()
                        .meetingUrl("https://meet.example.com/123")
                        .build());

        com.skillinfinity.session.dto.response.MeetingResponse result =
                sessionService.getMeetingLink(sessionId);

        assertNotNull(result);
        assertEquals("https://meet.example.com/123", result.getMeetingUrl());
    }

    @Test
    void shouldThrowExceptionWhenNoMeetingLink() {
        when(meetingLinkRepository.findBySessionIdAndActiveTrue(sessionId))
                .thenReturn(Optional.empty());

        assertThrows(MeetingNotAvailableException.class, () ->
                sessionService.getMeetingLink(sessionId));
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
}
