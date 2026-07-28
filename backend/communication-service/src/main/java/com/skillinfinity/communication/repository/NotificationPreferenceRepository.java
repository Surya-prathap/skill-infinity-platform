package com.skillinfinity.communication.repository;

import com.skillinfinity.communication.entity.NotificationPreference;
import com.skillinfinity.communication.enumeration.NotificationCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, UUID> {

    List<NotificationPreference> findByUserId(UUID userId);

    Optional<NotificationPreference> findByUserIdAndCategory(UUID userId, NotificationCategory category);
}
