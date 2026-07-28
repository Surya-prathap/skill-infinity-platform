package com.skillinfinity.communication.repository;

import com.skillinfinity.communication.entity.ChatRoom;
import com.skillinfinity.communication.enumeration.ConversationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, UUID> {

    @Query("SELECT cr FROM ChatRoom cr JOIN cr.participants p WHERE p.userId = :userId AND p.active = true AND cr.active = true ORDER BY cr.lastMessageAt DESC NULLS LAST")
    Page<ChatRoom> findActiveChatRoomsByUserId(@Param("userId") UUID userId, Pageable pageable);

    @Query("SELECT cr FROM ChatRoom cr JOIN cr.participants p WHERE p.userId = :userId AND cr.active = true")
    List<ChatRoom> findAllByUserId(@Param("userId") UUID userId);

    Optional<ChatRoom> findBySessionIdAndActiveTrue(UUID sessionId);

    Optional<ChatRoom> findByMentorIdAndLearnerIdAndConversationTypeAndActiveTrue(
            UUID mentorId, UUID learnerId, ConversationType conversationType);

    @Query("SELECT COUNT(cr) FROM ChatRoom cr JOIN cr.participants p WHERE p.userId = :userId AND cr.active = true")
    long countActiveChatRoomsByUserId(@Param("userId") UUID userId);

    @Query("SELECT cr FROM ChatRoom cr WHERE cr.sessionId = :sessionId AND cr.active = true")
    Optional<ChatRoom> findBySessionId(@Param("sessionId") UUID sessionId);
}
