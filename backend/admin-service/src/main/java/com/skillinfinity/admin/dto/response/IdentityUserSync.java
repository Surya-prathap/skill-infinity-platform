package com.skillinfinity.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

/** User snapshot returned by the identity-service for the admin backfill. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class IdentityUserSync {

    private UUID id;
    private String email;
    private String username;
    private Set<String> roles;
    private boolean enabled;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}
