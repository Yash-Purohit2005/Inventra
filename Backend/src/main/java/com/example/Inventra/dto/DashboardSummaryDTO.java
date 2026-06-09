package com.example.Inventra.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DashboardSummaryDTO {
    private Long totalProducts;
    private Long productsBelowThreshold;
    private BigDecimal totalSalesToday;
    private Long activeAlerts;
}