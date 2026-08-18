package com.skillinfinity.payment.repository;

import com.skillinfinity.payment.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    Page<Invoice> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Optional<Invoice> findByPaymentId(UUID paymentId);
}
