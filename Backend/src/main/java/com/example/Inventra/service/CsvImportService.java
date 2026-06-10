package com.example.Inventra.service;

import com.example.Inventra.dto.ImportResultDTO;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface CsvImportService {
    ImportResultDTO importTransactionsCsv(MultipartFile file,
                                          String operator) throws IOException;
    void downloadErrorReport(Long importJobId,
                             HttpServletResponse response) throws IOException;
    Object getImportHistory();
}