package com.skillinfinity.admin.repository;

import com.skillinfinity.admin.entity.AdminUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, UUID> {

    Optional<AdminUser> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    long countByRole(String role);

    /**
     * The Users page must never list platform ADMIN accounts — only learners
     * and mentors. Filtering happens at the database level, not the frontend.
     */
    Page<AdminUser> findByRoleNot(String role, Pageable pageable);
}
