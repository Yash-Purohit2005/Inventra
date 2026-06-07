package com.example.Inventra.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponseDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private String type;
    private Integer quantity;
    private String performedBy;
    private LocalDateTime createdAt;
}
