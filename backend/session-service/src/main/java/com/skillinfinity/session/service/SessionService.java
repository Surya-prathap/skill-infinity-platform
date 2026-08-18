package com.skillinfinity.session.service;

import com.skillinfinity.common.dto.PageResponse;
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

import java.util.UUID;

public interface SessionService {

    // Session CRUD
    SessionResponse createSession(SessionRequest request, UUID userId);

    /**
     * Session details for a caller who must be a participant (mentor, learner
     * or joined community participant). Enforced server-side so no user can
     * read another user's session details or meeting invite by ID.
     */
    SessionResponse getSessionById(UUID sessionId, UUID userId);

    SessionResponse updateSession(UUID sessionId, SessionRequest request, UUID userId);

    void deleteSession(UUID sessionId, UUID userId);

    PageResponse<SessionResponse> getAllSessions(int page, int size);

    // Booking
    BookingResponse bookSession(BookingRequest request, UUID userId);

    BookingResponse approveBooking(UUID bookingId, UUID mentorId);

    BookingResponse rejectBooking(UUID bookingId, UUID mentorId, String reason);

    /**
     * Bookings where the authenticated user is the mentor (dashboard requests).
     * When {@code status} is non-blank only that booking status is returned
     * (e.g. PENDING). Always scoped to the caller's mentor id.
     */
    PageResponse<BookingResponse> getMentorBookings(UUID mentorId, String status, int page, int size);

    /** Bookings where the authenticated user is the learner. */
    PageResponse<BookingResponse> getLearnerBookings(UUID learnerId, String status, int page, int size);

    // Session lifecycle
    SessionResponse startSession(UUID sessionId, UUID userId);

    SessionResponse endSession(UUID sessionId, UUID userId);

    SessionResponse completeSession(UUID sessionId, UUID userId);

    /**
     * Auto-completes every session whose scheduled window has passed and that
     * was never explicitly finished. Attendance is calculated and credits are
     * settled (transferred on ≥80% attendance, released otherwise). Called by
     * the SessionCompletionJob on a schedule. Returns the number completed.
     */
    int autoCompleteExpiredSessions();

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

    // Meeting — validates the requester belongs to the session and that the
    // current time is inside the join window before returning the link.
    MeetingResponse getMeetingLink(UUID sessionId, UUID userId);

    // Community sessions
    SessionResponse createCommunitySession(CommunitySessionRequest request, UUID mentorId);

    PageResponse<SessionResponse> getUpcomingCommunitySessions(int page, int size);

    SessionResponse joinCommunitySession(UUID sessionId, UUID userId);

    CommunityAllowanceResponse getCommunityAllowance(UUID userId);

    CommunityImpactResponse getMentorCommunityImpact(UUID mentorId);
}
