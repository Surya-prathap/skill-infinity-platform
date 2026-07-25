package com.skillinfinity.discoveryserver;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class DiscoveryServerApplicationTests {

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
        assertThat(appName).isEqualTo("discovery-server");
    }

    @Test
    void serverPortIsConfigured() {
        String port = environment.getProperty("server.port");
        assertThat(port).isEqualTo("8761");
    }

    @Test
    void eurekaServerAnnotationIsPresent() {
        assertThat(DiscoveryServerApplication.class.isAnnotationPresent(
                org.springframework.cloud.netflix.eureka.server.EnableEurekaServer.class))
                .isTrue();
    }

    @Test
    void discoveryServerConfigBeanExists() {
        assertThat(applicationContext.containsBean("discoveryServerConfig")).isTrue();
    }

    @Test
    void eurekaIsConfigured() {
        String registerWithEureka = environment.getProperty("eureka.client.register-with-eureka");
        assertThat(registerWithEureka).isEqualTo("false");
    }
}
