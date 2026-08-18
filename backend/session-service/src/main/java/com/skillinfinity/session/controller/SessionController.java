package com.skillinfinity.session.controller;

import com.skillinfinity.common.dto.ApiResponse;
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
import com.skillinfinity.session.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/sessions")
@RequiredArgsConstructor
@Tag(name = "Session Management", description = "Complete session lifecycle management including booking, scheduling, attendance, reminders, and calendar")
public class SessionController {

    private final SessionService sessionService;

    // ============================================================
    // Session CRUD
    // ============================================================

    @PostMapping
    @Operation(summary = "Create a session", description = "Creates a new mentoring session")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Session created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input or validation error"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Duplicate booking or slot unavailable")
    })
    public ResponseEntity<ApiResponse<SessionResponse>> createSession(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody SessionRequest request) {
        log.info("Create session request from user: {}", userId);
        SessionResponse response = sessionService.createSession(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Session created successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all sessions", description = "Returns paginated list of all sessions (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<SessionResponse>>> getAllSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<SessionResponse> response = sessionService.getAllSessions(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get session by ID", description = "Returns session details for the specified session ID (participants only)")
    public ResponseEntity<ApiResponse<SessionResponse>> getSessionById(
            @PathVariable UUID id,
            @RequestHeader("X-User-ID") UUID userId) {
        SessionResponse response = sessionService.getSessionById(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ============================================================
    // Community Sessions
    // ============================================================

    @PostMapping("/community")
    @Operation(summary = "Create community session", description = "Mentor schedules a free community mentoring session")
    public ResponseEntity<ApiResponse<SessionResponse>> createCommunitySession(
            @RequestHeader("X-User-ID") UUID mentorId,
            @Valid @RequestBody CommunitySessionRequest request) {
        log.info("Create community session request from mentor: {}", mentorId);
        SessionResponse response = sessionService.createCommunitySession(request, mentorId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Community session scheduled successfully", response));
    }

    @GetMapping("/community/upcoming")
    @Operation(summary = "Upcoming community sessions", description = "Lists free community sessions open for joining")
    public ResponseEntity<ApiResponse<PageResponse<SessionResponse>>> getUpcomingCommunitySessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<SessionResponse> response = sessionService.getUpcomingCommunitySessions(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "Join community session", description = "Learner joins a free community session (3 per calendar month)")
    public ResponseEntity<ApiResponse<SessionResponse>> joinCommunitySession(
            @PathVariable UUID id,
            @RequestHeader("X-User-ID") UUID userId) {
        log.info("Join community session request from learner: {}", userId);
        SessionResponse response = sessionService.joinCommunitySession(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Joined community session successfully", response));
    }

    @GetMapping("/community/allowance")
    @Operation(summary = "Community session allowance", description = "Learner's free community sessions used/remaining this month")
    public ResponseEntity<ApiResponse<CommunityAllowanceResponse>> getCommunityAllowance(
            @RequestHeader("X-User-ID") UUID userId) {
        CommunityAllowanceResponse response = sessionService.getCommunityAllowance(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/community/impact/{mentorId}")
    @Operation(summary = "Mentor community impact", description = "Mentor's real community contribution statistics and recognition level")
    public ResponseEntity<ApiResponse<CommunityImpactResponse>> getMentorCommunityImpact(
            @PathVariable UUID mentorId) {
        CommunityImpactResponse response = sessionService.getMentorCommunityImpact(mentorId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update session", description = "Updates session information")
    public ResponseEntity<ApiResponse<SessionResponse>> updateSession(
            @PathVariable UUID id,
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody SessionRequest request) {
        SessionResponse response = sessionService.updateSession(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success("Session updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete session", description = "Deletes a session (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @PathVariable UUID id,
            @RequestHeader("X-User-ID") UUID userId) {
        sessionService.deleteSession(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Session deleted successfully", null));
    }

    // ============================================================
    // Booking
    // ============================================================

    @PostMapping("/book")
    @Operation(summary = "Book a session", description = "Learner books a session with a mentor")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Booking created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid input or validation error"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Duplicate booking or slot unavailable")
    })
    public ResponseEntity<ApiResponse<BookingResponse>> bookSession(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody BookingRequest request) {
        log.info("Book session request from learner: {}", userId);
        BookingResponse response = sessionService.bookSession(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully. Awaiting mentor approval.", response));
    }

    @GetMapping("/bookings/mentor")
    @Operation(summary = "Get mentor bookings", description = "Returns bookings where the authenticated user is the mentor (dashboard session requests)")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getMentorBookings(
            @RequestHeader("X-User-ID") UUID mentorId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<BookingResponse> response = sessionService.getMentorBookings(mentorId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/bookings/learner")
    @Operation(summary = "Get learner bookings", description = "Returns bookings where the authenticated user is the learner")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getLearnerBookings(
            @RequestHeader("X-User-ID") UUID learnerId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<BookingResponse> response = sessionService.getLearnerBookings(learnerId, status, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/approve")
    @Operation(summary = "Approve booking", description = "Mentor approves a pending booking")
    public ResponseEntity<ApiResponse<BookingResponse>> approveBooking(
            @RequestHeader("X-User-ID") UUID mentorId,
            @RequestParam UUID bookingId) {
        log.info("Approve booking request from mentor: {}", mentorId);
        BookingResponse response = sessionService.approveBooking(bookingId, mentorId);
        return ResponseEntity.ok(ApiResponse.success("Booking approved successfully", response));
    }

    @PostMapping("/reject")
    @Operation(summary = "Reject booking", description = "Mentor rejects a pending booking")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectBooking(
            @RequestHeader("X-User-ID") UUID mentorId,
            @RequestParam UUID bookingId,
            @RequestParam(required = false) String reason) {
        log.info("Reject booking request from mentor: {}", mentorId);
        BookingResponse response = sessionService.rejectBooking(bookingId, mentorId, reason);
        return ResponseEntity.ok(ApiResponse.success("Booking rejected", response));
    }

    // ============================================================
    // Session Lifecycle
    // ============================================================

    @PostMapping("/start")
    @Operation(summary = "Start a session", description = "Starts a scheduled session")
    public ResponseEntity<ApiResponse<SessionResponse>> startSession(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam UUID sessionId) {
        log.info("Start session request from user: {}", userId);
        SessionResponse response = sessionService.startSession(sessionId, userId);
        return ResponseEntity.ok(ApiResponse.success("Session started successfully", response));
    }

    @PostMapping("/end")
    @Operation(summary = "End a session", description = "Ends an active session")
    public ResponseEntity<ApiResponse<SessionResponse>> endSession(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam UUID sessionId) {
        log.info("End session request from user: {}", userId);
        SessionResponse response = sessionService.endSession(sessionId, userId);
        return ResponseEntity.ok(ApiResponse.success("Session ended successfully", response));
    }

    // ============================================================
    // Complete Session
    // ============================================================

    @PostMapping("/complete")
    @Operation(summary = "Complete a session", description = "Marks a session as completed")
    public ResponseEntity<ApiResponse<SessionResponse>> completeSession(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam UUID sessionId) {
        log.info("Complete session request from user: {}", userId);
        SessionResponse response = sessionService.completeSession(sessionId, userId);
        return ResponseEntity.ok(ApiResponse.success("Session completed successfully", response));
    }

    // ============================================================
    // Reschedule & Cancel
    // ============================================================

    @PostMapping("/reschedule")
    @Operation(summary = "Reschedule a session", description = "Reschedule an existing session to a new time")
    public ResponseEntity<ApiResponse<SessionResponse>> rescheduleSession(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody RescheduleRequestDto request) {
        log.info("Reschedule session request from user: {}", userId);
        SessionResponse response = sessionService.rescheduleSession(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Session rescheduled successfully", response));
    }

    @PostMapping("/cancel")
    @Operation(summary = "Cancel a session", description = "Cancel an existing session")
    public ResponseEntity<ApiResponse<SessionResponse>> cancelSession(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody CancellationRequest request) {
        log.info("Cancel session request from user: {}", userId);
        SessionResponse response = sessionService.cancelSession(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Session cancelled successfully", response));
    }

    // ============================================================
    // Queries
    // ============================================================

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming sessions", description = "Returns paginated list of upcoming sessions for the authenticated user")
    public ResponseEntity<ApiResponse<PageResponse<SessionResponse>>> getUpcomingSessions(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<SessionResponse> response = sessionService.getUpcomingSessions(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/history")
    @Operation(summary = "Get session history", description = "Returns paginated session history for the authenticated user")
    public ResponseEntity<ApiResponse<PageResponse<SessionResponse>>> getSessionHistory(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<SessionResponse> response = sessionService.getSessionHistory(userId, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/search")
    @Operation(summary = "Search sessions", description = "Advanced search for sessions with filters")
    public ResponseEntity<ApiResponse<PageResponse<SessionResponse>>> searchSessions(
            @Valid SearchRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<SessionResponse> response = sessionService.searchSessions(request, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ============================================================
    // Attendance
    // ============================================================

    @PostMapping("/attendance")
    @Operation(summary = "Mark attendance", description = "Mark attendance for a session participant")
    public ResponseEntity<ApiResponse<AttendanceResponse>> markAttendance(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody AttendanceRequest request) {
        log.info("Mark attendance request from user: {}", userId);
        AttendanceResponse response = sessionService.markAttendance(request, userId);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully", response));
    }

    @GetMapping("/attendance")
    @Operation(summary = "Get attendance", description = "Get attendance record for a session and user")
    public ResponseEntity<ApiResponse<AttendanceResponse>> getAttendance(
            @RequestParam UUID sessionId,
            @RequestParam UUID userId) {
        AttendanceResponse response = sessionService.getAttendance(sessionId, userId);
        if (response == null) {
            return ResponseEntity.ok(ApiResponse.success("No attendance record found", null));
        }
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ============================================================
    // Meeting
    // ============================================================

    @GetMapping("/{id}/meeting")
    @Operation(summary = "Get meeting link", description = "Returns the meeting link for a session after verifying the caller belongs to the session and the join window is open")
    public ResponseEntity<ApiResponse<MeetingResponse>> getMeetingLink(
            @PathVariable UUID id,
            @RequestHeader("X-User-ID") UUID userId) {
        MeetingResponse response = sessionService.getMeetingLink(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
