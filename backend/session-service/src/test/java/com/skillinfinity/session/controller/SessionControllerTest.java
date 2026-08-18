package com.skillinfinity.session.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.session.dto.request.AttendanceRequest;
import com.skillinfinity.session.dto.request.BookingRequest;
import com.skillinfinity.session.dto.request.CancellationRequest;
import com.skillinfinity.session.dto.request.RescheduleRequestDto;
import com.skillinfinity.session.dto.request.SearchRequest;
import com.skillinfinity.session.dto.request.SessionRequest;
import com.skillinfinity.session.dto.response.AttendanceResponse;
import com.skillinfinity.session.dto.response.BookingResponse;
import com.skillinfinity.session.dto.response.MeetingResponse;
import com.skillinfinity.session.dto.response.SessionResponse;
import com.skillinfinity.session.service.SessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionControllerTest {

    @Mock
    private SessionService sessionService;

    @InjectMocks
    private SessionController sessionController;

    private UUID userId;
    private UUID sessionId;
    private UUID bookingId;
    private SessionRequest sessionRequest;
    private SessionResponse sessionResponse;
    private BookingRequest bookingRequest;
    private BookingResponse bookingResponse;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        sessionId = UUID.randomUUID();
        bookingId = UUID.randomUUID();

        sessionRequest = SessionRequest.builder()
                .title("Test Session")
                .description("Test Description")
                .mentorId(UUID.randomUUID())
                .learnerId(UUID.randomUUID())
                .startTime(LocalDateTime.now().plusDays(2))
                .endTime(LocalDateTime.now().plusDays(2).plusHours(1))
                .durationMinutes(60)
                .build();

        sessionResponse = SessionResponse.builder()
                .id(sessionId)
                .title("Test Session")
                .build();

        bookingRequest = BookingRequest.builder()
                .mentorId(UUID.randomUUID())
                .learnerId(UUID.randomUUID())
                .topic("Java")
                .preferredDate(LocalDateTime.now().plusDays(3))
                .durationMinutes(60)
                .build();

        bookingResponse = BookingResponse.builder()
                .id(bookingId)
                .build();
    }

    @Test
    void shouldCreateSession() {
        when(sessionService.createSession(any(SessionRequest.class), any(UUID.class)))
                .thenReturn(sessionResponse);

        ResponseEntity<ApiResponse<SessionResponse>> response =
                sessionController.createSession(userId, sessionRequest);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().success());
        assertEquals(sessionId, response.getBody().data().getId());
        verify(sessionService, times(1)).createSession(sessionRequest, userId);
    }

    @Test
    void shouldGetSessionById() {
        when(sessionService.getSessionById(sessionId, userId)).thenReturn(sessionResponse);

        ResponseEntity<ApiResponse<SessionResponse>> response =
                sessionController.getSessionById(sessionId, userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().success());
        assertEquals(sessionId, response.getBody().data().getId());
    }

    @Test
    void shouldUpdateSession() {
        when(sessionService.updateSession(any(UUID.class), any(SessionRequest.class), any(UUID.class)))
                .thenReturn(sessionResponse);

        ResponseEntity<ApiResponse<SessionResponse>> response =
                sessionController.updateSession(sessionId, userId, sessionRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().success());
    }

    @Test
    void shouldDeleteSession() {
        doNothing().when(sessionService).deleteSession(sessionId, userId);

        ResponseEntity<ApiResponse<Void>> response =
                sessionController.deleteSession(sessionId, userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().success());
        verify(sessionService, times(1)).deleteSession(sessionId, userId);
    }

    @Test
    void shouldGetAllSessions() {
        PageResponse<SessionResponse> pageResponse = PageResponse.of(
                List.of(sessionResponse), 0, 20, 1);
        when(sessionService.getAllSessions(0, 20)).thenReturn(pageResponse);

        ResponseEntity<ApiResponse<PageResponse<SessionResponse>>> response =
                sessionController.getAllSessions(0, 20);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().success());
        assertEquals(1, response.getBody().data().content().size());
    }

    @Test
    void shouldBookSession() {
        when(sessionService.bookSession(any(BookingRequest.class), any(UUID.class)))
                .thenReturn(bookingResponse);

        ResponseEntity<ApiResponse<BookingResponse>> response =
                sessionController.bookSession(userId, bookingRequest);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().success());
        assertEquals(bookingId, response.getBody().data().getId());
    }

    @Test
    void shouldApproveBooking() {
        when(sessionService.approveBooking(bookingId, userId)).thenReturn(bookingResponse);

        ResponseEntity<ApiResponse<BookingResponse>> response =
                sessionController.approveBooking(userId, bookingId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().success());
    }

    @Test
    void shouldRejectBooking() {
        when(sessionService.rejectBooking(bookingId, userId, "Not available"))
                .thenReturn(bookingResponse);

        ResponseEntity<ApiResponse<BookingResponse>> response =
                sessionController.rejectBooking(userId, bookingId, "Not available");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().success());
        verify(sessionService, times(1)).rejectBooking(bookingId, userId, "Not available");
    }

    @Test
    void shouldStartSession() {
        when(sessionService.startSession(sessionId, userId)).thenReturn(sessionResponse);

        ResponseEntity<ApiResponse<SessionResponse>> response =
                sessionController.startSession(userId, sessionId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Session started successfully", response.getBody().message());
    }

    @Test
    void shouldEndSession() {
        when(sessionService.endSession(sessionId, userId)).thenReturn(sessionResponse);

        ResponseEntity<ApiResponse<SessionResponse>> response =
                sessionController.endSession(userId, sessionId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Session ended successfully", response.getBody().message());
    }

    @Test
    void shouldCompleteSession() {
        when(sessionService.completeSession(sessionId, userId)).thenReturn(sessionResponse);

        ResponseEntity<ApiResponse<SessionResponse>> response =
                sessionController.completeSession(userId, sessionId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Session completed successfully", response.getBody().message());
    }

    @Test
    void shouldRescheduleSession() {
        RescheduleRequestDto request = RescheduleRequestDto.builder()
                .sessionId(sessionId)
                .proposedStartTime(LocalDateTime.now().plusDays(5))
                .proposedEndTime(LocalDateTime.now().plusDays(5).plusHours(1))
                .build();

        when(sessionService.rescheduleSession(any(RescheduleRequestDto.class), any(UUID.class)))
                .thenReturn(sessionResponse);

        ResponseEntity<ApiResponse<SessionResponse>> response =
                sessionController.rescheduleSession(userId, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Session rescheduled successfully", response.getBody().message());
    }

    @Test
    void shouldCancelSession() {
        CancellationRequest request = CancellationRequest.builder()
                .sessionId(sessionId)
                .reason("Emergency")
                .build();

        when(sessionService.cancelSession(any(CancellationRequest.class), any(UUID.class)))
                .thenReturn(sessionResponse);

        ResponseEntity<ApiResponse<SessionResponse>> response =
                sessionController.cancelSession(userId, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Session cancelled successfully", response.getBody().message());
    }

    @Test
    void shouldGetUpcomingSessions() {
        PageResponse<SessionResponse> pageResponse = PageResponse.of(
                List.of(sessionResponse), 0, 20, 1);
        when(sessionService.getUpcomingSessions(userId, 0, 20)).thenReturn(pageResponse);

        ResponseEntity<ApiResponse<PageResponse<SessionResponse>>> response =
                sessionController.getUpcomingSessions(userId, 0, 20);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().success());
        assertEquals(1, response.getBody().data().content().size());
    }

    @Test
    void shouldGetSessionHistory() {
        PageResponse<SessionResponse> pageResponse = PageResponse.of(
                List.of(sessionResponse), 0, 20, 1);
        when(sessionService.getSessionHistory(userId, 0, 20)).thenReturn(pageResponse);

        ResponseEntity<ApiResponse<PageResponse<SessionResponse>>> response =
                sessionController.getSessionHistory(userId, 0, 20);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().success());
    }

    @Test
    void shouldSearchSessions() {
        SearchRequest searchRequest = SearchRequest.builder().mentorId(UUID.randomUUID()).build();
        PageResponse<SessionResponse> pageResponse = PageResponse.of(
                List.of(sessionResponse), 0, 20, 1);

        when(sessionService.searchSessions(any(SearchRequest.class), eq(0), eq(20)))
                .thenReturn(pageResponse);

        ResponseEntity<ApiResponse<PageResponse<SessionResponse>>> response =
                sessionController.searchSessions(searchRequest, 0, 20);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().success());
    }

    @Test
    void shouldMarkAttendance() {
        AttendanceRequest request = AttendanceRequest.builder()
                .sessionId(sessionId)
                .userId(UUID.randomUUID())
                .attendanceStatus("PRESENT")
                .build();
        AttendanceResponse attendanceResponse = AttendanceResponse.builder().build();

        when(sessionService.markAttendance(any(AttendanceRequest.class), any(UUID.class)))
                .thenReturn(attendanceResponse);

        ResponseEntity<ApiResponse<AttendanceResponse>> response =
                sessionController.markAttendance(userId, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().success());
    }

    @Test
    void shouldGetAttendanceWhenExists() {
        AttendanceResponse attendanceResponse = AttendanceResponse.builder()
                .sessionId(sessionId)
                .build();

        when(sessionService.getAttendance(sessionId, userId)).thenReturn(attendanceResponse);

        ResponseEntity<ApiResponse<AttendanceResponse>> response =
                sessionController.getAttendance(sessionId, userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().success());
        assertNotNull(response.getBody().data());
    }

    @Test
    void shouldReturnNullWhenAttendanceNotExists() {
        when(sessionService.getAttendance(sessionId, userId)).thenReturn(null);

        ResponseEntity<ApiResponse<AttendanceResponse>> response =
                sessionController.getAttendance(sessionId, userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNull(response.getBody().data());
    }

    @Test
    void shouldGetMeetingLink() {
        MeetingResponse meetingResponse = MeetingResponse.builder()
                .meetingUrl("https://discord.gg/abc123")
                .build();
        when(sessionService.getMeetingLink(sessionId, userId)).thenReturn(meetingResponse);

        ResponseEntity<ApiResponse<MeetingResponse>> response =
                sessionController.getMeetingLink(sessionId, userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().success());
    }

}
