package com.skillinfinity.communication.service.impl;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ForbiddenException;
import com.skillinfinity.communication.dto.request.AttachmentRequest;
import com.skillinfinity.communication.dto.request.CreateConversationRequest;
import com.skillinfinity.communication.dto.request.MessageRequest;
import com.skillinfinity.communication.dto.response.ConversationResponse;
import com.skillinfinity.communication.dto.response.MessageResponse;
import com.skillinfinity.communication.entity.ChatParticipant;
import com.skillinfinity.communication.entity.ChatRoom;
import com.skillinfinity.communication.entity.Message;
import com.skillinfinity.communication.entity.MessageAttachment;
import com.skillinfinity.communication.entity.MessageReaction;
import com.skillinfinity.communication.entity.MessageStatusEntity;
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
import com.skillinfinity.communication.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ChatServiceImpl implements ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final MessageRepository messageRepository;
    private final MessageStatusRepository messageStatusRepository;
    private final MessageReactionRepository messageReactionRepository;
    private final CommunicationMapper mapper;

    @Override
    public ConversationResponse createConversation(CreateConversationRequest request, UUID currentUserId) {
        log.info("Creating conversation of type: {} by user: {}", request.getConversationType(), currentUserId);

        ConversationType type;
        try {
            type = ConversationType.valueOf(request.getConversationType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid conversation type: " + request.getConversationType());
        }

        // Check for existing private chat
        if (type == ConversationType.PRIVATE_CHAT && request.getParticipantIds().size() == 1) {
            UUID otherUserId = request.getParticipantIds().iterator().next();
            Set<UUID> bothIds = new HashSet<>(Set.of(currentUserId, otherUserId));
            if (bothIds.size() == 2) {
                var existingRooms = chatRoomRepository.findAllByUserId(currentUserId);
                for (ChatRoom room : existingRooms) {
                    if (room.getConversationType() == ConversationType.PRIVATE_CHAT) {
                        var participants = chatParticipantRepository.findByChatRoomIdAndActiveTrue(room.getId());
                        Set<UUID> participantIds = new HashSet<>();
                        participants.forEach(p -> participantIds.add(p.getUserId()));
                        if (participantIds.equals(bothIds)) {
                            log.info("Existing private chat found: {}", room.getId());
                            ConversationResponse response = mapper.toConversationResponse(room);
                            response.setUnreadCount(getUnreadCount(room.getId(), currentUserId));
                            return response;
                        }
                    }
                }
            }
        }

        // Check for existing mentor-learner chat
        if (type == ConversationType.MENTOR_LEARNER && request.getMentorId() != null && request.getLearnerId() != null) {
            var existing = chatRoomRepository.findByMentorIdAndLearnerIdAndConversationTypeAndActiveTrue(
                    request.getMentorId(), request.getLearnerId(), ConversationType.MENTOR_LEARNER);
            if (existing.isPresent()) {
                ConversationResponse response = mapper.toConversationResponse(existing.get());
                response.setUnreadCount(getUnreadCount(existing.get().getId(), currentUserId));
                return response;
            }
        }

        // Create new conversation
        ChatRoom chatRoom = ChatRoom.builder()
                .id(UUID.randomUUID())
                .name(request.getName())
                .conversationType(type)
                .sessionId(request.getSessionId())
                .mentorId(request.getMentorId())
                .learnerId(request.getLearnerId())
                .build();

        chatRoom = chatRoomRepository.save(chatRoom);

        // Add participants
        Set<UUID> allParticipants = new HashSet<>(request.getParticipantIds());
        allParticipants.add(currentUserId);

        List<ChatParticipant> participants = new ArrayList<>();
        for (UUID participantId : allParticipants) {
            ChatParticipant participant = ChatParticipant.builder()
                    .id(UUID.randomUUID())
                    .chatRoom(chatRoom)
                    .userId(participantId)
                    .role("MEMBER")
                    .admin(participantId.equals(currentUserId))
                    .build();
            participants.add(participant);
        }
        chatParticipantRepository.saveAll(participants);
        chatRoom.setParticipants(participants);
        chatRoom.setParticipantCount(participants.size());

        chatRoomRepository.save(chatRoom);

        ConversationResponse response = mapper.toConversationResponse(chatRoom);
        response.setUnreadCount(0);
        log.info("Conversation created successfully: {}", chatRoom.getId());
        return response;
    }

    @Override
    @Cacheable(value = "recentConversations", key = "#userId + '_' + #page + '_' + #size")
    @Transactional(readOnly = true)
    public Page<ConversationResponse> getConversations(UUID userId, int page, int size) {
        log.debug("Fetching conversations for user: {}", userId);
        Pageable pageable = PageRequest.of(page, size);
        Page<ChatRoom> chatRooms = chatRoomRepository.findActiveChatRoomsByUserId(userId, pageable);
        return chatRooms.map(room -> {
            ConversationResponse response = mapper.toConversationResponse(room);
            response.setUnreadCount(getUnreadCount(room.getId(), userId));
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public ConversationResponse getConversation(UUID conversationId, UUID userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(conversationId)
                .orElseThrow(() -> new ConversationNotFoundException(conversationId.toString()));

        validateParticipant(chatRoom, userId);

        ConversationResponse response = mapper.toConversationResponse(chatRoom);
        response.setUnreadCount(getUnreadCount(chatRoom.getId(), userId));
        return response;
    }

    @Override
    @CacheEvict(value = {"recentConversations", "unreadCount"}, allEntries = true)
    public MessageResponse sendMessage(MessageRequest request, UUID senderId) {
        log.info("Sending message to chat room: {} by user: {}", request.getChatRoomId(), senderId);

        ChatRoom chatRoom = chatRoomRepository.findById(request.getChatRoomId())
                .orElseThrow(() -> new ConversationNotFoundException(request.getChatRoomId().toString()));

        validateParticipant(chatRoom, senderId);

        if ((request.getContent() == null || request.getContent().isBlank()) &&
                (request.getAttachments() == null || request.getAttachments().isEmpty())) {
            throw new BadRequestException("Message content or attachments are required");
        }

        MessageType messageType = MessageType.TEXT;
        if (request.getMessageType() != null) {
            try {
                messageType = MessageType.valueOf(request.getMessageType().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid message type: " + request.getMessageType());
            }
        }

        Message message = Message.builder()
                .id(UUID.randomUUID())
                .chatRoom(chatRoom)
                .senderId(senderId)
                .messageType(messageType)
                .content(request.getContent())
                .status(MessageStatus.SENT)
                .replyToId(request.getReplyToId())
                .forwardedFromId(request.getForwardedFromId())
                .build();

        if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
            List<MessageAttachment> attachments = new ArrayList<>();
            for (AttachmentRequest attReq : request.getAttachments()) {
                MessageAttachment attachment = MessageAttachment.builder()
                        .id(UUID.randomUUID())
                        .message(message)
                        .fileName(attReq.getFileName())
                        .fileType(attReq.getFileType())
                        .fileSize(attReq.getFileSize())
                        .fileUrl(attReq.getFileUrl())
                        .minioObjectName(attReq.getMinioObjectName())
                        .build();
                attachments.add(attachment);
            }
            message.setAttachments(attachments);
        }

        message = messageRepository.save(message);

        // Update chat room with last message
        chatRoom.setLastMessageText(request.getContent());
        chatRoom.setLastMessageAt(LocalDateTime.now());
        chatRoom.setLastMessageBy(senderId);
        chatRoomRepository.save(chatRoom);

        // Create message statuses for all participants
        List<UUID> participantIds = chatParticipantRepository.findActiveUserIdsByChatRoomId(chatRoom.getId());
        List<MessageStatusEntity> statuses = new ArrayList<>();
        for (UUID participantId : participantIds) {
            if (!participantId.equals(senderId)) {
                MessageStatusEntity status = MessageStatusEntity.builder()
                        .id(UUID.randomUUID())
                        .message(message)
                        .userId(participantId)
                        .status("SENT")
                        .build();
                statuses.add(status);
            }
        }
        if (!statuses.isEmpty()) {
            messageStatusRepository.saveAll(statuses);
        }

        log.info("Message sent successfully: {}", message.getId());
        return mapper.toMessageResponse(message);
    }

    @Override
    @CacheEvict(value = {"recentConversations", "unreadCount"}, allEntries = true)
    public MessageResponse editMessage(UUID messageId, String newContent, UUID userId) {
        log.info("Editing message: {} by user: {}", messageId, userId);

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new MessageNotFoundException(messageId.toString()));

        if (!message.getSenderId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own messages");
        }

        if (message.getMessageType() != MessageType.TEXT) {
            throw new BadRequestException("Only text messages can be edited");
        }

        message.setContent(newContent);
        message.setStatus(MessageStatus.EDITED);
        message.setEditedAt(LocalDateTime.now());
        message = messageRepository.save(message);

        return mapper.toMessageResponse(message);
    }

    @Override
    @CacheEvict(value = {"recentConversations", "unreadCount"}, allEntries = true)
    public void deleteMessage(UUID messageId, UUID userId) {
        log.info("Deleting message: {} by user: {}", messageId, userId);

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new MessageNotFoundException(messageId.toString()));

        ChatRoom chatRoom = message.getChatRoom();
        validateParticipant(chatRoom, userId);

        if (!message.getSenderId().equals(userId) && !isAdmin(chatRoom.getId(), userId)) {
            throw new ForbiddenException("You can only delete your own messages");
        }

        message.setActive(false);
        message.setDeletedAt(LocalDateTime.now());
        message.setStatus(MessageStatus.DELETED);
        messageRepository.save(message);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MessageResponse> getMessageHistory(UUID conversationId, UUID userId, int page, int size) {
        ChatRoom chatRoom = chatRoomRepository.findById(conversationId)
                .orElseThrow(() -> new ConversationNotFoundException(conversationId.toString()));

        validateParticipant(chatRoom, userId);

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findByChatRoomIdAndActiveTrueOrderByCreatedAtDesc(conversationId, pageable);
        return messages.map(mapper::toMessageResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MessageResponse> searchMessages(UUID conversationId, UUID userId, String query, int page, int size) {
        if (conversationId != null) {
            ChatRoom chatRoom = chatRoomRepository.findById(conversationId)
                    .orElseThrow(() -> new ConversationNotFoundException(conversationId.toString()));
            validateParticipant(chatRoom, userId);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages;
        if (conversationId != null) {
            messages = messageRepository.searchMessages(conversationId, query, pageable);
        } else {
            messages = messageRepository.searchMessagesBySender(userId, query, pageable);
        }
        return messages.map(mapper::toMessageResponse);
    }

    @Override
    @CacheEvict(value = "unreadCount", allEntries = true)
    public void markMessagesAsRead(UUID conversationId, UUID userId) {
        log.debug("Marking messages as read for conversation: {} user: {}", conversationId, userId);
        messageStatusRepository.markMessagesAsRead(conversationId, userId, LocalDateTime.now());

        // Update participant's last read timestamp
        chatParticipantRepository.findByChatRoomIdAndUserIdAndActiveTrue(conversationId, userId)
                .ifPresent(participant -> {
                    participant.setLastReadAt(LocalDateTime.now());
                    chatParticipantRepository.save(participant);
                });
    }

    @Override
    public void togglePinMessage(UUID messageId, UUID userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new MessageNotFoundException(messageId.toString()));

        ChatRoom chatRoom = message.getChatRoom();
        validateParticipant(chatRoom, userId);

        message.setPinned(!message.isPinned());
        messageRepository.save(message);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getPinnedMessages(UUID conversationId, UUID userId) {
        ChatRoom chatRoom = chatRoomRepository.findById(conversationId)
                .orElseThrow(() -> new ConversationNotFoundException(conversationId.toString()));
        validateParticipant(chatRoom, userId);

        return messageRepository.findByChatRoomIdAndPinnedTrueAndActiveTrueOrderByCreatedAtDesc(conversationId)
                .stream()
                .map(mapper::toMessageResponse)
                .toList();
    }

    @Override
    public void addReaction(UUID messageId, UUID userId, String emoji) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new MessageNotFoundException(messageId.toString()));

        validateParticipant(message.getChatRoom(), userId);

        var existing = messageReactionRepository.findByMessageIdAndUserIdAndEmojiAndActiveTrue(messageId, userId, emoji);
        if (existing.isEmpty()) {
            MessageReaction reaction = MessageReaction.builder()
                    .id(UUID.randomUUID())
                    .message(message)
                    .userId(userId)
                    .emoji(emoji)
                    .build();
            messageReactionRepository.save(reaction);
        }
    }

    @Override
    public void removeReaction(UUID messageId, UUID userId, String emoji) {
        messageReactionRepository.findByMessageIdAndUserIdAndEmojiAndActiveTrue(messageId, userId, emoji)
                .ifPresent(reaction -> {
                    reaction.setActive(false);
                    messageReactionRepository.save(reaction);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(UUID conversationId, UUID userId) {
        return messageStatusRepository.countUnreadByChatRoomIdAndUserId(conversationId, userId);
    }

    private void validateParticipant(ChatRoom chatRoom, UUID userId) {
        boolean isParticipant = chatParticipantRepository
                .existsByChatRoomIdAndUserIdAndActiveTrue(chatRoom.getId(), userId);
        if (!isParticipant) {
            throw new ForbiddenException("You are not a participant of this conversation");
        }
    }

    private boolean isAdmin(UUID chatRoomId, UUID userId) {
        return chatParticipantRepository.findByChatRoomIdAndUserIdAndActiveTrue(chatRoomId, userId)
                .map(ChatParticipant::isAdmin)
                .orElse(false);
    }
}
