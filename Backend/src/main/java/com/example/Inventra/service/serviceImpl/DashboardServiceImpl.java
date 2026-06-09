package com.example.Inventra.service.serviceImpl;

import com.example.Inventra.dto.*;
import com.example.Inventra.dto.projection.CategoryDistributionProjection;
import com.example.Inventra.dto.projection.SupplierPerformanceProjection;
import com.example.Inventra.dto.projection.StockMovementProjection;
import com.example.Inventra.repository.ProductRepository;
import com.example.Inventra.repository.StockAlertRepository;
import com.example.Inventra.repository.StockTransactionRepository;
import com.example.Inventra.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final ProductRepository productRepository;
    private final StockTransactionRepository transactionRepository;
    private final StockAlertRepository alertRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryDTO getSummary() {
        // Index-friendly date boundaries
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);

        Long totalProducts = productRepository.countAllActiveProducts();
        Long belowThreshold = productRepository.countProductsBelowThreshold();
        BigDecimal todaySales = transactionRepository
                .getTodayTotalSales(startOfDay, endOfDay);
        Long activeAlerts = alertRepository.countOpenAlerts();

        return DashboardSummaryDTO.builder()
                .totalProducts(totalProducts)
                .productsBelowThreshold(belowThreshold)
                .totalSalesToday(todaySales)
                .activeAlerts(activeAlerts)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TopLowStockDTO> getTopLowStockProducts() {
        return productRepository
                .findTop5LowStockProducts(PageRequest.of(0, 5))
                .stream()
                .map(p -> TopLowStockDTO.builder()
                        .productName(p.getName())
                        .sku(p.getSku())
                        .currentStock(p.getCurrentStock())
                        .threshold(p.getLowStockThreshold())
                        .supplierName(p.getSupplier().getName())
                        .categoryName(p.getCategory().getName())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockMovementDTO> getStockMovementsLast7Days() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        return transactionRepository
                .getStockMovementsLast7Days(sevenDaysAgo)
                .stream()
                .map(p -> {
                    // ✅ Safe conversion — LocalDate to String
                    String dateStr = p.getMovementDate() != null
                            ? p.getMovementDate().format(formatter)
                            : "Unknown";

                    long unitsIn = p.getUnitsIn() != null ? p.getUnitsIn() : 0L;
                    long unitsOut = p.getUnitsOut() != null ? p.getUnitsOut() : 0L;

                    return StockMovementDTO.builder()
                            .date(dateStr)
                            .unitsIn(unitsIn)
                            .unitsOut(unitsOut)
                            .netMovement(unitsIn - unitsOut)
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierPerformanceDTO> getSupplierPerformance() {
        return productRepository.getSupplierPerformance()
                .stream()
                .map(p -> {
                    double alertRate = p.getTotalProducts() > 0
                            ? (p.getLowStockCount() * 100.0) / p.getTotalProducts()
                            : 0.0;

                    return SupplierPerformanceDTO.builder()
                            .supplierName(p.getSupplierName())
                            .totalProducts(p.getTotalProducts())
                            .lowStockCount(p.getLowStockCount())
                            .alertRate(String.format("%.1f%%", alertRate))
                            .build();
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryDistributionDTO> getCategoryDistribution() {
        List<CategoryDistributionProjection> raw =
                productRepository.getCategoryDistribution();

        // Calculate total stock across all categories for percentage
        long grandTotal = raw.stream()
                .mapToLong(CategoryDistributionProjection::getTotalStock)
                .sum();

        return raw.stream()
                .map(p -> {
                    double percentage = grandTotal > 0
                            ? (p.getTotalStock() * 100.0) / grandTotal
                            : 0.0;

                    return CategoryDistributionDTO.builder()
                            .categoryName(p.getCategoryName())
                            .totalProducts(p.getTotalProducts())
                            .totalStock(p.getTotalStock())
                            .percentage(Math.round(percentage * 10.0) / 10.0)
                            .build();
                })
                .toList();
    }
}
