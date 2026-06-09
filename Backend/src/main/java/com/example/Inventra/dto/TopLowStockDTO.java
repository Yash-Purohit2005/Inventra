package com.example.Inventra.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TopLowStockDTO {
    private String productName;
    private String sku;
    private Integer currentStock;
    private Integer threshold;
    private String supplierName;
    private String categoryName;
}
