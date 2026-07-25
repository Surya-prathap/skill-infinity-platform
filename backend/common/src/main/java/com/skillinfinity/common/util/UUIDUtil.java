package com.skillinfinity.common.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Utility class for UUID operations.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class UUIDUtil {

    public static UUID generate() {
        return UUID.randomUUID();
    }

    public static String generateAsString() {
        return UUID.randomUUID().toString();
    }

    public static boolean isValid(String uuid) {
        if (uuid == null || uuid.isBlank()) return false;
        try {
            UUID.fromString(uuid);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public static UUID fromString(String uuid) {
        if (!isValid(uuid)) return null;
        return UUID.fromString(uuid);
    }
}
