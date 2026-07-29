package com.skillinfinity.admin.repository;

import com.skillinfinity.admin.entity.SupportReply;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SupportReplyRepository extends JpaRepository<SupportReply, UUID> {

    Page<SupportReply> findByTicketIdOrderByCreatedAtAsc(UUID ticketId, Pageable pageable);
}
