package com.skillinfinity.mentor.repository;

import com.skillinfinity.mentor.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SkillRepository extends JpaRepository<Skill, UUID> {

    List<Skill> findBySubCategoryIdOrderByDisplayOrderAsc(UUID subCategoryId);
}
