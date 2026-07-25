package com.skillinfinity.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class UserApplicationTests {

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
        assertThat(environment.getProperty("spring.application.name")).isEqualTo("user-service");
    }

    @Test
    void userProfileControllerBeanExists() {
        assertThat(applicationContext.containsBean("userProfileController")).isTrue();
    }

    @Test
    void userProfileServiceBeanExists() {
        assertThat(applicationContext.containsBean("userProfileServiceImpl")).isTrue();
    }

    @Test
    void openApiConfigBeanExists() {
        assertThat(applicationContext.containsBean("openApiConfig")).isTrue();
    }
}
