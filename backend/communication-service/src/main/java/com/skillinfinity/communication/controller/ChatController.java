package com.skillinfinity.communication.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.communication.dto.request.CreateConversationRequest;
import com.skillinfinity.communication.dto.request.MessageRequest;
import com.skillinfinity.communication.dto.response.ConversationResponse;
import com.skillinfinity.communication.dto.response.MessageResponse;
import com.skillinfinity.communication.dto.response.UnreadCountResponse;
import com.skillinfinity.communication.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Real-time chat, messaging, and conversation management")
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    @Operation(summary = "Create conversation", description = "Creates a new chat conversation")
    public ResponseEntity<ApiResponse<ConversationResponse>> createConversation(
            @Valid @RequestBody CreateConversationRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        ConversationResponse response = chatService.createConversation(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Conversation created", response));
    }

    @GetMapping
    @Operation(summary = "Get conversations", description = "Returns paginated list of user's conversations")
    public ResponseEntity<ApiResponse<PageResponse<ConversationResponse>>> getConversations(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = extractUserId(principal);
        Page<ConversationResponse> conversations = chatService.getConversations(userId, page, size);
        PageResponse<ConversationResponse> pageResponse = PageResponse.of(
                conversations.getContent(), conversations.getNumber(),
                conversations.getSize(), conversations.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get conversation", description = "Returns conversation details by ID")
    public ResponseEntity<ApiResponse<ConversationResponse>> getConversation(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        ConversationResponse response = chatService.getConversation(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/message")
    @Operation(summary = "Send message", description = "Sends a message in a conversation")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @Valid @RequestBody MessageRequest request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        MessageResponse response = chatService.sendMessage(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Message sent", response));
    }

    @PutMapping("/message/{id}")
    @Operation(summary = "Edit message", description = "Edits an existing message")
    public ResponseEntity<ApiResponse<MessageResponse>> editMessage(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        String newContent = request.get("content");
        MessageResponse response = chatService.editMessage(id, newContent, userId);
        return ResponseEntity.ok(ApiResponse.success("Message updated", response));
    }

    @DeleteMapping("/message/{id}")
    @Operation(summary = "Delete message", description = "Deletes a message")
    public ResponseEntity<ApiResponse<Void>> deleteMessage(
            @PathVariable UUID id,
            Principal principal) {
        UUID userId = extractUserId(principal);
        chatService.deleteMessage(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Message deleted", null));
    }

    @GetMapping("/search")
    @Operation(summary = "Search messages", description = "Searches messages by content")
    public ResponseEntity<ApiResponse<PageResponse<MessageResponse>>> searchMessages(
            @RequestParam(required = false) UUID conversationId,
            @RequestParam String query,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = extractUserId(principal);
        Page<MessageResponse> messages = chatService.searchMessages(conversationId, userId, query, page, size);
        PageResponse<MessageResponse> pageResponse = PageResponse.of(
                messages.getContent(), messages.getNumber(),
                messages.getSize(), messages.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @GetMapping("/history")
    @Operation(summary = "Get message history", description = "Returns paginated message history for a conversation")
    public ResponseEntity<ApiResponse<PageResponse<MessageResponse>>> getMessageHistory(
            @RequestParam UUID conversationId,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        UUID userId = extractUserId(principal);
        Page<MessageResponse> messages = chatService.getMessageHistory(conversationId, userId, page, size);
        PageResponse<MessageResponse> pageResponse = PageResponse.of(
                messages.getContent(), messages.getNumber(),
                messages.getSize(), messages.getTotalElements());
        return ResponseEntity.ok(ApiResponse.success(pageResponse));
    }

    @PostMapping("/read/{conversationId}")
    @Operation(summary = "Mark as read", description = "Marks messages as read in a conversation")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable UUID conversationId,
            Principal principal) {
        UUID userId = extractUserId(principal);
        chatService.markMessagesAsRead(conversationId, userId);
        return ResponseEntity.ok(ApiResponse.success("Messages marked as read", null));
    }

    @PostMapping("/pin/{messageId}")
    @Operation(summary = "Toggle pin message", description = "Pins or unpins a message")
    public ResponseEntity<ApiResponse<Void>> togglePinMessage(
            @PathVariable UUID messageId,
            Principal principal) {
        UUID userId = extractUserId(principal);
        chatService.togglePinMessage(messageId, userId);
        return ResponseEntity.ok(ApiResponse.success("Message pin toggled", null));
    }

    @GetMapping("/pinned/{conversationId}")
    @Operation(summary = "Get pinned messages", description = "Returns pinned messages in a conversation")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getPinnedMessages(
            @PathVariable UUID conversationId,
            Principal principal) {
        UUID userId = extractUserId(principal);
        List<MessageResponse> messages = chatService.getPinnedMessages(conversationId, userId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }

    @PostMapping("/reaction/{messageId}")
    @Operation(summary = "Add reaction", description = "Adds a reaction emoji to a message")
    public ResponseEntity<ApiResponse<Void>> addReaction(
            @PathVariable UUID messageId,
            @RequestBody Map<String, String> request,
            Principal principal) {
        UUID userId = extractUserId(principal);
        chatService.addReaction(messageId, userId, request.get("emoji"));
        return ResponseEntity.ok(ApiResponse.success("Reaction added", null));
    }

    @DeleteMapping("/reaction/{messageId}")
    @Operation(summary = "Remove reaction", description = "Removes a reaction from a message")
    public ResponseEntity<ApiResponse<Void>> removeReaction(
            @PathVariable UUID messageId,
            @RequestParam String emoji,
            Principal principal) {
        UUID userId = extractUserId(principal);
        chatService.removeReaction(messageId, userId, emoji);
        return ResponseEntity.ok(ApiResponse.success("Reaction removed", null));
    }

    @GetMapping("/unread/{conversationId}")
    @Operation(summary = "Get unread count", description = "Returns unread message count for a conversation")
    public ResponseEntity<ApiResponse<UnreadCountResponse>> getUnreadCount(
            @PathVariable UUID conversationId,
            Principal principal) {
        UUID userId = extractUserId(principal);
        long count = chatService.getUnreadCount(conversationId, userId);
        return ResponseEntity.ok(ApiResponse.success(
                UnreadCountResponse.builder()
                        .chatRoomId(conversationId)
                        .unreadCount(count)
                        .build()));
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
