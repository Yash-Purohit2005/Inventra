package com.example.Inventra.service;

import com.example.Inventra.dto.CategoryRequestDTO;
import com.example.Inventra.dto.CategoryResponseDTO;
import com.example.Inventra.dto.ProductResponseDTO;

import java.util.List;

public interface CategoryService {
    CategoryResponseDTO createCategory(CategoryRequestDTO request);
    CategoryResponseDTO getCategoryById(Long id);
    List<ProductResponseDTO> getProductsByCategory(Long categoryId);
    List<CategoryResponseDTO> getAllCategories();
    CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO request);
    void deactivateCategory(Long id);
}
