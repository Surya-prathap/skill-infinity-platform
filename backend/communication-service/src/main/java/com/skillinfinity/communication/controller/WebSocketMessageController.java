package com.skillinfinity.communication.controller;

import com.skillinfinity.communication.dto.request.MessageRequest;
import com.skillinfinity.communication.dto.response.MessageResponse;
import com.skillinfinity.communication.dto.response.PresenceResponse;
import com.skillinfinity.communication.service.ChatService;
import com.skillinfinity.communication.service.PresenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Controller
@RequiredArgsConstructor
public class WebSocketMessageController {

    private final ChatService chatService;
    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/chat")
    public MessageResponse sendMessage(@Payload MessageRequest request, Principal principal) {
        UUID userId = extractUserId(principal);
        log.debug("WebSocket send message by user: {}", userId);
        return chatService.sendMessage(request, userId);
    }

    @MessageMapping("/chat.typing")
    public void typingIndicator(@Payload Map<String, Object> payload, Principal principal) {
        UUID userId = extractUserId(principal);
        UUID chatRoomId = UUID.fromString(payload.get("chatRoomId").toString());
        boolean isTyping = Boolean.TRUE.equals(payload.get("typing"));

        log.debug("Typing indicator - user: {} room: {} typing: {}", userId, chatRoomId, isTyping);

        messagingTemplate.convertAndSend("/topic/chat." + chatRoomId + ".typing", Map.of(
                "userId", userId.toString(),
                "typing", isTyping,
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @MessageMapping("/chat.markRead")
    public void markAsRead(@Payload Map<String, Object> payload, Principal principal) {
        UUID userId = extractUserId(principal);
        UUID chatRoomId = UUID.fromString(payload.get("chatRoomId").toString());

        chatService.markMessagesAsRead(chatRoomId, userId);

        messagingTemplate.convertAndSend("/topic/chat." + chatRoomId + ".read", Map.of(
                "userId", userId.toString(),
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    @MessageMapping("/presence.online")
    @SendTo("/topic/presence")
    public PresenceResponse userOnline(Principal principal, SimpMessageHeaderAccessor headerAccessor) {
        UUID userId = extractUserId(principal);
        String sessionId = headerAccessor.getSessionId();
        presenceService.userConnected(userId, sessionId);
        return presenceService.getUserPresence(userId);
    }

    @MessageMapping("/presence.offline")
    @SendTo("/topic/presence")
    public PresenceResponse userOffline(Principal principal) {
        UUID userId = extractUserId(principal);
        presenceService.userDisconnected(userId);
        return presenceService.getUserPresence(userId);
    }

    private UUID extractUserId(Principal principal) {
        if (principal == null) {
            return UUID.randomUUID();
        }
        try {
            return UUID.fromString(principal.getName());
        } catch (IllegalArgumentException e) {
            return UUID.randomUUID();
        }
    }
}
