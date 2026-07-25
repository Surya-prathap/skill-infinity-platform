package com.skillinfinity.common.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for date and time operations.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class DateTimeUtil {

    private static final ZoneId UTC = ZoneId.of("UTC");
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public static LocalDateTime nowUtc() {
        return LocalDateTime.now(UTC);
    }

    public static ZonedDateTime zonedNowUtc() {
        return ZonedDateTime.now(UTC);
    }

    public static String formatIso(LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return dateTime.format(ISO_FORMATTER);
    }

    public static LocalDateTime parseIso(String dateTimeString) {
        if (dateTimeString == null || dateTimeString.isBlank()) return null;
        return LocalDateTime.parse(dateTimeString, ISO_FORMATTER);
    }

    public static boolean isAfterNow(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isAfter(nowUtc());
    }

    public static boolean isBeforeNow(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isBefore(nowUtc());
    }
}
