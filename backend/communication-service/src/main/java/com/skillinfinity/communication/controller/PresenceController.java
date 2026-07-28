package com.skillinfinity.communication.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.communication.dto.response.PresenceResponse;
import com.skillinfinity.communication.service.PresenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/presence")
@RequiredArgsConstructor
@Tag(name = "Presence", description = "User presence and online status management")
public class PresenceController {

    private final PresenceService presenceService;

    @GetMapping("/{userId}")
    @Operation(summary = "Get user presence", description = "Returns presence status for a user")
    public ResponseEntity<ApiResponse<PresenceResponse>> getUserPresence(@PathVariable UUID userId) {
        PresenceResponse response = presenceService.getUserPresence(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/online")
    @Operation(summary = "Get online users", description = "Returns list of currently online users")
    public ResponseEntity<ApiResponse<List<PresenceResponse>>> getOnlineUsers() {
        List<PresenceResponse> onlineUsers = presenceService.getOnlineUsers();
        return ResponseEntity.ok(ApiResponse.success(onlineUsers));
    }

    @PostMapping("/batch")
    @Operation(summary = "Get users presence", description = "Returns presence status for multiple users")
    public ResponseEntity<ApiResponse<List<PresenceResponse>>> getUsersPresence(@RequestBody Map<String, List<UUID>> request) {
        List<UUID> userIds = request.get("userIds");
        List<PresenceResponse> responses = presenceService.getUsersPresence(userIds);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
