package com.skillinfinity.common.logging;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;

import java.util.Map;
import java.util.UUID;

/**
 * Utility class for structured logging with MDC (Mapped Diagnostic Context).
 * Provides helpers for correlation IDs, request IDs, and structured log fields.
 */
@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class LoggingUtil {

    private static final String CORRELATION_ID_KEY = "correlationId";
    private static final String REQUEST_ID_KEY = "requestId";
    private static final String SERVICE_KEY = "service";
    private static final String USER_ID_KEY = "userId";

    /**
     * Generates and sets a correlation ID in the MDC context.
     *
     * @return the generated correlation ID
     */
    public static String startCorrelation() {
        String correlationId = UUID.randomUUID().toString();
        MDC.put(CORRELATION_ID_KEY, correlationId);
        return correlationId;
    }

    /**
     * Sets a correlation ID in the MDC context.
     *
     * @param correlationId the correlation ID to set
     */
    public static void setCorrelationId(String correlationId) {
        if (correlationId != null && !correlationId.isBlank()) {
            MDC.put(CORRELATION_ID_KEY, correlationId);
        }
    }

    /**
     * Sets the request ID in the MDC context.
     *
     * @param requestId the request ID to set
     */
    public static void setRequestId(String requestId) {
        if (requestId != null && !requestId.isBlank()) {
            MDC.put(REQUEST_ID_KEY, requestId);
        }
    }

    /**
     * Sets the service name in the MDC context.
     *
     * @param serviceName the service name
     */
    public static void setServiceName(String serviceName) {
        if (serviceName != null && !serviceName.isBlank()) {
            MDC.put(SERVICE_KEY, serviceName);
        }
    }

    /**
     * Sets the user ID in the MDC context for audit logging.
     *
     * @param userId the user ID
     */
    public static void setUserId(String userId) {
        if (userId != null && !userId.isBlank()) {
            MDC.put(USER_ID_KEY, userId);
        }
    }

    /**
     * Sets multiple MDC context values at once.
     *
     * @param contextMap map of MDC keys to values
     */
    public static void setContext(Map<String, String> contextMap) {
        if (contextMap != null) {
            MDC.setContextMap(contextMap);
        }
    }

    /**
     * Clears all MDC context values.
     */
    public static void clear() {
        MDC.clear();
    }

    /**
     * Logs application startup with structured information.
     *
     * @param serviceName the service name
     * @param port        the server port
     * @param profile     the active profile
     */
    public static void logStartup(String serviceName, int port, String profile) {
        log.info("╔══════════════════════════════════════════════════════════╗");
        log.info("║     Skill Infinity - {} STARTED", padRight(serviceName));
        log.info("║     Port: {} | Profile: {}", port, profile);
        log.info("╚══════════════════════════════════════════════════════════╝");
    }

    private static String padRight(String s) {
        return String.format("%-40s", s);
    }
}
