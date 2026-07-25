package com.skillinfinity.user.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Skill Infinity - User Service API")
                        .description("User profile management including education, experience, skills, and languages")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Skill Infinity Team")
                                .email("support@skillinfinity.com"))
                        .license(new License().name("MIT License")));
    }
}
