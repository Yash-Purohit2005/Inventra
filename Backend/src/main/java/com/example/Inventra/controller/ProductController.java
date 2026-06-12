package com.example.Inventra.controller;

import com.example.Inventra.dto.ProductCreateRequest;
import com.example.Inventra.dto.ProductResponseDTO;
import com.example.Inventra.dto.ProductUpdateRequest;
import com.example.Inventra.service.InventoryService;
import com.example.Inventra.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;


    @PostMapping("/create")
    public ResponseEntity<ProductResponseDTO> createProduct(
            @Valid @RequestBody ProductCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProduct(request));
    }

    @GetMapping("/get-all-products")
    public ResponseEntity<Page<ProductResponseDTO>> getAllProducts(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(productService.getAllProducts(pageable));
    }

    @GetMapping("/id/{id}") // 👑 FIXED: Eliminated routing ambiguities with absolute pathing namespaces
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<ProductResponseDTO> getProductBySku(@PathVariable String sku) {
        return ResponseEntity.ok(productService.getProductBySku(sku));
    }

    @GetMapping("/dashboard/low-stock") // 👑 FIXED: Completely isolated dashboard metrics pathing
    public ResponseEntity<List<ProductResponseDTO>> getLowStockDashboard() {
        return ResponseEntity.ok(productService.getLowStockProducts());
    }

    @PutMapping("/id/{id}") // 👑 FIXED: Enforces semantic routing consistency
    public ResponseEntity<ProductResponseDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/id/{id}")
    public ResponseEntity<Void> deactivateProduct(@PathVariable Long id) {
        productService.deactivateProduct(id);
        return ResponseEntity.noContent().build(); // Standard 204 response for successful deletes
    }
}
