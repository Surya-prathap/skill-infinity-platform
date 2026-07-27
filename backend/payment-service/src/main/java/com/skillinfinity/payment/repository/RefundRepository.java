package com.skillinfinity.payment.repository;

import com.skillinfinity.payment.entity.Refund;
import com.skillinfinity.payment.enumeration.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefundRepository extends JpaRepository<Refund, UUID> {

    Optional<Refund> findByRefundNumber(String refundNumber);

    Page<Refund> findByPaymentIdOrderByCreatedAtDesc(UUID paymentId, Pageable pageable);

    Page<Refund> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    List<Refund> findByPaymentId(UUID paymentId);

    long countByPaymentIdAndStatus(UUID paymentId, PaymentStatus status);
}
