package com.skillinfinity.communication.service;

import com.skillinfinity.communication.dto.response.PresenceResponse;

import java.util.List;
import java.util.UUID;

public interface PresenceService {

    void userConnected(UUID userId, String sessionId);

    void userDisconnected(UUID userId);

    PresenceResponse getUserPresence(UUID userId);

    List<PresenceResponse> getOnlineUsers();

    List<PresenceResponse> getUsersPresence(List<UUID> userIds);
}
