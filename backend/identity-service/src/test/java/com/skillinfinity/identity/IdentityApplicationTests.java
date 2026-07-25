package com.skillinfinity.identity;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class IdentityApplicationTests {

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
        assertThat(environment.getProperty("spring.application.name")).isEqualTo("identity-service");
    }

    @Test
    void authControllerBeanExists() {
        assertThat(applicationContext.containsBean("authController")).isTrue();
    }

    @Test
    void authServiceBeanExists() {
        assertThat(applicationContext.containsBean("authServiceImpl")).isTrue();
    }

    @Test
    void jwtTokenProviderBeanExists() {
        assertThat(applicationContext.containsBean("jwtTokenProvider")).isTrue();
    }

    @Test
    void securityConfigBeanExists() {
        assertThat(applicationContext.containsBean("securityConfig")).isTrue();
    }

    @Test
    void dataInitializerBeanExists() {
        assertThat(applicationContext.containsBean("dataInitializer")).isTrue();
    }

    @Test
    void passwordEncoderBeanExists() {
        assertThat(applicationContext.containsBean("passwordEncoder")).isTrue();
    }
}
