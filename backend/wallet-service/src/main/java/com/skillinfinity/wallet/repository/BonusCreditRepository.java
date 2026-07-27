package com.skillinfinity.wallet.repository;

import com.skillinfinity.wallet.entity.BonusCredit;
import com.skillinfinity.wallet.enumeration.BonusType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BonusCreditRepository extends JpaRepository<BonusCredit, UUID> {

    List<BonusCredit> findByWalletId(UUID walletId);

    long countByWalletIdAndBonusType(UUID walletId, BonusType bonusType);

    List<BonusCredit> findByWalletIdAndExpiresAtBeforeAndRedeemedFalse(UUID walletId, LocalDateTime now);
}
