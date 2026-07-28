package com.skillinfinity.communication.service.impl;

import com.skillinfinity.communication.dto.response.PresenceResponse;
import com.skillinfinity.communication.entity.Presence;
import com.skillinfinity.communication.enumeration.PresenceStatus;
import com.skillinfinity.communication.mapper.CommunicationMapper;
import com.skillinfinity.communication.repository.PresenceRepository;
import com.skillinfinity.communication.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PresenceServiceImpl implements PresenceService {

    private final PresenceRepository presenceRepository;
    private final CommunicationMapper mapper;

    @Override
    public void userConnected(UUID userId, String sessionId) {
        log.debug("User connected: {}", userId);
        Optional<Presence> existing = presenceRepository.findByUserId(userId);

        Presence presence;
        if (existing.isPresent()) {
            presence = existing.get();
            presence.setOnline(true);
            presence.setStatus(PresenceStatus.ONLINE);
            presence.setLastSeenAt(LocalDateTime.now());
            presence.setSessionId(sessionId);
        } else {
            presence = Presence.builder()
                    .id(UUID.randomUUID())
                    .userId(userId)
                    .status(PresenceStatus.ONLINE)
                    .online(true)
                    .lastSeenAt(LocalDateTime.now())
                    .sessionId(sessionId)
                    .build();
        }

        presenceRepository.save(presence);
    }

    @Override
    public void userDisconnected(UUID userId) {
        log.debug("User disconnected: {}", userId);
        presenceRepository.findByUserId(userId).ifPresent(presence -> {
            presence.setOnline(false);
            presence.setStatus(PresenceStatus.OFFLINE);
            presence.setLastSeenAt(LocalDateTime.now());
            presence.setSessionId(null);
            presenceRepository.save(presence);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public PresenceResponse getUserPresence(UUID userId) {
        return presenceRepository.findByUserId(userId)
                .map(mapper::toPresenceResponse)
                .orElseGet(() -> PresenceResponse.builder()
                        .userId(userId)
                        .status("OFFLINE")
                        .online(false)
                        .build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PresenceResponse> getOnlineUsers() {
        return presenceRepository.findByOnlineTrue()
                .stream()
                .map(mapper::toPresenceResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<PresenceResponse> getUsersPresence(List<UUID> userIds) {
        return presenceRepository.findByUserIdIn(userIds)
                .stream()
                .map(mapper::toPresenceResponse)
                .toList();
    }
}
