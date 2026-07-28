package com.skillinfinity.communication.repository;

import com.skillinfinity.communication.entity.MessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, UUID> {

    List<MessageAttachment> findByMessageIdAndActiveTrue(UUID messageId);

    List<MessageAttachment> findByMessageChatRoomIdAndActiveTrue(UUID chatRoomId);
}
