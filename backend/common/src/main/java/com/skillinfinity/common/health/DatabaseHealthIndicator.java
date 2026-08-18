package com.skillinfinity.common.health;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Custom health indicator that verifies database connectivity and basic query execution.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseHealthIndicator implements HealthIndicator {

    private final DataSource dataSource;

    @Override
    public Health health() {
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(3)) {
                try (Statement stmt = connection.createStatement()) {
                    stmt.execute("SELECT 1");
                }
                return Health.up()
                        .withDetail("database", connection.getMetaData().getDatabaseProductName())
                        .withDetail("version", connection.getMetaData().getDatabaseProductVersion())
                        .withDetail("url", connection.getMetaData().getURL())
                        .withDetail("validation", "Connection valid")
                        .build();
            }
            return Health.down()
                    .withDetail("database", "Unknown")
                    .withDetail("error", "Connection validation failed")
                    .build();
        } catch (Exception e) {
            log.error("Database health check failed: {}", e.getMessage());
            return Health.down()
                    .withDetail("database", "Unknown")
                    .withDetail("error", e.getMessage())
                    .build();
        }
    }
}
