package com.skillinfinity.mentor.service.impl;

import com.skillinfinity.mentor.dto.response.CategoryResponse;
import com.skillinfinity.mentor.dto.response.SubCategoryResponse;
import com.skillinfinity.mentor.entity.Category;
import com.skillinfinity.mentor.entity.SubCategory;
import com.skillinfinity.mentor.exception.CategoryNotFoundException;
import com.skillinfinity.mentor.repository.CategoryRepository;
import com.skillinfinity.mentor.repository.SubCategoryRepository;
import com.skillinfinity.mentor.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    /**
     * Returns all active categories as plain DTOs. The result is mapped inside the
     * transaction so the lazy {@code subCategories} collections are fully initialized
     * before the entity is serialized (avoids LazyInitializationException).
     */
    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::toCategoryResponse)
                .collect(Collectors.toCollection(ArrayList::new));
    }

    private CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .iconUrl(category.getIconUrl())
                .displayOrder(category.getDisplayOrder())
                .subCategories(category.getSubCategories().stream()
                        .filter(SubCategory::isActive)
                        .map(this::toSubCategoryResponse)
                        .collect(Collectors.toCollection(ArrayList::new)))
                .build();
    }

    private SubCategoryResponse toSubCategoryResponse(SubCategory subCategory) {
        return SubCategoryResponse.builder()
                .id(subCategory.getId())
                .name(subCategory.getName())
                .slug(subCategory.getSlug())
                .description(subCategory.getDescription())
                .displayOrder(subCategory.getDisplayOrder())
                .categoryId(subCategory.getCategory().getId())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Category getCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException("id", id.toString()));
    }

    @Override
    @Transactional(readOnly = true)
    public Category getCategoryBySlug(String slug) {
        return categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new CategoryNotFoundException("slug", slug));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubCategory> getSubCategories(UUID categoryId) {
        return subCategoryRepository.findByCategoryIdAndActiveTrueOrderByDisplayOrderAsc(categoryId);
    }
}
