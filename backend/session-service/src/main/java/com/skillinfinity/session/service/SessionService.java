package com.skillinfinity.session.service;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.session.dto.request.AttendanceRequest;
import com.skillinfinity.session.dto.request.BookingRequest;
import com.skillinfinity.session.dto.request.CancellationRequest;
import com.skillinfinity.session.dto.request.RescheduleRequestDto;
import com.skillinfinity.session.dto.request.SearchRequest;
import com.skillinfinity.session.dto.request.SessionRequest;
import com.skillinfinity.session.dto.response.AttendanceResponse;
import com.skillinfinity.session.dto.response.BookingResponse;
import com.skillinfinity.session.dto.response.CalendarResponse;
import com.skillinfinity.session.dto.response.MeetingResponse;
import com.skillinfinity.session.dto.response.SessionResponse;

import java.util.UUID;

public interface SessionService {

    // Session CRUD
    SessionResponse createSession(SessionRequest request, UUID userId);

    SessionResponse getSessionById(UUID sessionId);

    SessionResponse updateSession(UUID sessionId, SessionRequest request, UUID userId);

    void deleteSession(UUID sessionId, UUID userId);

    PageResponse<SessionResponse> getAllSessions(int page, int size);

    // Booking
    BookingResponse bookSession(BookingRequest request, UUID userId);

    BookingResponse approveBooking(UUID bookingId, UUID mentorId);

    BookingResponse rejectBooking(UUID bookingId, UUID mentorId, String reason);

    // Session lifecycle
    SessionResponse startSession(UUID sessionId, UUID userId);

    SessionResponse endSession(UUID sessionId, UUID userId);

    SessionResponse completeSession(UUID sessionId, UUID userId);

    // Reschedule
    SessionResponse rescheduleSession(RescheduleRequestDto request, UUID userId);

    // Cancel
    SessionResponse cancelSession(CancellationRequest request, UUID userId);

    // Queries
    PageResponse<SessionResponse> getUpcomingSessions(UUID userId, int page, int size);

    PageResponse<SessionResponse> getSessionHistory(UUID userId, int page, int size);

    PageResponse<SessionResponse> searchSessions(SearchRequest request, int page, int size);

    // Attendance
    AttendanceResponse markAttendance(AttendanceRequest request, UUID userId);

    AttendanceResponse getAttendance(UUID sessionId, UUID userId);

    // Meeting
    MeetingResponse getMeetingLink(UUID sessionId);

    // Calendar
    CalendarResponse getCalendar(UUID userId, String startDate, String endDate);

    String exportCalendarIcs(UUID userId);
}
