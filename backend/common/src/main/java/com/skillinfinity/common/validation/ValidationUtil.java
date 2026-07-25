package com.skillinfinity.common.validation;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Reusable validation utilities for common data formats.
 * These validators can be used across all microservices.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class ValidationUtil {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^\\+?[1-9]\\d{1,14}$");

    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$");

    private static final Pattern USERNAME_PATTERN =
            Pattern.compile("^[a-zA-Z0-9_-]{3,50}$");

    private static final Pattern UUID_PATTERN =
            Pattern.compile("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");

    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    public static boolean isValidPhone(String phone) {
        return phone != null && PHONE_PATTERN.matcher(phone).matches();
    }

    public static boolean isValidPassword(String password) {
        return password != null && PASSWORD_PATTERN.matcher(password).matches();
    }

    public static boolean isValidUsername(String username) {
        return username != null && USERNAME_PATTERN.matcher(username).matches();
    }

    public static boolean isValidUuid(String uuid) {
        return uuid != null && UUID_PATTERN.matcher(uuid).matches();
    }

    public static boolean isValidUuid(UUID uuid) {
        return uuid != null;
    }

    public static boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }

    public static boolean isPositive(Number value) {
        return value != null && value.doubleValue() > 0;
    }
}
