package com.skillinfinity.payment.service;

import com.skillinfinity.payment.dto.request.CouponRequest;
import com.skillinfinity.payment.entity.Coupon;

import java.math.BigDecimal;

public interface CouponService {

    Coupon validateAndApplyCoupon(String couponCode, BigDecimal amount, String userId);

    BigDecimal calculateDiscount(Coupon coupon, BigDecimal amount);

    Coupon validateCoupon(CouponRequest request);
}
