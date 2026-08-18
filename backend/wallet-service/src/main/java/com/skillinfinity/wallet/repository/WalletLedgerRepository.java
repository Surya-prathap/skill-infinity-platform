package com.skillinfinity.wallet.repository;

import com.skillinfinity.wallet.entity.WalletLedger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface WalletLedgerRepository extends JpaRepository<WalletLedger, UUID> {

    Page<WalletLedger> findByWalletIdOrderByCreatedAtDesc(UUID walletId, Pageable pageable);

    List<WalletLedger> findByWalletIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            UUID walletId, LocalDateTime startDate, LocalDateTime endDate);
}
