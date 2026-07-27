package com.skillinfinity.wallet.repository;

import com.skillinfinity.wallet.entity.CreditTransaction;
import com.skillinfinity.wallet.enumeration.TransactionStatus;
import com.skillinfinity.wallet.enumeration.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, UUID> {

    Page<CreditTransaction> findByWalletIdOrderByCreatedAtDesc(UUID walletId, Pageable pageable);

    List<CreditTransaction> findByWalletIdAndTransactionType(UUID walletId, TransactionType transactionType);

    Page<CreditTransaction> findByWalletIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            UUID walletId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    Optional<CreditTransaction> findByTransactionNumber(String transactionNumber);

    Optional<CreditTransaction> findByReferenceId(String referenceId);

    Optional<CreditTransaction> findByPaymentGatewayRef(String paymentGatewayRef);

    boolean existsByReferenceId(String referenceId);

    boolean existsByPaymentGatewayRef(String paymentGatewayRef);

    long countByWalletIdAndStatus(UUID walletId, TransactionStatus status);

    Page<CreditTransaction> findByWalletIdAndTransactionTypeInOrderByCreatedAtDesc(
            UUID walletId, List<TransactionType> transactionTypes, Pageable pageable);

    List<CreditTransaction> findByWalletIdAndStatusAndCreatedAtBefore(
            UUID walletId, TransactionStatus status, LocalDateTime dateTime);
}
