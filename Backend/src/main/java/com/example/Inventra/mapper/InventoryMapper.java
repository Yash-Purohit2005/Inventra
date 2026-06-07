package com.example.Inventra.mapper;

import com.example.Inventra.dto.ProductCreateRequest;
import com.example.Inventra.dto.ProductResponseDTO;
import com.example.Inventra.dto.TransactionResponseDTO;
import com.example.Inventra.entity.Product;
import com.example.Inventra.entity.StockTransaction;
import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {

    public ProductResponseDTO toProductDTO(Product product) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .price(product.getPrice())
                .currentStock(product.getCurrentStock())
                .lowStockThreshold(product.getLowStockThreshold())
                .lowStockAlert(product.getCurrentStock() <= product.getLowStockThreshold())
                .categoryName(product.getCategory().getName())
                .supplierName(product.getSupplier().getName())
                .build();
    }

    public TransactionResponseDTO toTransactionDTO(StockTransaction tx) {
        return TransactionResponseDTO.builder()
                .id(tx.getId())
                .productId(tx.getProduct().getId())
                .productName(tx.getProduct().getName())
                .productSku(tx.getProduct().getSku())
                .type(tx.getType().name())
                .quantity(tx.getQuantity())
                .performedBy(tx.getPerformedBy())
                .createdAt(tx.getCreatedAt())
                .build();
    }

    public Product toEntity(ProductCreateRequest dto) {
        return Product.builder()
                .sku(dto.getSku().trim().toUpperCase())
                .name(dto.getName())
                .price(dto.getPrice())
                .currentStock(dto.getCurrentStock())
                .lowStockThreshold(dto.getLowStockThreshold())
                .isActive(true)
                .build();
    }
}
