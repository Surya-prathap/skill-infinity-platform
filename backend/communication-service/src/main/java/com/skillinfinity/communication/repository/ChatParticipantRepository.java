package com.skillinfinity.communication.repository;

import com.skillinfinity.communication.entity.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, UUID> {

    List<ChatParticipant> findByChatRoomIdAndActiveTrue(UUID chatRoomId);

    Optional<ChatParticipant> findByChatRoomIdAndUserIdAndActiveTrue(UUID chatRoomId, UUID userId);

    @Query("SELECT cp.userId FROM ChatParticipant cp WHERE cp.chatRoom.id = :chatRoomId AND cp.active = true")
    List<UUID> findActiveUserIdsByChatRoomId(@Param("chatRoomId") UUID chatRoomId);

    @Query("SELECT COUNT(cp) FROM ChatParticipant cp WHERE cp.chatRoom.id = :chatRoomId AND cp.active = true")
    long countActiveParticipantsByChatRoomId(@Param("chatRoomId") UUID chatRoomId);

    boolean existsByChatRoomIdAndUserIdAndActiveTrue(UUID chatRoomId, UUID userId);
}
