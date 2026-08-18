package com.skillinfinity.user.repository;

import com.skillinfinity.user.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SkillRepository extends JpaRepository<Skill, UUID> {

    List<Skill> findByUserProfileIdOrderBySortOrderAsc(UUID userProfileId);

    void deleteByUserProfileId(UUID userProfileId);
}
