package com.skillinfinity.communication.service;

import com.skillinfinity.communication.dto.request.CreateConversationRequest;
import com.skillinfinity.communication.dto.request.MessageRequest;
import com.skillinfinity.communication.dto.response.ConversationResponse;
import com.skillinfinity.communication.dto.response.MessageResponse;
import com.skillinfinity.communication.entity.Message;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface ChatService {

    ConversationResponse createConversation(CreateConversationRequest request, UUID currentUserId);

    Page<ConversationResponse> getConversations(UUID userId, int page, int size);

    ConversationResponse getConversation(UUID conversationId, UUID userId);

    MessageResponse sendMessage(MessageRequest request, UUID senderId);

    MessageResponse editMessage(UUID messageId, String newContent, UUID userId);

    void deleteMessage(UUID messageId, UUID userId);

    Page<MessageResponse> getMessageHistory(UUID conversationId, UUID userId, int page, int size);

    Page<MessageResponse> searchMessages(UUID conversationId, UUID userId, String query, int page, int size);

    void markMessagesAsRead(UUID conversationId, UUID userId);

    void togglePinMessage(UUID messageId, UUID userId);

    List<MessageResponse> getPinnedMessages(UUID conversationId, UUID userId);

    void addReaction(UUID messageId, UUID userId, String emoji);

    void removeReaction(UUID messageId, UUID userId, String emoji);

    long getUnreadCount(UUID conversationId, UUID userId);
}
