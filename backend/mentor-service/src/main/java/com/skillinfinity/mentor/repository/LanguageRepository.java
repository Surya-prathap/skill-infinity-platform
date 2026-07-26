package com.skillinfinity.mentor.repository;

import com.skillinfinity.mentor.entity.Language;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LanguageRepository extends JpaRepository<Language, UUID> {

    Optional<Language> findByMentorIdAndNameIgnoreCase(UUID mentorId, String name);

    List<Language> findByMentorIdOrderBySortOrderAsc(UUID mentorId);
}
