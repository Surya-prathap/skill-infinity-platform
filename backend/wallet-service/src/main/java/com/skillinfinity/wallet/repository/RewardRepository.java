package com.skillinfinity.wallet.repository;

import com.skillinfinity.wallet.entity.Reward;
import com.skillinfinity.wallet.enumeration.RewardType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface RewardRepository extends JpaRepository<Reward, UUID> {

    Page<Reward> findByWalletIdOrderByCreatedAtDesc(UUID walletId, Pageable pageable);

    List<Reward> findByWalletIdAndRewardType(UUID walletId, RewardType rewardType);

    List<Reward> findByWalletIdAndExpiresAtBeforeAndRedeemedFalse(UUID walletId, LocalDateTime now);

    long countByWalletId(UUID walletId);

    long countByWalletIdAndRewardType(UUID walletId, RewardType rewardType);
}
