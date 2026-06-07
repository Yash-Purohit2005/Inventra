package com.example.Inventra.controller;

import com.example.Inventra.dto.StockAlertResponseDTO;
import com.example.Inventra.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<List<StockAlertResponseDTO>> getOpenAlerts() {
        return ResponseEntity.ok(alertService.getOpenAlerts());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<StockAlertResponseDTO>> getAlertsByProduct(
            @PathVariable Long productId) {
        return ResponseEntity.ok(alertService.getAlertsByProduct(productId));
    }

    // TODO: Replace @RequestParam resolvedBy with Principal
    // after Spring Security JWT is configured
    @PatchMapping("/resolve/{productId}")
    public ResponseEntity<Void> resolveAlert(
            @PathVariable Long productId,
            @RequestParam String resolvedBy) {
        alertService.resolveAlert(productId, resolvedBy);
        return ResponseEntity.noContent().build();
    }
}