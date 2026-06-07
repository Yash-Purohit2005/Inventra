package com.example.Inventra.service;

import com.example.Inventra.dto.StockAlertResponseDTO;
import com.example.Inventra.entity.Product;

import java.util.List;

public interface AlertService {
    void checkAndFireAlert(Product product);
    void resolveAlert(Long productId, String resolvedBy);
    List<StockAlertResponseDTO> getOpenAlerts();
    List<StockAlertResponseDTO> getAlertsByProduct(Long productId);
}