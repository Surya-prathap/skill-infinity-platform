package com.skillinfinity.wallet.enumeration;

/**
 * The four credit buckets the platform tracks separately.
 *
 * <ul>
 *   <li>WELCOME — one-time 3-credit grant at registration; never replenished.</li>
 *   <li>PURCHASED — credits bought with real money (INR).</li>
 *   <li>LEARNING — credits earned by mentoring professional sessions.</li>
 *   <li>WITHDRAWABLE — earnings eligible for cash withdrawal.</li>
 * </ul>
 *
 * Learning-session debits consume buckets in priority order
 * WELCOME → PURCHASED → LEARNING (see WalletServiceImpl#debitWallet).
 */
public enum CreditType {
    WELCOME,
    PURCHASED,
    LEARNING,
    WITHDRAWABLE
}
