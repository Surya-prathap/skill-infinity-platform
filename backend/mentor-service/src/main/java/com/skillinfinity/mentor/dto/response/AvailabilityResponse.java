package com.skillinfinity.mentor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AvailabilityResponse {

    private UUID id;
    private String dayOfWeek;
    private String startTime;
    private String endTime;
    private String breakStartTime;
    private String breakEndTime;
    private Integer slotDurationMinutes;
    private boolean recurring;
    private String specificDate;
    private boolean active;
    private String timezone;
    private List<TimeSlotResponse> timeSlots;
}
