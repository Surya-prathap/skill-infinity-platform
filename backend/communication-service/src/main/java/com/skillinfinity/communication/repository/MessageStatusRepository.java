package com.skillinfinity.communication.repository;

import com.skillinfinity.communication.entity.MessageStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageStatusRepository extends JpaRepository<MessageStatusEntity, UUID> {

    Optional<MessageStatusEntity> findByMessageIdAndUserId(UUID messageId, UUID userId);

    List<MessageStatusEntity> findByMessageId(UUID messageId);

    List<MessageStatusEntity> findByUserIdAndStatusAndActiveTrue(UUID userId, String status);

    @Modifying
    @Query("UPDATE MessageStatusEntity ms SET ms.status = 'READ', ms.readAt = :readAt, ms.updatedAt = :readAt WHERE ms.message.chatRoom.id = :chatRoomId AND ms.userId = :userId AND ms.status <> 'READ'")
    int markMessagesAsRead(@Param("chatRoomId") UUID chatRoomId, @Param("userId") UUID userId, @Param("readAt") LocalDateTime readAt);

    long countByMessageChatRoomIdAndUserIdAndStatus(UUID chatRoomId, UUID userId, String status);

    @Query("SELECT COUNT(ms) FROM MessageStatusEntity ms WHERE ms.message.chatRoom.id = :chatRoomId AND ms.userId = :userId AND ms.status NOT IN ('READ')")
    long countUnreadByChatRoomIdAndUserId(@Param("chatRoomId") UUID chatRoomId, @Param("userId") UUID userId);
}
