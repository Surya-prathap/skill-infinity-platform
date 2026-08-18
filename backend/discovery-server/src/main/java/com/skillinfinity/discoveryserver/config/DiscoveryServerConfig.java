package com.skillinfinity.discoveryserver.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for the Discovery Server.
 * <p>
 * Logs startup information and monitors the Eureka server initialization.
 */
@Slf4j
@Configuration
public class DiscoveryServerConfig {

    private static final String DISCOVERY_SERVER_BANNER = """
            
            ╔══════════════════════════════════════════════════════════╗
            ║          Skill Infinity - Discovery Server              ║
            ║              Eureka Service Registry                    ║
            ╚══════════════════════════════════════════════════════════╝
            """;

    @PostConstruct
    void logStartup() {
        log.info(DISCOVERY_SERVER_BANNER);
        log.info("Discovery Server is initializing...");
        log.info("Configuration source: Config Server (spring.cloud.config.uri)");
        log.info("Eureka server mode: Standalone (no self-registration)");
        log.info("Dashboard: http://localhost:{}/", "${server.port:8761}");
    }
}
