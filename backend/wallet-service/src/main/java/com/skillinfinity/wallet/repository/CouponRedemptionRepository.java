package com.skillinfinity.wallet.repository;

import com.skillinfinity.wallet.entity.CouponRedemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, UUID> {

    List<CouponRedemption> findByWalletId(UUID walletId);

    Optional<CouponRedemption> findByCouponCode(String couponCode);

    boolean existsByCouponCodeAndWalletId(String couponCode, UUID walletId);
}
