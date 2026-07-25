package com.skillinfinity.common.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Utility class for masking sensitive data in logs and responses.
 * Helps comply with security best practices by avoiding exposure of PII.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class MaskingUtil {

    private static final String MASK = "****";
    private static final int MIN_VISIBLE_CHARS = 4;

    /**
     * Masks an email address, showing only the first character and domain.
     * Example: j***@example.com
     */
    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) return MASK;
        String[] parts = email.split("@");
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 1) return name + "***@" + domain;
        return name.charAt(0) + "***@" + domain;
    }

    /**
     * Masks a phone number, showing only the last 4 digits.
     * Example: ****5678
     */
    public static String maskPhone(String phone) {
        if (phone == null || phone.length() < MIN_VISIBLE_CHARS) return MASK;
        return MASK + phone.substring(phone.length() - MIN_VISIBLE_CHARS);
    }

    /**
     * Masks a credit card number, showing only the last 4 digits.
     * Example: ****-****-****-1234
     */
    public static String maskCreditCard(String cardNumber) {
        if (cardNumber == null) return MASK;
        String cleaned = cardNumber.replaceAll("[\\s-]", "");
        if (cleaned.length() < MIN_VISIBLE_CHARS) return MASK;
        return MASK + "-" + cleaned.substring(cleaned.length() - MIN_VISIBLE_CHARS);
    }

    /**
     * Masks a JWT token, showing only the first and last 10 characters.
     */
    public static String maskToken(String token) {
        if (token == null || token.length() < 20) return MASK;
        return token.substring(0, 10) + "..." + token.substring(token.length() - 10);
    }

    /**
     * Masks a password completely.
     */
    public static String maskPassword() {
        return MASK;
    }
}
