package com.example.Inventra.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryDistributionDTO {
    private String categoryName;
    private Long totalProducts;
    private Long totalStock;
    private Double percentage;
}
