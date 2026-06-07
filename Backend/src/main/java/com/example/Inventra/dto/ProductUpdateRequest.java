package com.example.Inventra.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductUpdateRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;


    @NotNull(message = "Low stock threshold is required")
    @Min(value = 0, message = "Threshold cannot be negative")
    private Integer lowStockThreshold;

    // Optional — manager can reclassify product or change supplier
    private Long categoryId;
    private Long supplierId;
}