package com.example.Inventra.service;

import com.example.Inventra.dto.*;

import java.util.List;

public interface DashboardService {
    DashboardSummaryDTO getSummary();
    List<TopLowStockDTO> getTopLowStockProducts();
    List<StockMovementDTO> getStockMovementsLast7Days();
    List<SupplierPerformanceDTO> getSupplierPerformance();
    List<CategoryDistributionDTO> getCategoryDistribution();
}
