package com.skillinfinity.wallet.config;

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
public class OpenAPIConfig {

    @Value("${spring.application.name:wallet-service}")
    private String applicationName;

    @Bean
    public OpenAPI walletServiceOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Skill Infinity Wallet Service API")
                        .description("RESTful API for managing credit wallets, transactions, rewards, " +
                                "bonus credits, referral rewards, and financial operations within " +
                                "the Skill Infinity platform's credit economy.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Skill Infinity Team")
                                .email("support@skillinfinity.com")
                                .url("https://skillinfinity.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://skillinfinity.com/license")))
                .servers(List.of(
                        new Server().url("/").description("Default Server URL")
                ));
    }
}
