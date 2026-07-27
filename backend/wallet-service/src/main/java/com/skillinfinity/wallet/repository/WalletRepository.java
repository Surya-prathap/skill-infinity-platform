package com.skillinfinity.wallet.repository;

import com.skillinfinity.wallet.entity.Wallet;
import com.skillinfinity.wallet.enumeration.WalletStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, UUID> {

    Optional<Wallet> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    Optional<Wallet> findByWalletNumber(String walletNumber);

    List<Wallet> findByStatus(WalletStatus status);

    long countByStatus(WalletStatus status);
}
