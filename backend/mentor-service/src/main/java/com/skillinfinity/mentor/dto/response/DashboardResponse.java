package com.skillinfinity.mentor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardResponse {

    private MentorProfileResponse profile;
    private MentorStatisticsResponse statistics;
    private MentorPreferenceResponse preferences;
    private int upcomingSessions;
    private int pendingRequests;
    private List<AvailabilityResponse> availabilitySummary;
    private List<String> missingProfileFields;
}
