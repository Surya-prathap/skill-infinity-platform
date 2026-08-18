package com.skillinfinity.identity.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

/** Admin-facing identity snapshot — every account for the admin user index. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserAdminResponse {

    private UUID id;
    private String email;
    private String username;
    private Set<String> roles;
    private boolean enabled;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}
