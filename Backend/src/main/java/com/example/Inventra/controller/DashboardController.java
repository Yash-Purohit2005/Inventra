package com.example.Inventra.controller;

import com.example.Inventra.dto.*;
import com.example.Inventra.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    // MANAGER + STAFF
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    // MANAGER + STAFF
    @GetMapping("/top-low-stock")
    public ResponseEntity<List<TopLowStockDTO>> getTopLowStock() {
        return ResponseEntity.ok(dashboardService.getTopLowStockProducts());
    }

    // MANAGER + STAFF
    @GetMapping("/stock-movements")
    public ResponseEntity<List<StockMovementDTO>> getStockMovements() {
        return ResponseEntity.ok(dashboardService.getStockMovementsLast7Days());
    }

    // MANAGER only — sensitive supplier intelligence
    // TODO: Add @PreAuthorize("hasRole('MANAGER')") after JWT
    @GetMapping("/supplier-performance")
    public ResponseEntity<List<SupplierPerformanceDTO>> getSupplierPerformance() {
        return ResponseEntity.ok(dashboardService.getSupplierPerformance());
    }

    // MANAGER + STAFF
    @GetMapping("/category-distribution")
    public ResponseEntity<List<CategoryDistributionDTO>> getCategoryDistribution() {
        return ResponseEntity.ok(dashboardService.getCategoryDistribution());
    }
}
