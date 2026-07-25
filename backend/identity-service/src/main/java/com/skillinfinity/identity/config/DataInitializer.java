package com.skillinfinity.identity.config;

import com.skillinfinity.identity.entity.Role;
import com.skillinfinity.identity.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
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
