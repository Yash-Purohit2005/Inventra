package com.example.Inventra.dto.projection;

public interface SupplierPerformanceProjection {
    String getSupplierName();
    Long getTotalProducts();
    Long getLowStockCount();
}
