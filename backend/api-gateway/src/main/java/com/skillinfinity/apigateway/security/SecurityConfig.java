package com.skillinfinity.apigateway.security;

import com.skillinfinity.apigateway.constant.GatewayConstants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;

/**
 * Security configuration for the API Gateway.
 * <p>
 * Currently allows all requests without authentication.
 * JWT-based authentication will be implemented in Day 2 (Identity Service phase).
 * <p>
 * The security configuration is prepared with:
 * - Public path definitions for unauthenticated endpoints
 * - Placeholder for JWT authentication filter
 * - CORS configuration (external)
 */
@Slf4j
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        log.info("Security: Authentication is disabled. Enable in Day 2 (Identity Service phase).");

        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(GatewayConstants.PUBLIC_PATHS).permitAll()
                        .anyExchange().permitAll()
                )
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable);

        return http.build();
    }
}
