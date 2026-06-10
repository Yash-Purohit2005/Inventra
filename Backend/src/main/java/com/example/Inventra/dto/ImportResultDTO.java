package com.example.Inventra.dto;

import com.example.Inventra.entity.ImportStatus;

import java.util.List;

public record ImportResultDTO(
        Long importJobId,
        String filename,
        int totalRowsProcessed,
        int successCount,
        int failureCount,
        ImportStatus status,
        List<RowError> errors
) {}
