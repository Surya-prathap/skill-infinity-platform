package com.skillinfinity.common.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Utility class for common string operations.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class StringUtil {

    public static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public static boolean isNotBlank(String value) {
        return value != null && !value.isBlank();
    }

    public static String truncate(String value, int maxLength) {
        if (value == null) return null;
        if (value.length() <= maxLength) return value;
        return value.substring(0, maxLength) + "...";
    }

    public static String toSnakeCase(String camelCase) {
        if (camelCase == null) return null;
        return camelCase.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }

    public static String toCamelCase(String snakeCase) {
        if (snakeCase == null) return null;
        StringBuilder result = new StringBuilder();
        boolean upperNext = false;
        for (char c : snakeCase.toCharArray()) {
            if (c == '_') {
                upperNext = true;
            } else if (upperNext) {
                result.append(Character.toUpperCase(c));
                upperNext = false;
            } else {
                result.append(c);
            }
        }
        return result.toString();
    }

    public static String generateId() {
        return UUID.randomUUID().toString();
    }

    public static String mask(String value, int visibleChars) {
        if (value == null) return null;
        if (value.length() <= visibleChars) return value;
        int maskLength = value.length() - visibleChars;
        return "*".repeat(maskLength) + value.substring(value.length() - visibleChars);
    }

    public static String sanitize(String value) {
        if (value == null) {
            return null;
        }
        return value
                .replaceAll("<[^>]*>", "")
                .replace("'", "")
                .replace("\"", "")
                .trim();
    }
}
