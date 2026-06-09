package com.example.Inventra.scheduler;

import com.example.Inventra.entity.Product;
import com.example.Inventra.repository.ProductRepository;
import com.example.Inventra.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LowStockScheduler {

    private final ProductRepository productRepository;
    private final AlertService alertService;

    @Scheduled(fixedRateString = "${app.scheduler.low-stock-scan-rate:3600000}")
    public void scanAllProductsForLowStock() {
        log.info("SCHEDULED_SCAN_START: Scanning all active products for low stock");

        // ✅ No @Transactional here — scheduler is a coordinator only
        // Each checkAndFireAlert runs its own isolated transaction
        List<Product> allProducts = productRepository.findAllActiveWithRelations();

        int scanned = 0;
        int alertsFired = 0;

        for (Product product : allProducts) {
            try {
                // Each call runs in its own transaction
                // If one product fails, others still succeed
                alertService.checkAndFireAlert(product);
                scanned++;

                if (product.getCurrentStock() <= product.getLowStockThreshold()) {
                    alertsFired++;
                }
            } catch (Exception e) {
                // Log failure but continue scanning remaining products
                log.error("SCHEDULED_SCAN_ERROR: SKU=[{}] reason=[{}]",
                        product.getSku(), e.getMessage());
            }
        }

        log.info("SCHEDULED_SCAN_COMPLETE: scanned=[{}] alertsFired=[{}]",
                scanned, alertsFired);
    }
}
