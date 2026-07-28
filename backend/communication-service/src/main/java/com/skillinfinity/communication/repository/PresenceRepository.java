package com.skillinfinity.communication.repository;

import com.skillinfinity.communication.entity.Presence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PresenceRepository extends JpaRepository<Presence, UUID> {

    Optional<Presence> findByUserId(UUID userId);

    List<Presence> findByOnlineTrue();

    List<Presence> findByUserIdIn(List<UUID> userIds);
}
