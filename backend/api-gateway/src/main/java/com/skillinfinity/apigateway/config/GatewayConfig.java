package com.skillinfinity.apigateway.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;

/**
 * Gateway configuration including CORS, rate limiting setup, and startup logging.
 */
@Slf4j
@Configuration
public class GatewayConfig {

    private static final String GATEWAY_BANNER = """
            
            ╔══════════════════════════════════════════════════════════╗
            ║           Skill Infinity - API Gateway                  ║
            ║           Single Entry Point for All Services           ║
            ╚══════════════════════════════════════════════════════════╝
            """;

    // The dockerized frontend is served on http://localhost (port 80) and, before
    // the API base URL was switched to the same-origin /api/v1 path, the browser
    // called the gateway cross-origin — without http://localhost in this list every
    // register/login attempt failed with a CORS 403. The production .env file now
    // routes all API traffic through the nginx proxy (same-origin), so this list is
    // a safety net for direct gateway access and local dev servers.
    @Value("${api-gateway.cors.allowed-origins:http://localhost,http://127.0.0.1,http://localhost:5173,http://localhost:3000}")
    private String allowedOrigins;

    @PostConstruct
    void logStartup() {
        log.info(GATEWAY_BANNER);
        log.info("API Gateway is initializing...");
        log.info("Configuration source: Config Server (spring.cloud.config.uri)");
        log.info("Service discovery: Eureka (lb:// routes enabled)");
        log.info("CORS allowed origins: {}", allowedOrigins);
    }

    /**
     * Configures CORS for the gateway.
     * Allows frontend origins configured via environment variables.
     */
    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }

    /**
     * Key resolver for future rate limiting.
     * Resolves the client IP for rate limit key.
     */
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> Mono.just(
                exchange.getRequest().getRemoteAddress() != null
                        ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress()
                        : "unknown"
        );
    }
}
