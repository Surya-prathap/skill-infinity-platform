package com.skillinfinity.mentor.repository;

import com.skillinfinity.mentor.entity.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, UUID> {

    List<SubCategory> findByCategoryIdOrderByDisplayOrderAsc(UUID categoryId);

    List<SubCategory> findByCategoryIdAndActiveTrueOrderByDisplayOrderAsc(UUID categoryId);

    Optional<SubCategory> findBySlug(String slug);
}
