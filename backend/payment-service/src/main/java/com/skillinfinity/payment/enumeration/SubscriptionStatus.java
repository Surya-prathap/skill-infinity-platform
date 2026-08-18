package com.skillinfinity.payment.enumeration;

public enum SubscriptionStatus {
    ACTIVE,
    PENDING,
    /** Awaiting the first Razorpay charge after checkout. */
    PAYMENT_PENDING,
    /** First charge failed / could not be completed. */
    PAYMENT_FAILED,
    CANCELLED,
    EXPIRED,
    SUSPENDED,
    TRIAL
}
