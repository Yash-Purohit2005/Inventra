package com.example.Inventra.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SupplierPerformanceDTO {
    private String supplierName;
    private Long totalProducts;
    private Long lowStockCount;
    private String alertRate;
}
