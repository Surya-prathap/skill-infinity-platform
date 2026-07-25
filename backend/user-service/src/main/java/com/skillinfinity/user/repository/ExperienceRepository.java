package com.skillinfinity.user.repository;

import com.skillinfinity.user.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, UUID> {

    List<Experience> findByUserProfileIdOrderBySortOrderAsc(UUID userProfileId);

    void deleteByUserProfileId(UUID userProfileId);
}
