package com.skillinfinity.configserver.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

/**
 * Configuration class for the Config Server.
 * <p>
 * Logs startup information and prepares the environment for future
 * Spring Security integration. Authentication will be enabled in a
 * later phase.
 */
@Slf4j
@Configuration
public class ConfigServerConfig {

    private static final String CONFIG_SERVER_BANNER = """
            \n
            ╔══════════════════════════════════════════════════════════╗
            ║             Skill Infinity - Config Server              ║
            ║          Centralized Configuration Management           ║
            ╚══════════════════════════════════════════════════════════╝
            """;

    @PostConstruct
    void logStartup() {
        log.info(CONFIG_SERVER_BANNER);
        log.info("Config Server is initializing...");
        log.info("Default profile: native (classpath:/config)");
        log.info("Configuration source: classpath:/config/");
        log.info("Git profile available: spring.profiles.active=git");
        log.info("Security: Authentication is disabled. Enable via spring.security.* in future phases.");
    }

    /**
     * Placeholder for future Spring Security configuration.
     * <p>
     * Authentication and authorization for the Config Server will be
     * implemented in a dedicated security phase. Until then, the
     * server is accessible without credentials for local development.
     * <p>
     * When enabled, the Config Server will require:
     * <ul>
     *     <li>Basic Authentication or JWT tokens</li>
     *     <li>Encrypted communication via HTTPS</li>
     *     <li>Role-based access to configuration endpoints</li>
     * </ul>
     */
    @Configuration
    @Profile("secure")
    static class SecurityConfiguration {
        @PostConstruct
        void logSecurity() {
            log.info("Security profile 'secure' is active. Authentication is enabled.");
        }
    }
}
