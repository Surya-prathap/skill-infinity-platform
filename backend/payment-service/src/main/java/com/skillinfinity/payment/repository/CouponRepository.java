package com.skillinfinity.payment.repository;

import com.skillinfinity.payment.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, UUID> {

    Optional<Coupon> findByCode(String code);

    Optional<Coupon> findByCodeAndIsActiveTrueAndValidFromBeforeAndValidUntilAfter(
            String code, LocalDateTime now, LocalDateTime now2);

    boolean existsByCode(String code);
}
