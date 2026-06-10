package com.example.Inventra.dto;

public record RowError(
        int rowNumber,
        String sku,
        String transactionType,
        Integer quantity,
        String errorMessage
) {}
