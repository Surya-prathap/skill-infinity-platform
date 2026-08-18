package com.skillinfinity.payment.repository;

import com.skillinfinity.payment.entity.PaymentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, UUID> {

    List<PaymentAttempt> findByPaymentIdOrderByAttemptNumberDesc(UUID paymentId);

    int countByPaymentId(UUID paymentId);
}
