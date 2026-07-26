package com.skillinfinity.mentor.service;

import com.skillinfinity.mentor.entity.Category;
import com.skillinfinity.mentor.entity.SubCategory;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    List<Category> getAllCategories();

    Category getCategoryById(UUID id);

    Category getCategoryBySlug(String slug);

    List<SubCategory> getSubCategories(UUID categoryId);
}
