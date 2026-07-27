package com.skillinfinity.payment.repository;

import com.skillinfinity.payment.entity.Receipt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, UUID> {

    Optional<Receipt> findByReceiptNumber(String receiptNumber);

    Optional<Receipt> findByPaymentId(UUID paymentId);

    Page<Receipt> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
