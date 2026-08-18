package com.skillinfinity.payment.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8086}")
    private String serverPort;

    @Bean
    public OpenAPI paymentServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Skill Infinity - Payment Service API")
                        .description("""
                                Payment processing service for the Skill Infinity platform.
                                
                                Features:
                                * Credit purchase through internal and external payment gateways
                                * Payment initiation, confirmation, and failure handling
                                * Refund processing with approval workflow
                                * Coupon validation and discount calculation
                                * Subscription plan management
                                * Invoice and receipt generation
                                * Payment history and audit logging
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Skill Infinity Team")
                                .email("support@skillinfinity.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://skillinfinity.com")))
                .servers(List.of(
                        new Server().url("http://localhost:" + serverPort).description("Local development"),
                        new Server().url("http://payment-service:8086").description("Docker internal")
                ));
    }
}
