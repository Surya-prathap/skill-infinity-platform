package com.skillinfinity.session.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        // Read timeout must tolerate a cold-start / first-touch call. The
        // wallet-service auto-creates a user's wallet on first use, which on a
        // CPU-constrained dev container can take several seconds — an 8s cap
        // turned the very first booking into "Booking could not be completed
        // right now" (503) even though the wallet call succeeded moments later.
        // 30s stays well under the gateway's 60s response timeout while giving
        // mentor/wallet calls real headroom on slow containers.
        return builder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(30))
                .build();
    }
}
