package com.skillinfinity.payment.repository;

import com.skillinfinity.payment.entity.Payment;
import com.skillinfinity.payment.enumeration.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByPaymentNumber(String paymentNumber);

    Optional<Payment> findByGatewayPaymentId(String gatewayPaymentId);

    Optional<Payment> findByGatewayOrderId(String gatewayOrderId);

    Page<Payment> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);

    Page<Payment> findByUserIdAndStatus(UUID userId, PaymentStatus status, Pageable pageable);

    Page<Payment> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            UUID userId, LocalDateTime start, LocalDateTime end, Pageable pageable);

    boolean existsByReferenceId(String referenceId);

    long countByUserIdAndStatus(UUID userId, PaymentStatus status);
}
