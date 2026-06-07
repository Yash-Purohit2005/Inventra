package com.example.Inventra.service.serviceImpl;

import com.example.Inventra.dto.ProductCreateRequest;
import com.example.Inventra.dto.ProductUpdateRequest;
import com.example.Inventra.dto.ProductResponseDTO;
import com.example.Inventra.entity.*;
import com.example.Inventra.exception.DuplicateSkuException;
import com.example.Inventra.exception.ResourceNotFoundException;
import com.example.Inventra.mapper.InventoryMapper;
import com.example.Inventra.repository.CategoryRepository;
import com.example.Inventra.repository.ProductRepository;
import com.example.Inventra.repository.StockTransactionRepository;
import com.example.Inventra.repository.SupplierRepository;
import com.example.Inventra.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final StockTransactionRepository transactionRepository;
    private final InventoryMapper inventoryMapper;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    @Override
    @Transactional
    public ProductResponseDTO createProduct(ProductCreateRequest request) {
        String normalizedSku = request.getSku().trim().toUpperCase();
        log.info("Registering new product SKU: [{}]", normalizedSku);

        if (productRepository.existsBySku(normalizedSku)) {
            throw new DuplicateSkuException("SKU already registered: " + normalizedSku);
        }


        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found: " + request.getCategoryId()));

        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Supplier not found: " + request.getSupplierId()));

        Product product = inventoryMapper.toEntity(request);
        product.setSku(normalizedSku);
        product.setCategory(category);
        product.setSupplier(supplier);
        Product saved = productRepository.save(product);

        // Anchor the audit ledger — stock history starts here, not in thin air
        if (saved.getCurrentStock() > 0) {
            transactionRepository.save(StockTransaction.builder()
                    .product(saved)
                    .type(TransactionType.INITIAL)
                    .quantity(saved.getCurrentStock())
                    .performedBy("SYSTEM")
                    .build());
        }

        return inventoryMapper.toProductDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDTO getProductById(Long id) {
        return productRepository.findByIdWithRelations(id)
                .map(inventoryMapper::toProductDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDTO getProductBySku(String sku) {
        String normalizedSku = sku.trim().toUpperCase();
        return productRepository.findBySkuWithRelations(normalizedSku)
                .map(inventoryMapper::toProductDTO)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active product not found for SKU: " + normalizedSku));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> getAllProducts(Pageable pageable) {
        return productRepository.findAllActiveWithRelations(pageable)
                .map(inventoryMapper::toProductDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getLowStockProducts() {
        return productRepository.findLowStockItems().stream()
                .map(inventoryMapper::toProductDTO)
                .toList();
    }

    @Override
    @Transactional
    public ProductResponseDTO updateProduct(Long id, ProductUpdateRequest request) {
        Product product = productRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));

        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setLowStockThreshold(request.getLowStockThreshold());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Category not found: " + request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Supplier not found: " + request.getSupplierId()));
            product.setSupplier(supplier);
        }

        return inventoryMapper.toProductDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));

        product.setIsActive(false);
        productRepository.save(product);
        log.info("Product deactivated: id=[{}] sku=[{}]", id, product.getSku());
    }
}
