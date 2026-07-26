package com.skillinfinity.mentor.service.impl;

import com.skillinfinity.mentor.entity.Category;
import com.skillinfinity.mentor.entity.SubCategory;
import com.skillinfinity.mentor.exception.CategoryNotFoundException;
import com.skillinfinity.mentor.repository.CategoryRepository;
import com.skillinfinity.mentor.repository.SubCategoryRepository;
import com.skillinfinity.mentor.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    @Override
    @Cacheable(value = "categories", unless = "#result.isEmpty()")
    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc();
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
