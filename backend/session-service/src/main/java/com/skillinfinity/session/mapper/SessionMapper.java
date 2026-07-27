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
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SessionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "SCHEDULED")
    @Mapping(target = "free", source = "free", defaultValue = "false")
    @Mapping(target = "recordingUrl", ignore = true)
    @Mapping(target = "notes", ignore = true)
    @Mapping(target = "outcome", ignore = true)
    @Mapping(target = "rating", ignore = true)
    @Mapping(target = "feedback", ignore = true)
    @Mapping(target = "cancellationReason", ignore = true)
    @Mapping(target = "cancelledBy", ignore = true)
    @Mapping(target = "cancelledAt", ignore = true)
    @Mapping(target = "completedAt", ignore = true)
    @Mapping(target = "startedAt", ignore = true)
    @Mapping(target = "endedAt", ignore = true)
    @Mapping(target = "bookingId", ignore = true)
    @Mapping(target = "rescheduleCount", constant = "0")
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Session toEntity(SessionRequest request);

    @Mapping(target = "free", source = "free")
    SessionResponse toResponse(Session session);

    BookingResponse toBookingResponse(Booking booking);

    @Mapping(target = "active", source = "active")
    MeetingResponse toMeetingResponse(MeetingLink meetingLink);

    @Mapping(target = "late", source = "late")
    AttendanceResponse toAttendanceResponse(Attendance attendance);
}
