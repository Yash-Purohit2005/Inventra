package com.example.Inventra.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ProductResponseDTO {
    private Long id;
    private String sku;
    private String name;
    private BigDecimal price;
    private Integer currentStock;
    private String categoryName;
    private String supplierName;
    private Integer lowStockThreshold;
    private boolean lowStockAlert; // Derived property helper for the React UI layout
}
