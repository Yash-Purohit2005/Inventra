package com.example.Inventra.dto;

import com.example.Inventra.entity.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StockAdjustmentRequest {

    @NotBlank(message = "Product SKU is required")
    private String sku;

    @NotNull(message = "Transaction quantity is required")
    @Min(value = 1, message = "Transaction quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Transaction type is required")
    private TransactionType type; // 👑 FIXED: Input validation maps straight to the Enum now!

    @NotBlank(message = "Operator identity is required")
    private String operator;
}