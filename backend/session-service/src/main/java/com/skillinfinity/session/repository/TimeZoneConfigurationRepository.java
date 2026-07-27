package com.skillinfinity.session.repository;

import com.skillinfinity.session.entity.TimeZoneConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TimeZoneConfigurationRepository extends JpaRepository<TimeZoneConfiguration, UUID> {

    Optional<TimeZoneConfiguration> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    void deleteByUserId(UUID userId);
}
