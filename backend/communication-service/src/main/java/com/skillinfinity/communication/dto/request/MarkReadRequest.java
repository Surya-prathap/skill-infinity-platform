package com.skillinfinity.communication.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Request to mark notifications as read")
public class MarkReadRequest {

    @Schema(description = "List of notification IDs to mark as read. If empty, marks all as read.")
    private List<UUID> notificationIds;
}
