package com.skillinfinity.apigateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class GatewayApplicationTests {

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private Environment environment;

    @Test
    void contextLoads() {
        assertThat(applicationContext).isNotNull();
    }

    @Test
    void applicationNameIsCorrect() {
        String appName = environment.getProperty("spring.application.name");
        assertThat(appName).isEqualTo("api-gateway");
    }

    @Test
    void serverPortIsConfigured() {
        String port = environment.getProperty("server.port");
        assertThat(port).isEqualTo("8080");
    }

    @Test
    void discoveryClientIsEnabled() {
        assertThat(GatewayApplication.class.isAnnotationPresent(
                org.springframework.cloud.client.discovery.EnableDiscoveryClient.class))
                .isTrue();
    }

    @Test
    void globalFiltersExist() {
        assertThat(applicationContext.containsBean("correlationIdFilter")).isTrue();
        assertThat(applicationContext.containsBean("requestLoggingFilter")).isTrue();
        assertThat(applicationContext.containsBean("responseLoggingFilter")).isTrue();
        assertThat(applicationContext.containsBean("globalErrorFilter")).isTrue();
    }

    @Test
    void securityConfigExists() {
        assertThat(applicationContext.containsBean("securityConfig")).isTrue();
    }

    @Test
    void gatewayConfigExists() {
        assertThat(applicationContext.containsBean("gatewayConfig")).isTrue();
    }

    @Test
    void corsWebFilterExists() {
        assertThat(applicationContext.containsBean("corsWebFilter")).isTrue();
    }
}
