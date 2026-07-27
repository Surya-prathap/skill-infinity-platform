package com.skillinfinity.session.mapper;

import com.skillinfinity.session.dto.request.SessionRequest;
import com.skillinfinity.session.dto.response.AttendanceResponse;
import com.skillinfinity.session.dto.response.BookingResponse;
import com.skillinfinity.session.dto.response.MeetingResponse;
import com.skillinfinity.session.dto.response.SessionResponse;
import com.skillinfinity.session.entity.Attendance;
import com.skillinfinity.session.entity.Booking;
import com.skillinfinity.session.entity.MeetingLink;
import com.skillinfinity.session.entity.Session;
import com.skillinfinity.session.enumeration.AttendanceStatus;
import com.skillinfinity.session.enumeration.BookingStatus;
import com.skillinfinity.session.enumeration.MeetingProvider;
import com.skillinfinity.session.enumeration.SessionStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class SessionMapperTest {

    private SessionMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = Mappers.getMapper(SessionMapper.class);
    }

    @Test
    void shouldMapSessionRequestToEntity() {
        SessionRequest request = SessionRequest.builder()
                .title("Java Spring Boot Session")
                .description("A comprehensive session")
                .mentorId(UUID.randomUUID())
                .learnerId(UUID.randomUUID())
                .mentorName("John Doe")
                .learnerName("Jane Smith")
                .startTime(LocalDateTime.now().plusDays(1))
                .endTime(LocalDateTime.now().plusDays(1).plusHours(1))
                .durationMinutes(60)
                .timezone("America/New_York")
                .topic("Java Programming")
                .category("Technology")
                .price(99.99)
                .currency("USD")
                .free(false)
                .build();

        Session session = mapper.toEntity(request);

        assertNotNull(session);
        assertNull(session.getId());
        assertEquals("Java Spring Boot Session", session.getTitle());
        assertEquals("A comprehensive session", session.getDescription());
        assertEquals(request.getMentorId(), session.getMentorId());
        assertEquals(request.getLearnerId(), session.getLearnerId());
        assertEquals("John Doe", session.getMentorName());
        assertEquals("Jane Smith", session.getLearnerName());
        assertEquals(request.getStartTime(), session.getStartTime());
        assertEquals(request.getEndTime(), session.getEndTime());
        assertEquals(60, session.getDurationMinutes());
        assertEquals("America/New_York", session.getTimezone());
        assertEquals(SessionStatus.SCHEDULED, session.getStatus());
        assertEquals("Java Programming", session.getTopic());
        assertEquals("Technology", session.getCategory());
        assertEquals(99.99, session.getPrice());
        assertEquals("USD", session.getCurrency());
        assertFalse(session.isFree());
        assertEquals(0, session.getRescheduleCount());
    }

    @Test
    void shouldMapSessionToResponse() {
        UUID id = UUID.randomUUID();
        UUID mentorId = UUID.randomUUID();
        UUID learnerId = UUID.randomUUID();
        LocalDateTime now = LocalDateTime.now();

        Session session = Session.builder()
                .id(id)
                .title("Test Session")
                .description("Test Description")
                .mentorId(mentorId)
                .learnerId(learnerId)
                .mentorName("Mentor")
                .learnerName("Learner")
                .startTime(now.plusDays(1))
                .endTime(now.plusDays(1).plusHours(1))
                .durationMinutes(60)
                .timezone("UTC")
                .status(SessionStatus.SCHEDULED)
                .topic("Testing")
                .price(0)
                .currency("USD")
                .free(true)
                .rescheduleCount(0)
                .build();

        SessionResponse response = mapper.toResponse(session);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("Test Session", response.getTitle());
        assertEquals("Test Description", response.getDescription());
        assertEquals(mentorId, response.getMentorId());
        assertEquals(learnerId, response.getLearnerId());
        assertEquals(SessionStatus.SCHEDULED, response.getStatus());
        assertTrue(response.isFree());
    }

    @Test
    void shouldMapBookingToResponse() {
        UUID id = UUID.randomUUID();
        UUID mentorId = UUID.randomUUID();
        UUID learnerId = UUID.randomUUID();

        Booking booking = Booking.builder()
                .id(id)
                .mentorId(mentorId)
                .learnerId(learnerId)
                .mentorName("Mentor")
                .learnerName("Learner")
                .topic("Java")
                .durationMinutes(60)
                .status(BookingStatus.PENDING)
                .preferredDate(LocalDateTime.now().plusDays(1))
                .build();

        BookingResponse response = mapper.toBookingResponse(booking);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals(mentorId, response.getMentorId());
        assertEquals(learnerId, response.getLearnerId());
        assertEquals("Mentor", response.getMentorName());
        assertEquals("Learner", response.getLearnerName());
        assertEquals("Java", response.getTopic());
        assertEquals(BookingStatus.PENDING, response.getStatus());
        assertEquals(60, response.getDurationMinutes());
    }

    @Test
    void shouldMapMeetingLinkToResponse() {
        UUID id = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();

        MeetingLink meetingLink = MeetingLink.builder()
                .id(id)
                .sessionId(sessionId)
                .provider(MeetingProvider.CUSTOM)
                .meetingId("meeting-123")
                .meetingUrl("https://meet.skillinfinity.com/" + sessionId)
                .joinUrl("https://meet.skillinfinity.com/join/" + sessionId)
                .password("pass123")
                .active(true)
                .build();

        MeetingResponse response = mapper.toMeetingResponse(meetingLink);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals(MeetingProvider.CUSTOM, response.getProvider());
        assertEquals("meeting-123", response.getMeetingId());
        assertEquals("https://meet.skillinfinity.com/" + sessionId, response.getMeetingUrl());
        assertTrue(response.isActive());
    }

    @Test
    void shouldMapAttendanceToResponse() {
        UUID id = UUID.randomUUID();
        UUID sessionId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Attendance attendance = Attendance.builder()
                .id(id)
                .sessionId(sessionId)
                .userId(userId)
                .userName("John Doe")
                .role("LEARNER")
                .status(AttendanceStatus.PRESENT)
                .late(false)
                .build();

        AttendanceResponse response = mapper.toAttendanceResponse(attendance);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals(sessionId, response.getSessionId());
        assertEquals(userId, response.getUserId());
        assertEquals("John Doe", response.getUserName());
        assertEquals("LEARNER", response.getRole());
        assertEquals(AttendanceStatus.PRESENT, response.getStatus());
        assertFalse(response.isLate());
    }

    @Test
    void shouldReturnNullWhenSessionIsNull() {
        assertNull(mapper.toResponse((Session) null));
    }

    @Test
    void shouldReturnNullWhenBookingIsNull() {
        assertNull(mapper.toBookingResponse(null));
    }

    @Test
    void shouldReturnNullWhenMeetingLinkIsNull() {
        assertNull(mapper.toMeetingResponse(null));
    }

    @Test
    void shouldReturnNullWhenAttendanceIsNull() {
        assertNull(mapper.toAttendanceResponse(null));
    }
}
