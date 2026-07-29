package com.skillinfinity.admin.repository;

import com.skillinfinity.admin.entity.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, UUID> {

    Page<SupportTicket> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<SupportTicket> findByAssignedToOrderByCreatedAtDesc(UUID assignedTo, Pageable pageable);

    Page<SupportTicket> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(String status);
}
