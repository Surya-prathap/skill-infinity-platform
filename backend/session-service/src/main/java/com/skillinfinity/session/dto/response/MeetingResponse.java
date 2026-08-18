package com.skillinfinity.session.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.skillinfinity.session.enumeration.MeetingProvider;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Meeting link response")
public class MeetingResponse {

    @Schema(description = "Meeting link ID")
    private UUID id;

    @Schema(description = "Meeting provider")
    private MeetingProvider provider;

    @Schema(description = "Meeting ID")
    private String meetingId;

    @Schema(description = "Meeting URL")
    private String meetingUrl;

    @Schema(description = "Join URL")
    private String joinUrl;

    @Schema(description = "Start URL")
    private String startUrl;

    @Schema(description = "Meeting password")
    private String password;

    @Schema(description = "Whether the meeting link is active")
    private boolean active;
}
