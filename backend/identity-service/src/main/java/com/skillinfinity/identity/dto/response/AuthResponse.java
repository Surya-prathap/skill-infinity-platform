package com.skillinfinity.identity.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthResponse {

    private UUID userId;
    private String email;
    private String username;
    private Set<String> roles;
    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private String tokenType;

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder().tokenType("Bearer");
    }
}
