package com.skillinfinity.wallet.repository;

import com.skillinfinity.wallet.entity.ReferralReward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReferralRewardRepository extends JpaRepository<ReferralReward, UUID> {

    List<ReferralReward> findByWalletId(UUID walletId);

    Optional<ReferralReward> findByReferralCode(String referralCode);

    boolean existsByReferredUserId(UUID referredUserId);

    long countByReferrerUserId(UUID referrerUserId);

    List<ReferralReward> findByReferrerUserId(UUID referrerUserId);
}
