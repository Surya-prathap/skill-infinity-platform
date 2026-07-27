package com.skillinfinity.payment.repository;

import com.skillinfinity.payment.entity.PaymentAudit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PaymentAuditRepository extends JpaRepository<PaymentAudit, UUID> {

    Page<PaymentAudit> findByPaymentIdOrderByCreatedAtDesc(UUID paymentId, Pageable pageable);

    Page<PaymentAudit> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
