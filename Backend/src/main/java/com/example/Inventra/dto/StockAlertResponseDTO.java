package com.example.Inventra.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class StockAlertResponseDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private String categoryName;
    private String supplierName;
    private Integer currentStock;
    private Integer threshold;
    private String status;
    private String resolvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}