package com.skillinfinity.configserver;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.config.server.EnableConfigServer;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Tests for the Config Server application context and startup.
 * <p>
 * These tests verify that the Config Server loads successfully
 * with the default (native) profile, all required beans are
 * registered, and the environment is correctly configured.
 */
@SpringBootTest
@ActiveProfiles("native")
class ConfigServerApplicationTests {

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private Environment environment;

    @Test
    void contextLoads() {
        assertThat(applicationContext).isNotNull();
    }

    @Test
    void applicationStartsWithCorrectName() {
        String appName = environment.getProperty("spring.application.name");
        assertThat(appName).isEqualTo("config-server");
    }

    @Test
    void serverPortIsConfigured() {
        String port = environment.getProperty("server.port");
        assertThat(port).isEqualTo("8888");
    }

    @Test
    void configServerAnnotationIsPresent() {
        assertThat(ConfigServerApplication.class.isAnnotationPresent(EnableConfigServer.class))
                .as("ConfigServerApplication must be annotated with @EnableConfigServer")
                .isTrue();
    }

    @Test
    void actuatorHealthEndpointIsEnabled() {
        String healthPath = environment.getProperty("management.endpoints.web.base-path");
        String healthInclude = environment.getProperty("management.endpoints.web.exposure.include");
        assertThat(healthInclude).contains("health");
    }

    @Test
    void nativeProfileIsActive() {
        String[] activeProfiles = environment.getActiveProfiles();
        assertThat(activeProfiles).contains("native");
    }

    @Test
    void applicationHasRequiredBeans() {
        assertThat(applicationContext.containsBean("configServerConfig"))
                .as("ConfigServerConfig bean should be registered")
                .isTrue();
    }
}
