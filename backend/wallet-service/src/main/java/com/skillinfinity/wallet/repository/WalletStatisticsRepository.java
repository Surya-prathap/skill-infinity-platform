package com.skillinfinity.wallet.repository;

import com.skillinfinity.wallet.entity.WalletStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletStatisticsRepository extends JpaRepository<WalletStatistics, UUID> {

    Optional<WalletStatistics> findByWalletId(UUID walletId);

    Optional<WalletStatistics> findByWalletUserId(UUID userId);
}
