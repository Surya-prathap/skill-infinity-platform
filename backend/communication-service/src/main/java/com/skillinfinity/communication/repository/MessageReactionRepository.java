package com.skillinfinity.communication.repository;

import com.skillinfinity.communication.entity.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, UUID> {

    List<MessageReaction> findByMessageIdAndActiveTrue(UUID messageId);

    Optional<MessageReaction> findByMessageIdAndUserIdAndEmojiAndActiveTrue(UUID messageId, UUID userId, String emoji);

    void deleteByMessageIdAndUserId(UUID messageId, UUID userId);
}
