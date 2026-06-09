package com.example.Inventra.controller;

import com.example.Inventra.dto.StockAdjustmentRequest;
import com.example.Inventra.dto.TransactionFilterRequest;
import com.example.Inventra.dto.TransactionResponseDTO;
import com.example.Inventra.service.InventoryService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionController {

    private final InventoryService inventoryService;

    @PostMapping("/adjust")
    public ResponseEntity<TransactionResponseDTO> adjustStock(@Valid @RequestBody StockAdjustmentRequest request) {
        // Enforced Enum type safety at the Spring MVC validation layer directly
        TransactionResponseDTO response = inventoryService.adjustStock(
                request.getSku(),
                request.getQuantity(),
                request.getType(),
                request.getOperator()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<Page<TransactionResponseDTO>> getTransactionHistory(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(inventoryService.getTransactionHistory(pageable));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<Page<TransactionResponseDTO>> getProductHistory(
            @PathVariable Long productId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(inventoryService.getProductTransactionHistory(productId, pageable));
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<TransactionResponseDTO>> getFilteredTransactions(
            TransactionFilterRequest filter,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(inventoryService
                .getFilteredTransactions(filter, pageable));
    }

    @GetMapping("/export")
    public void exportTransactionsCsv(
            TransactionFilterRequest filter,
            HttpServletResponse response) throws IOException {
        inventoryService.exportTransactionsCsv(filter, response);
    }
}
