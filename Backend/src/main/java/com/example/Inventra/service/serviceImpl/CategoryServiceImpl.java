package com.example.Inventra.service.serviceImpl;

import com.example.Inventra.dto.CategoryRequestDTO;
import com.example.Inventra.dto.CategoryResponseDTO;
import com.example.Inventra.dto.ProductResponseDTO;
import com.example.Inventra.entity.Category;
import com.example.Inventra.exception.DuplicateCategoryException;
import com.example.Inventra.exception.DuplicateSkuException;
import com.example.Inventra.exception.ResourceNotFoundException;
import com.example.Inventra.mapper.InventoryMapper;
import com.example.Inventra.repository.CategoryRepository;
import com.example.Inventra.repository.ProductRepository;
import com.example.Inventra.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final InventoryMapper inventoryMapper;

    @Override
    @Transactional
    public CategoryResponseDTO createCategory(CategoryRequestDTO request) {
        log.info("Creating new category: [{}]", request.getName());

        if (categoryRepository.existsByName(request.getName())) {
            throw new DuplicateCategoryException("Category already exists: " + request.getName());
        }

        Category category = Category.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isActive(true)
                .build();

        return toResponseDTO(categoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponseDTO getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getProductsByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found: " + categoryId);
        }
        return productRepository.findAllByCategoryIdAndIsActiveTrue(categoryId)
                .stream()
                .map(inventoryMapper::toProductDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getAllCategories() {
        return categoryRepository.findAllByIsActiveTrue()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));

        // Check name conflict only if name is actually changing
        if (!category.getName().equalsIgnoreCase(request.getName())
                && categoryRepository.existsByName(request.getName())) {
            throw new DuplicateCategoryException("Category already exists: " + request.getName());
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        return toResponseDTO(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deactivateCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));

        category.setIsActive(false);
        categoryRepository.save(category);
        log.info("Category deactivated: id=[{}] name=[{}]", id, category.getName());
    }

    // Private mapper — Category is simple enough, no separate mapper class needed
    private CategoryResponseDTO toResponseDTO(Category category) {
        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .build();
    }
}