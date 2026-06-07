package com.example.Inventra.service;

import com.example.Inventra.dto.ProductCreateRequest;
import com.example.Inventra.dto.ProductUpdateRequest;
import com.example.Inventra.dto.ProductResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ProductService {
    ProductResponseDTO createProduct(ProductCreateRequest request);
    ProductResponseDTO updateProduct(Long id, ProductUpdateRequest request);
    ProductResponseDTO getProductById(Long id);
    ProductResponseDTO getProductBySku(String sku);
    Page<ProductResponseDTO> getAllProducts(Pageable pageable);
    List<ProductResponseDTO> getLowStockProducts();
    void deactivateProduct(Long id);
}
