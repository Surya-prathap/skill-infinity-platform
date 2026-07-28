package com.skillinfinity.communication.service;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ForbiddenException;
import com.skillinfinity.communication.dto.request.CreateConversationRequest;
import com.skillinfinity.communication.dto.request.MessageRequest;
import com.skillinfinity.communication.dto.response.ConversationResponse;
import com.skillinfinity.communication.dto.response.MessageResponse;
import com.skillinfinity.communication.entity.ChatParticipant;
import com.skillinfinity.communication.entity.ChatRoom;
import com.skillinfinity.communication.entity.Message;
import com.skillinfinity.communication.enumeration.ConversationType;
import com.skillinfinity.communication.enumeration.MessageStatus;
import com.skillinfinity.communication.enumeration.MessageType;
import com.skillinfinity.communication.exception.ConversationNotFoundException;
import com.skillinfinity.communication.exception.MessageNotFoundException;
import com.skillinfinity.communication.mapper.CommunicationMapper;
import com.skillinfinity.communication.repository.ChatParticipantRepository;
import com.skillinfinity.communication.repository.ChatRoomRepository;
import com.skillinfinity.communication.repository.MessageReactionRepository;
import com.skillinfinity.communication.repository.MessageRepository;
import com.skillinfinity.communication.repository.MessageStatusRepository;
import com.skillinfinity.communication.service.impl.ChatServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatRoomRepository chatRoomRepository;
    @Mock
    private ChatParticipantRepository chatParticipantRepository;
    @Mock
    private MessageRepository messageRepository;
    @Mock
    private MessageStatusRepository messageStatusRepository;
    @Mock
    private MessageReactionRepository messageReactionRepository;
    @Mock
    private CommunicationMapper mapper;

    private ChatService chatService;
    private UUID userId;
    private UUID chatRoomId;
    private ChatRoom chatRoom;
    private Message message;
    private ChatParticipant participant;

    @BeforeEach
    void setUp() {
        chatService = new ChatServiceImpl(chatRoomRepository, chatParticipantRepository,
                messageRepository, messageStatusRepository, messageReactionRepository, mapper);

        userId = UUID.randomUUID();
        chatRoomId = UUID.randomUUID();

        chatRoom = ChatRoom.builder()
                .id(chatRoomId)
                .conversationType(ConversationType.PRIVATE_CHAT)
                .active(true)
                .build();

        message = Message.builder()
                .id(UUID.randomUUID())
                .chatRoom(chatRoom)
                .senderId(userId)
                .content("Test message")
                .messageType(MessageType.TEXT)
                .status(MessageStatus.SENT)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        participant = ChatParticipant.builder()
                .id(UUID.randomUUID())
                .chatRoom(chatRoom)
                .userId(userId)
                .admin(true)
                .active(true)
                .build();
    }

    @Test
    void createConversation_ShouldCreateNewConversation() {
        CreateConversationRequest request = CreateConversationRequest.builder()
                .conversationType("PRIVATE_CHAT")
                .participantIds(Set.of(UUID.randomUUID()))
                .build();

        ChatRoom savedRoom = ChatRoom.builder()
                .id(chatRoomId)
                .conversationType(ConversationType.PRIVATE_CHAT)
                .participantCount(2)
                .active(true)
                .build();

        when(chatRoomRepository.findAllByUserId(any())).thenReturn(List.of());
        when(chatRoomRepository.save(any(ChatRoom.class))).thenReturn(savedRoom);
        when(chatParticipantRepository.saveAll(anyList())).thenReturn(List.of(participant));
        when(mapper.toConversationResponse(any(ChatRoom.class))).thenReturn(
                ConversationResponse.builder().id(chatRoomId).build());

        ConversationResponse response = chatService.createConversation(request, userId);

        assertNotNull(response);
        assertEquals(chatRoomId, response.getId());
        verify(chatRoomRepository, times(2)).save(any(ChatRoom.class));
    }

    @Test
    void getConversation_ShouldThrowException_WhenNotParticipant() {
        when(chatRoomRepository.findById(chatRoomId)).thenReturn(Optional.of(chatRoom));
        when(chatParticipantRepository.existsByChatRoomIdAndUserIdAndActiveTrue(chatRoomId, userId))
                .thenReturn(false);

        assertThrows(ForbiddenException.class, () -> chatService.getConversation(chatRoomId, userId));
    }

    @Test
    void getConversation_ShouldThrowException_WhenNotFound() {
        when(chatRoomRepository.findById(chatRoomId)).thenReturn(Optional.empty());

        assertThrows(ConversationNotFoundException.class, () -> chatService.getConversation(chatRoomId, userId));
    }

    @Test
    void sendMessage_ShouldCreateMessage() {
        MessageRequest request = MessageRequest.builder()
                .chatRoomId(chatRoomId)
                .content("Hello!")
                .build();

        when(chatRoomRepository.findById(chatRoomId)).thenReturn(Optional.of(chatRoom));
        when(chatParticipantRepository.existsByChatRoomIdAndUserIdAndActiveTrue(chatRoomId, userId))
                .thenReturn(true);
        when(chatParticipantRepository.findActiveUserIdsByChatRoomId(chatRoomId))
                .thenReturn(List.of(userId, UUID.randomUUID()));
        when(messageRepository.save(any(Message.class))).thenReturn(message);
        when(chatRoomRepository.save(any(ChatRoom.class))).thenReturn(chatRoom);
        when(mapper.toMessageResponse(any(Message.class))).thenReturn(
                MessageResponse.builder().id(message.getId()).content("Hello!").build());

        MessageResponse response = chatService.sendMessage(request, userId);

        assertNotNull(response);
        assertEquals(message.getId(), response.getId());
        verify(messageRepository).save(any(Message.class));
    }

    @Test
    void sendMessage_ShouldThrowException_WhenContentAndAttachmentsEmpty() {
        MessageRequest request = MessageRequest.builder()
                .chatRoomId(chatRoomId)
                .build();

        when(chatRoomRepository.findById(chatRoomId)).thenReturn(Optional.of(chatRoom));
        when(chatParticipantRepository.existsByChatRoomIdAndUserIdAndActiveTrue(chatRoomId, userId))
                .thenReturn(true);

        assertThrows(BadRequestException.class, () -> chatService.sendMessage(request, userId));
    }

    @Test
    void editMessage_ShouldEditOwnMessage() {
        when(messageRepository.findById(message.getId())).thenReturn(Optional.of(message));
        when(messageRepository.save(any(Message.class))).thenReturn(message);
        when(mapper.toMessageResponse(any(Message.class))).thenReturn(
                MessageResponse.builder().id(message.getId()).content("Updated").build());

        MessageResponse response = chatService.editMessage(message.getId(), "Updated", userId);

        assertNotNull(response);
        verify(messageRepository).save(any(Message.class));
    }

    @Test
    void editMessage_ShouldThrowException_WhenNotOwner() {
        UUID otherUserId = UUID.randomUUID();
        when(messageRepository.findById(message.getId())).thenReturn(Optional.of(message));

        assertThrows(ForbiddenException.class, () -> chatService.editMessage(message.getId(), "Updated", otherUserId));
    }

    @Test
    void deleteMessage_ShouldSoftDelete() {
        when(messageRepository.findById(message.getId())).thenReturn(Optional.of(message));
        when(chatParticipantRepository.existsByChatRoomIdAndUserIdAndActiveTrue(chatRoomId, userId))
                .thenReturn(true);

        chatService.deleteMessage(message.getId(), userId);

        assertFalse(message.isActive());
        assertNotNull(message.getDeletedAt());
        verify(messageRepository).save(message);
    }

    @Test
    void searchMessages_ShouldReturnResults() {
        UUID conversationId = chatRoomId;
        String query = "test";
        Page<Message> messagePage = new PageImpl<>(List.of(message));

        when(chatRoomRepository.findById(conversationId)).thenReturn(Optional.of(chatRoom));
        when(chatParticipantRepository.existsByChatRoomIdAndUserIdAndActiveTrue(conversationId, userId))
                .thenReturn(true);
        when(messageRepository.searchMessages(eq(conversationId), eq(query), any(PageRequest.class)))
                .thenReturn(messagePage);
        when(mapper.toMessageResponse(any(Message.class))).thenReturn(
                MessageResponse.builder().id(message.getId()).build());

        Page<MessageResponse> results = chatService.searchMessages(conversationId, userId, query, 0, 20);

        assertNotNull(results);
        assertEquals(1, results.getTotalElements());
    }

    @Test
    void getUnreadCount_ShouldReturnCount() {
        when(messageStatusRepository.countUnreadByChatRoomIdAndUserId(chatRoomId, userId))
                .thenReturn(5L);

        long count = chatService.getUnreadCount(chatRoomId, userId);

        assertEquals(5L, count);
    }

    @Test
    void markMessagesAsRead_ShouldUpdateStatus() {
        when(chatParticipantRepository.findByChatRoomIdAndUserIdAndActiveTrue(chatRoomId, userId))
                .thenReturn(Optional.of(participant));

        chatService.markMessagesAsRead(chatRoomId, userId);

        verify(messageStatusRepository).markMessagesAsRead(eq(chatRoomId), eq(userId), any());
        verify(chatParticipantRepository).save(any(ChatParticipant.class));
    }
}
