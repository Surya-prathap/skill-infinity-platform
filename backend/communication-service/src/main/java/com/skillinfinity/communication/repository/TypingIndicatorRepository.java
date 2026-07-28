package com.skillinfinity.communication.repository;

import com.skillinfinity.communication.entity.TypingIndicator;
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
public interface TypingIndicatorRepository extends JpaRepository<TypingIndicator, UUID> {

    List<TypingIndicator> findByChatRoomIdAndActiveTrue(UUID chatRoomId);

    Optional<TypingIndicator> findByChatRoomIdAndUserIdAndActiveTrue(UUID chatRoomId, UUID userId);

    @Modifying
    @Query("UPDATE TypingIndicator t SET t.typing = false, t.active = false WHERE t.expiresAt < :now")
    int expireOldIndicators(@Param("now") LocalDateTime now);
}
