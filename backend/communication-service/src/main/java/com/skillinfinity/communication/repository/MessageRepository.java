package com.skillinfinity.communication.repository;

import com.skillinfinity.communication.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    Page<Message> findByChatRoomIdAndActiveTrueOrderByCreatedAtDesc(UUID chatRoomId, Pageable pageable);

    List<Message> findByChatRoomIdAndActiveTrueAndCreatedAtAfterOrderByCreatedAtAsc(UUID chatRoomId, LocalDateTime after);

    @Query("SELECT m FROM Message m WHERE m.chatRoom.id = :chatRoomId AND m.active = true " +
           "AND (LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY m.createdAt DESC")
    Page<Message> searchMessages(@Param("chatRoomId") UUID chatRoomId, @Param("query") String query, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.senderId = :senderId AND m.active = true " +
           "AND (LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY m.createdAt DESC")
    Page<Message> searchMessagesBySender(@Param("senderId") UUID senderId, @Param("query") String query, Pageable pageable);

    List<Message> findByChatRoomIdAndPinnedTrueAndActiveTrueOrderByCreatedAtDesc(UUID chatRoomId);

    @Query("SELECT m FROM Message m WHERE m.chatRoom.id IN :roomIds AND m.active = true ORDER BY m.createdAt DESC")
    List<Message> findRecentMessagesByRoomIds(@Param("roomIds") List<UUID> roomIds, Pageable pageable);

    long countByChatRoomIdAndActiveTrue(UUID chatRoomId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.chatRoom.id = :chatRoomId AND m.active = true AND m.senderId <> :userId AND m.status <> 'READ'")
    long countUnreadMessages(@Param("chatRoomId") UUID chatRoomId, @Param("userId") UUID userId);
}
