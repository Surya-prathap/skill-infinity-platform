package com.skillinfinity.mentor.config;

import com.skillinfinity.mentor.entity.Category;
import com.skillinfinity.mentor.entity.SubCategory;
import com.skillinfinity.mentor.repository.CategoryRepository;
import com.skillinfinity.mentor.repository.SubCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            return;
        }

        log.info("Initializing default categories and subcategories...");

        Category programming = createCategory("Programming & Development", "programming-development",
                "Software development, coding, and programming languages", 1);
        Category dataScience = createCategory("Data Science & AI", "data-science-ai",
                "Data analysis, machine learning, and artificial intelligence", 2);
        Category design = createCategory("Design & Creative", "design-creative",
                "UI/UX design, graphic design, and creative arts", 3);
        Category business = createCategory("Business & Management", "business-management",
                "Business strategy, management, and entrepreneurship", 4);
        Category marketing = createCategory("Marketing & SEO", "marketing-seo",
                "Digital marketing, social media, and search engine optimization", 5);

        categoryRepository.saveAll(List.of(programming, dataScience, design, business, marketing));

        // Programming subcategories
        subCategoryRepository.saveAll(List.of(
                createSubCategory(programming, "Web Development", "web-development", 1),
                createSubCategory(programming, "Mobile Development", "mobile-development", 2),
                createSubCategory(programming, "Backend Development", "backend-development", 3),
                createSubCategory(programming, "DevOps & Cloud", "devops-cloud", 4),
                createSubCategory(programming, "Programming Languages", "programming-languages", 5)
        ));

        // Data Science subcategories
        subCategoryRepository.saveAll(List.of(
                createSubCategory(dataScience, "Machine Learning", "machine-learning", 1),
                createSubCategory(dataScience, "Data Analysis", "data-analysis", 2),
                createSubCategory(dataScience, "AI & Deep Learning", "ai-deep-learning", 3),
                createSubCategory(dataScience, "Data Engineering", "data-engineering", 4)
        ));

        // Design subcategories
        subCategoryRepository.saveAll(List.of(
                createSubCategory(design, "UI/UX Design", "ui-ux-design", 1),
                createSubCategory(design, "Graphic Design", "graphic-design", 2),
                createSubCategory(design, "Product Design", "product-design", 3)
        ));

        // Business subcategories
        subCategoryRepository.saveAll(List.of(
                createSubCategory(business, "Entrepreneurship", "entrepreneurship", 1),
                createSubCategory(business, "Project Management", "project-management", 2),
                createSubCategory(business, "Leadership", "leadership", 3)
        ));

        // Marketing subcategories
        subCategoryRepository.saveAll(List.of(
                createSubCategory(marketing, "Digital Marketing", "digital-marketing", 1),
                createSubCategory(marketing, "SEO", "seo", 2),
                createSubCategory(marketing, "Content Marketing", "content-marketing", 3)
        ));

        log.info("Default categories and subcategories initialized successfully");
    }

    private Category createCategory(String name, String slug, String description, int displayOrder) {
        return Category.builder()
                .id(UUID.randomUUID())
                .name(name)
                .slug(slug)
                .description(description)
                .displayOrder(displayOrder)
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private SubCategory createSubCategory(Category category, String name, String slug, int displayOrder) {
        return SubCategory.builder()
                .id(UUID.randomUUID())
                .category(category)
                .name(name)
                .slug(slug)
                .displayOrder(displayOrder)
                .active(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
