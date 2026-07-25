package com.skillinfinity.apigateway.constant;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Constants for the API Gateway.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class GatewayConstants {

    public static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    public static final String REQUEST_ID_HEADER = "X-Request-ID";
    public static final String SERVICE_ID_HEADER = "X-Service-ID";
    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String USER_ID_HEADER = "X-User-ID";
    public static final String USER_ROLES_HEADER = "X-User-Roles";

    public static final String[] PUBLIC_PATHS = {
            "/api/v1/auth/**",
            "/api/v1/public/**",
            "/actuator/health/**",
            "/actuator/info",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger-resources/**",
            "/webjars/**"
    };
}
