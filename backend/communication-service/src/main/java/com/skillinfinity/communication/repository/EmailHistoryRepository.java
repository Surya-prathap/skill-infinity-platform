package com.skillinfinity.communication.repository;

import com.skillinfinity.communication.entity.EmailHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmailHistoryRepository extends JpaRepository<EmailHistory, UUID> {

    Page<EmailHistory> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail, Pageable pageable);

    List<EmailHistory> findByStatusAndCreatedAtBefore(String status, LocalDateTime before);

    long countByRecipientEmailAndStatus(String recipientEmail, String status);
}
