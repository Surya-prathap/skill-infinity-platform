package com.skillinfinity.identity.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

/** Identity snapshot broadcast when a user registers or their roles change. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserIdentityEvent {

    private UUID userId;
    private String email;
    private String username;
    private Set<String> roles;
    private LocalDateTime timestamp;
}
