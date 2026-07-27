package com.skillinfinity.session.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Calendar response with session events")
public class CalendarResponse {

    @Schema(description = "Calendar events")
    private List<CalendarEventResponse> events;

    @Schema(description = "ICS file content for export")
    private String icsContent;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Calendar event response")
    public static class CalendarEventResponse {

        @Schema(description = "Event ID")
        private UUID id;

        @Schema(description = "Session ID")
        private UUID sessionId;

        @Schema(description = "Event title")
        private String title;

        @Schema(description = "Event description")
        private String description;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "Start time")
        private LocalDateTime startTime;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "End time")
        private LocalDateTime endTime;

        @Schema(description = "Timezone")
        private String timezone;

        @Schema(description = "Location/URL")
        private String location;

        @Schema(description = "Provider")
        private String provider;
    }
}
