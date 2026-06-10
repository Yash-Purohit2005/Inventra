package com.example.Inventra.controller;

import com.example.Inventra.dto.ImportResultDTO;
import com.example.Inventra.service.CsvImportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/csv")
@RequiredArgsConstructor
public class CsvImportController {

    private final CsvImportService csvImportService;


    // TODO: Replace @RequestParam operator with JWT Principal
    // String operator = authentication.getName();
    @PostMapping("/import")
    public ResponseEntity<ImportResultDTO> importCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("operator") String operator) throws IOException {
        return ResponseEntity.ok(
                csvImportService.importTransactionsCsv(file, operator));
    }

    @GetMapping("/import/history")
    public ResponseEntity<Object> getImportHistory() {
        return ResponseEntity.ok(csvImportService.getImportHistory());
    }

    @GetMapping("/import/errors/{importJobId}")
    public void downloadErrorReport(
            @PathVariable Long importJobId,
            HttpServletResponse response) throws IOException {
        csvImportService.downloadErrorReport(importJobId, response);
    }
}
