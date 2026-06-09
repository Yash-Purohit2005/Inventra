package com.example.Inventra.service;

import com.example.Inventra.dto.ProductCreateRequest;
import com.example.Inventra.dto.ProductResponseDTO;
import com.example.Inventra.dto.TransactionFilterRequest;
import com.example.Inventra.dto.TransactionResponseDTO;
import com.example.Inventra.entity.TransactionType;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.io.IOException;
import java.util.List;

public interface InventoryService {


    // 👑 FIXED: Returns the explicit transaction record directly
    TransactionResponseDTO adjustStock(String sku, Integer quantity, TransactionType type, String operator);

    // 👑 FIXED: Service layer handles mapping safely inside the open transaction session
    Page<TransactionResponseDTO> getTransactionHistory(Pageable pageable);

    Page<TransactionResponseDTO> getProductTransactionHistory(Long productId, Pageable pageable);

    Page<TransactionResponseDTO> getFilteredTransactions(TransactionFilterRequest filter, Pageable pageable);

    void exportTransactionsCsv(TransactionFilterRequest filter, HttpServletResponse response) throws IOException;
}