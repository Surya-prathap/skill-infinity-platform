package com.skillinfinity.identity.config;

import com.skillinfinity.identity.entity.Role;
import com.skillinfinity.identity.entity.UserCredential;
import com.skillinfinity.identity.repository.RoleRepository;
import com.skillinfinity.identity.repository.UserCredentialRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    public static final String ADMIN_EMAIL = "admin@skillinfinity.com";
    public static final String ADMIN_PASSWORD = "Admin@123";
    private static final String ADMIN_USERNAME = "admin";

    private final RoleRepository roleRepository;
    private final UserCredentialRepository userCredentialRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        ensureDefaultRoles();
        ensureAdminUser();
    }

    private void ensureDefaultRoles() {
        if (roleRepository.count() > 0) {
            return;
        }

        List<Role> defaultRoles = List.of(
                createRole("ROLE_ADMIN", "System administrator with full access"),
                createRole("ROLE_MENTOR", "Mentor who offers learning sessions"),
                createRole("ROLE_LEARNER", "Learner who books sessions with mentors")
        );

        roleRepository.saveAll(defaultRoles);
        log.info("Default roles created: {}", defaultRoles.size());
    }

    private void ensureAdminUser() {
        if (userCredentialRepository.existsByEmail(ADMIN_EMAIL)) {
            return;
        }

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(
                        createRole("ROLE_ADMIN", "System administrator with full access")));

        UserCredential admin = UserCredential.builder()
                .email(ADMIN_EMAIL)
                .username(ADMIN_USERNAME)
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .emailVerified(true)
                .roles(Set.of(adminRole))
                .build();

        userCredentialRepository.save(admin);
        log.info("Bootstrap admin user created: {} (password: {})", ADMIN_EMAIL, ADMIN_PASSWORD);
    }

    private Role createRole(String name, String description) {
        return Role.builder()
                .id(UUID.randomUUID())
                .name(name)
                .description(description)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
