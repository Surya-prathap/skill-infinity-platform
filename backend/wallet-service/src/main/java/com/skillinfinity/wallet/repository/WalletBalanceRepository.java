package com.skillinfinity.wallet.repository;

import com.skillinfinity.wallet.entity.WalletBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletBalanceRepository extends JpaRepository<WalletBalance, UUID> {

    Optional<WalletBalance> findByWalletId(UUID walletId);

    Optional<WalletBalance> findByWalletUserId(UUID userId);
}
