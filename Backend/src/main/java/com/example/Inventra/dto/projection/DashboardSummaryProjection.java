package com.example.Inventra.dto.projection;

public interface DashboardSummaryProjection {
    Long getTotalProducts();
    Long getProductsBelowThreshold();
    Long getActiveAlerts();
}