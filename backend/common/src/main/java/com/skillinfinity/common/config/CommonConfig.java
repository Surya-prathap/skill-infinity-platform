package com.skillinfinity.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/**
 * Common configuration beans shared across all microservices.
 */
@Configuration
public class CommonConfig {

    @Bean
    public Clock clock() {
        return Clock.system(ZoneId.of("UTC"));
    }
}
