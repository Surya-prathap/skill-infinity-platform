package com.skillinfinity.payment.service.impl;

import com.skillinfinity.payment.entity.Coupon;
import com.skillinfinity.payment.enumeration.DiscountType;
import com.skillinfinity.payment.exception.InvalidCouponException;
import com.skillinfinity.payment.repository.CouponRepository;
import com.skillinfinity.payment.service.CouponService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private static final String CACHE_COUPON = "coupon";

    private final CouponRepository couponRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = CACHE_COUPON, key = "#couponCode", unless = "#result == null")
    public Coupon validateAndApplyCoupon(String couponCode, BigDecimal amount, String userId) {
        Coupon coupon = couponRepository.findByCode(couponCode)
                .orElseThrow(() -> new InvalidCouponException("Coupon not found: " + couponCode));

        validateCouponActive(coupon);
        validateCouponDateRange(coupon);
        validateCouponUsageLimit(coupon);
        validateMinimumPurchase(coupon, amount);

        return coupon;
    }

    @Override
    public BigDecimal calculateDiscount(Coupon coupon, BigDecimal amount) {
        BigDecimal discount;

        if (coupon.getDiscountType() == DiscountType.FLAT) {
            discount = coupon.getDiscountValue();
        } else {
            discount = amount.multiply(coupon.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }

        if (coupon.getMaxDiscountAmount() != null
                && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
            discount = coupon.getMaxDiscountAmount();
        }

        if (discount.compareTo(amount) > 0) {
            discount = amount;
        }

        return discount;
    }

    @Override
    @Transactional
    @CacheEvict(value = CACHE_COUPON, key = "#request.couponCode")
    public Coupon validateCoupon(com.skillinfinity.payment.dto.request.CouponRequest request) {
        Coupon coupon = validateAndApplyCoupon(request.getCouponCode(), request.getAmount(), request.getUserId());
        incrementCouponUsage(coupon);
        return coupon;
    }

    private void validateCouponActive(Coupon coupon) {
        if (!Boolean.TRUE.equals(coupon.getIsActive())) {
            throw new InvalidCouponException("Coupon is no longer active: " + coupon.getCode());
        }
    }

    private void validateCouponDateRange(Coupon coupon) {
        LocalDateTime now = LocalDateTime.now();
        if (coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom())) {
            throw new InvalidCouponException("Coupon is not yet valid: " + coupon.getCode());
        }
        if (coupon.getValidUntil() != null && now.isAfter(coupon.getValidUntil())) {
            throw new InvalidCouponException("Coupon has expired: " + coupon.getCode());
        }
    }

    private void validateCouponUsageLimit(Coupon coupon) {
        if (coupon.getMaxUses() != null && coupon.getCurrentUses() >= coupon.getMaxUses()) {
            throw new InvalidCouponException("Coupon usage limit reached: " + coupon.getCode());
        }
    }

    private void validateMinimumPurchase(Coupon coupon, BigDecimal amount) {
        if (coupon.getMinPurchaseAmount() != null
                && amount.compareTo(coupon.getMinPurchaseAmount()) < 0) {
            throw new InvalidCouponException(
                    "Minimum purchase amount of " + coupon.getMinPurchaseAmount()
                            + " required for coupon: " + coupon.getCode());
        }
    }

    private void incrementCouponUsage(Coupon coupon) {
        coupon.setCurrentUses(coupon.getCurrentUses() + 1);
        couponRepository.save(coupon);
        log.info("Coupon used: code={}, totalUses={}", coupon.getCode(), coupon.getCurrentUses());
    }
}
