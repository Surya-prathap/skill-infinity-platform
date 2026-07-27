package com.skillinfinity.payment.gateway;

import com.skillinfinity.common.exception.ServiceException;
import com.skillinfinity.payment.enumeration.PaymentGateway;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * Registry for all payment gateway strategies.
 * Uses the Strategy Pattern to select the appropriate gateway implementation.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GatewayRegistry {

    private final List<PaymentGatewayStrategy> strategies;
    private final Map<PaymentGateway, PaymentGatewayStrategy> gatewayMap = new EnumMap<>(PaymentGateway.class);

    @PostConstruct
    public void init() {
        for (PaymentGatewayStrategy strategy : strategies) {
            gatewayMap.put(strategy.getGateway(), strategy);
            log.info("Registered payment gateway: {}", strategy.getGateway());
        }
    }

    /**
     * Gets the appropriate gateway strategy for the given gateway type.
     * Falls back to INTERNAL if no specific strategy is registered.
     */
    public PaymentGatewayStrategy getStrategy(PaymentGateway gateway) {
        return gatewayMap.getOrDefault(gateway, gatewayMap.get(PaymentGateway.INTERNAL));
    }

    /**
     * Gets the appropriate gateway strategy for the given gateway name.
     */
    public PaymentGatewayStrategy getStrategy(String gatewayName) {
        try {
            PaymentGateway gateway = PaymentGateway.valueOf(gatewayName.toUpperCase());
            return getStrategy(gateway);
        } catch (IllegalArgumentException e) {
            log.warn("Unknown payment gateway: {}, falling back to INTERNAL", gatewayName);
            return getStrategy(PaymentGateway.INTERNAL);
        }
    }
}
