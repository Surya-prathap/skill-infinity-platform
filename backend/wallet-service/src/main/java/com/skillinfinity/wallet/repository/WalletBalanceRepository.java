package com.skillinfinity.wallet.repository;

import com.skillinfinity.wallet.entity.WalletBalance;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletBalanceRepository extends JpaRepository<WalletBalance, UUID> {

    /**
     * Pessimistic write lock: serializes concurrent freeze/release/debit/settle
     * operations per wallet so two simultaneous bookings can never double-spend
     * the same credits (spec: credit-consumption priority is enforced atomically).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<WalletBalance> findByWalletId(UUID walletId);

    Optional<WalletBalance> findByWalletUserId(UUID userId);
}
