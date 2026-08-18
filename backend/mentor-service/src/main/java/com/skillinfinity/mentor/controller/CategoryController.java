package com.skillinfinity.mentor.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.mentor.dto.response.CategoryResponse;
import com.skillinfinity.mentor.dto.response.SubCategoryResponse;
import com.skillinfinity.mentor.entity.Category;
import com.skillinfinity.mentor.entity.SubCategory;
import com.skillinfinity.mentor.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/mentors/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Category, subcategory, and skill taxonomy management")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all categories", description = "Returns all active categories with their subcategories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getAllCategories()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Returns category details")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable UUID id) {
        Category category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(toCategoryResponse(category)));
    }

    @GetMapping("/{categoryId}/subcategories")
    @Operation(summary = "Get subcategories", description = "Returns subcategories for a category")
    public ResponseEntity<ApiResponse<List<SubCategoryResponse>>> getSubCategories(@PathVariable UUID categoryId) {
        List<SubCategory> subCategories = categoryService.getSubCategories(categoryId);
        List<SubCategoryResponse> response = subCategories.stream()
                .map(this::toSubCategoryResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private CategoryResponse toCategoryResponse(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .iconUrl(c.getIconUrl())
                .displayOrder(c.getDisplayOrder())
                .subCategories(c.getSubCategories().stream()
                        .filter(SubCategory::isActive)
                        .map(this::toSubCategoryResponse)
                        .toList())
                .build();
    }

    private SubCategoryResponse toSubCategoryResponse(SubCategory sc) {
        return SubCategoryResponse.builder()
                .id(sc.getId())
                .name(sc.getName())
                .slug(sc.getSlug())
                .description(sc.getDescription())
                .displayOrder(sc.getDisplayOrder())
                .categoryId(sc.getCategory().getId())
                .build();
    }
}
