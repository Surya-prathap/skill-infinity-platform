package com.skillinfinity.user.repository;

import com.skillinfinity.user.entity.Language;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LanguageRepository extends JpaRepository<Language, UUID> {

    List<Language> findByUserProfileIdOrderBySortOrderAsc(UUID userProfileId);

    void deleteByUserProfileId(UUID userProfileId);
}
