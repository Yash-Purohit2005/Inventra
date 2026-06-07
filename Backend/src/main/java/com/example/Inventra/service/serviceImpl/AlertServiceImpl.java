package com.example.Inventra.service.serviceImpl;

import com.example.Inventra.dto.StockAlertResponseDTO;
import com.example.Inventra.entity.AlertStatus;
import com.example.Inventra.entity.Product;
import com.example.Inventra.entity.StockAlert;
import com.example.Inventra.exception.ResourceNotFoundException;
import com.example.Inventra.repository.StockAlertRepository;
import com.example.Inventra.service.AlertService;
import com.example.Inventra.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertServiceImpl implements AlertService {

    private final StockAlertRepository alertRepository;
    private final EmailService emailService;

    @Value("${app.alert.resolve-buffer:5}")
    private int resolveBuffer;

    @Override
    @Transactional
    public void checkAndFireAlert(Product product) {
        boolean isBelowThreshold = product.getCurrentStock()
                <= product.getLowStockThreshold();

        if (isBelowThreshold) {
            Optional<StockAlert> existingAlert = alertRepository
                    .findByProduct_IdAndStatus(product.getId(), AlertStatus.OPEN);

            if (existingAlert.isPresent()) {
                StockAlert alert = existingAlert.get();
                alert.setCurrentStock(product.getCurrentStock());
                alertRepository.save(alert);
                log.info("ALERT_UPDATED: SKU=[{}] currentStock=[{}]",
                        product.getSku(), product.getCurrentStock());

            } else {
                StockAlert alert = StockAlert.builder()
                        .product(product)
                        .currentStock(product.getCurrentStock())
                        .threshold(product.getLowStockThreshold())
                        .status(AlertStatus.OPEN)
                        .build();

                StockAlert saved = alertRepository.save(alert);

                log.warn("NEW_ALERT_FIRED: SKU=[{}] currentStock=[{}] threshold=[{}]",
                        product.getSku(),
                        product.getCurrentStock(),
                        product.getLowStockThreshold());

                // Map to DTO while still inside transaction
                StockAlertResponseDTO alertDTO = toResponseDTO(saved);

                // Fire email only after transaction commits successfully
                TransactionSynchronizationManager.registerSynchronization(
                        new TransactionSynchronization() {
                            @Override
                            public void afterCommit() {
                                emailService.sendLowStockAlert(alertDTO);
                            }
                        }
                );
            }

        } else {
            boolean safelyAboveThreshold = product.getCurrentStock()
                    >= product.getLowStockThreshold() + resolveBuffer;

            if (safelyAboveThreshold) {
                alertRepository
                        .findByProduct_IdAndStatus(product.getId(), AlertStatus.OPEN)
                        .ifPresent(alert -> {
                            alert.setStatus(AlertStatus.RESOLVED);
                            alert.setResolvedAt(LocalDateTime.now());
                            alert.setResolvedBy("SYSTEM");
                            alertRepository.save(alert);
                            log.info("ALERT_AUTO_RESOLVED: SKU=[{}] currentStock=[{}]",
                                    product.getSku(), product.getCurrentStock());
                        });
            }
        }
    }


    @Override
    @Transactional
    public void resolveAlert(Long productId, String resolvedBy) {
        StockAlert alert = alertRepository
                .findByProduct_IdAndStatus(productId, AlertStatus.OPEN)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No open alert found for product: " + productId));

        alert.setStatus(AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        alert.setResolvedBy(resolvedBy);
        alertRepository.save(alert);
        log.info("ALERT_MANUALLY_RESOLVED: productId=[{}] resolvedBy=[{}]",
                productId, resolvedBy);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockAlertResponseDTO> getOpenAlerts() {
        return alertRepository.findAllByStatusWithProduct(AlertStatus.OPEN)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockAlertResponseDTO> getAlertsByProduct(Long productId) {
        return alertRepository.findByProductIdWithRelations(productId)
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    private StockAlertResponseDTO toResponseDTO(StockAlert alert) {
        return StockAlertResponseDTO.builder()
                .id(alert.getId())
                .productId(alert.getProduct().getId())
                .productName(alert.getProduct().getName())
                .productSku(alert.getProduct().getSku())
                .categoryName(alert.getProduct().getCategory().getName())
                .supplierName(alert.getProduct().getSupplier().getName())
                .currentStock(alert.getCurrentStock())
                .threshold(alert.getThreshold())
                .status(alert.getStatus().name())
                .createdAt(alert.getCreatedAt())
                .resolvedAt(alert.getResolvedAt())
                .resolvedBy(alert.getResolvedBy())
                .build();
    }
}