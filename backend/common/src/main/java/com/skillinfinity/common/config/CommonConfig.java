package com.skillinfinity.common.config;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.context.annotation.Bean;

import java.time.Clock;
import java.time.ZoneId;
import java.util.TimeZone;

/**
 * Common configuration beans shared across all microservices.
 *
 * The platform schedules and displays times in a single canonical zone —
 * Asia/Kolkata (IST) — end to end (DB wall-clock, JVM, serialized JSON,
 * frontend). This configuration pins the JVM's default timezone so every
 * {@code LocalDateTime.now()} call (bookings, availability, timestamps)
 * produces IST wall-clock, and is registered as an auto-configuration so it
 * applies to every service that depends on the common module regardless of
 * container flags or host timezone.
 */
@AutoConfiguration
public class CommonConfig {

    public static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");

    static {
        TimeZone.setDefault(TimeZone.getTimeZone(APP_ZONE));
    }

    @Bean
    public Clock clock() {
        return Clock.system(APP_ZONE);
    }
}
