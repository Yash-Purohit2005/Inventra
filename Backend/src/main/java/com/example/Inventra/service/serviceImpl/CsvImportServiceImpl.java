package com.example.Inventra.service.serviceImpl;

import com.example.Inventra.dto.ImportResultDTO;
import com.example.Inventra.dto.RowError;
import com.example.Inventra.entity.*;
import com.example.Inventra.exception.InvalidFileException;
import com.example.Inventra.repository.ImportJobErrorRepository;
import com.example.Inventra.repository.ImportJobRepository;
import com.example.Inventra.repository.ProductRepository;
import com.example.Inventra.repository.StockTransactionRepository;
import com.example.Inventra.service.AlertService;
import com.example.Inventra.service.CsvImportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CsvImportServiceImpl implements CsvImportService {

    private final ProductRepository productRepository;
    private final StockTransactionRepository transactionRepository;
    private final ImportJobRepository importJobRepository;
    private final AlertService alertService;
    private final ImportJobErrorRepository importJobErrorRepository;


    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String[] EXPECTED_HEADERS =
            {"sku", "transactiontype", "quantity"};

    @Override
    @Transactional
    public ImportResultDTO importTransactionsCsv(MultipartFile file,
                                                 String operator) throws IOException {

        validateFile(file);

        BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()));

        // ── STAGE 1: Header Validation ────────────────────────────
        String headerLine = reader.readLine();
        validateHeaders(headerLine);

        // ── STAGE 2: Read All Lines First ─────────────────────────
        // TODO: For files > 10MB, switch to streaming approach
        // using BufferedReader.readLine() to avoid loading
        // entire file into memory
        List<String> lines = new ArrayList<>();
        String line;
        while ((line = reader.readLine()) != null) {
            if (!line.trim().isEmpty()) {
                lines.add(line);
            }
        }

        // ── STAGE 3: Collect All SKUs — ONE DB Query ──────────────
        Set<String> skus = new HashSet<>();
        for (String row : lines) {
            String[] columns = parseCsvLine(row);
            if (columns.length >= 1) {
                skus.add(columns[0].trim().toUpperCase());
            }
        }

        // Single query — loads ALL products needed for this import
        Map<String, Product> productCache = productRepository
                .findAllBySkuInWithRelations(skus)
                .stream()
                .collect(Collectors.toMap(Product::getSku, p -> p));

        // ── STAGE 4: Process Rows ─────────────────────────────────
        List<RowError> errors = new ArrayList<>();
        List<StockTransaction> validTransactions = new ArrayList<>();
        Map<String, Integer> virtualInventory = new HashMap<>();
        LocalDateTime importStartedAt = LocalDateTime.now();

        int rowNumber = 1;
        int successCount = 0;

        for (String row : lines) {
            rowNumber++;
            String[] columns = parseCsvLine(row);

            if (columns.length < 3) {
                errors.add(new RowError(rowNumber, "UNKNOWN", "UNKNOWN",
                        null, "Invalid format — expected 3 columns"));
                continue;
            }

            String sku = columns[0].trim().toUpperCase();
            String typeStr = columns[1].trim().toUpperCase();
            String quantityStr = columns[2].trim();


            // Quantity validation
            Integer quantity;
            try {
                quantity = Integer.parseInt(quantityStr);
                if (quantity <= 0) {
                    errors.add(new RowError(rowNumber, sku, typeStr,
                            quantity, "Quantity must be greater than zero"));
                    continue;
                }
            } catch (NumberFormatException e) {
                errors.add(new RowError(rowNumber, sku, typeStr,
                        null, "Invalid quantity — must be a number"));
                continue;
            }

            // TransactionType validation
            TransactionType txType;
            try {
                txType = TransactionType.valueOf(typeStr);
                if (txType == TransactionType.INITIAL) {
                    errors.add(new RowError(rowNumber, sku, typeStr,
                            quantity, "INITIAL type cannot be imported"));
                    continue;
                }
            } catch (IllegalArgumentException e) {
                errors.add(new RowError(rowNumber, sku, typeStr,
                        quantity, "Invalid transaction type: " + typeStr));
                continue;
            }

            // SKU lookup from cache — zero DB queries
            Product product = productCache.get(sku);
            if (product == null) {
                errors.add(new RowError(rowNumber, sku, typeStr,
                        quantity, "SKU not found or inactive: " + sku));
                continue;
            }

            // Stock simulation
            int virtualStock = virtualInventory.getOrDefault(
                    sku, product.getCurrentStock());

            if (txType == TransactionType.SALE ||
                    txType == TransactionType.ADJUSTMENT_SUBTRACT) {
                if (virtualStock < quantity) {
                    errors.add(new RowError(rowNumber, sku, typeStr,
                            quantity,
                            String.format("Insufficient stock. " +
                                    "Available after previous rows: %d, " +
                                    "Requested: %d", virtualStock, quantity)));
                    continue;
                }
                virtualInventory.put(sku, virtualStock - quantity);
            } else {
                virtualInventory.put(sku, virtualStock + quantity);
            }

            validTransactions.add(StockTransaction.builder()
                    .product(product)
                    .type(txType)
                    .quantity(quantity)
                    .performedBy(operator)
                    .build());

            successCount++;
        }

        // ── STAGE 5: Batch Save Transactions ──────────────────────
        // Collect products that need alert checking
        List<Product> productsToCheck = new ArrayList<>();

        if (!validTransactions.isEmpty()) {
            transactionRepository.saveAll(validTransactions);
            log.info("CSV_BATCH_SAVED: {} transactions", validTransactions.size());

            // Update stock using productCache — no extra DB queries


            virtualInventory.forEach((sku, newStock) -> {
                Product product = productCache.get(sku);
                if (product != null) {
                    product.setCurrentStock(newStock);
                    productsToCheck.add(product);
                }
            });

            // Single batch save — replaces 1000 individual saves
            List<Product> updatedProducts = productRepository.saveAll(productsToCheck);

            // Register alert checks after transaction commits
            // Prevents alert rollback from affecting stock saves
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            updatedProducts.forEach(alertService::checkAndFireAlert);
                        }
                    }
            );
        }

        // ── STAGE 6: Determine Status ─────────────────────────────
        ImportStatus status;
        if (errors.isEmpty()) {
            status = ImportStatus.SUCCESS;
        } else if (successCount > 0) {
            status = ImportStatus.PARTIAL;
        } else {
            status = ImportStatus.FAILED;
        }

        // ── STAGE 7: Save ImportJob ───────────────────────────────
        ImportJob importJob = ImportJob.builder()
                .filename(file.getOriginalFilename())
                .uploadedBy(operator)
                .totalRows(lines.size())
                .successRows(successCount)
                .failedRows(errors.size())
                .uniqueSkus(virtualInventory.size())
                .status(status)
                .startedAt(importStartedAt)
                .completedAt(LocalDateTime.now())
                .build();

        ImportJob saved = importJobRepository.save(importJob);

        // ── STAGE 8: Save Error Rows ──────────────────────────────
        if (!errors.isEmpty()) {
            List<ImportJobError> errorEntities = errors.stream()
                    .map(e -> ImportJobError.builder()
                            .importJob(saved)
                            .rowNumber(e.rowNumber())
                            .sku(e.sku())
                            .transactionType(e.transactionType())
                            .quantity(e.quantity())
                            .errorMessage(e.errorMessage())
                            .build())
                    .toList();
            importJobErrorRepository.saveAll(errorEntities);
        }

        log.info("IMPORT_COMPLETE: file=[{}] total=[{}] success=[{}] failed=[{}]",
                file.getOriginalFilename(), lines.size(), successCount, errors.size());

        return new ImportResultDTO(
                saved.getId(),
                file.getOriginalFilename(),
                lines.size(),
                successCount,
                errors.size(),
                status,
                errors
        );
    }

    @Override
    public void downloadErrorReport(Long importJobId,
                                    HttpServletResponse response) throws IOException {

        List<ImportJobError> errorRows = importJobErrorRepository
                .findAllByImportJob_IdOrderByRowNumberAsc(importJobId);

        response.setContentType("text/csv");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Content-Disposition",
                "attachment; filename=error-report-" + importJobId + ".csv");

        PrintWriter writer = response.getWriter();
        writer.println("Row,SKU,TransactionType,Quantity,Error");

        if (errorRows.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }

        errorRows.forEach(e -> writer.println(
                escapeCsv(String.valueOf(e.getRowNumber())) + "," +
                        escapeCsv(e.getSku()) + "," +
                        escapeCsv(e.getTransactionType()) + "," +
                        escapeCsv(e.getQuantity() != null ?
                                String.valueOf(e.getQuantity()) : "") + "," +
                        escapeCsv(e.getErrorMessage())
        ));

        writer.flush();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") ||
                value.contains("\n")) {
            value = value.replace("\"", "\"\"");
            return "\"" + value + "\"";
        }
        return value;
    }

    @Override
    public Object getImportHistory() {
        return importJobRepository.findAllByOrderByUploadedAtDesc();
    }

    // ── Private Helpers ───────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidFileException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidFileException(
                    "File exceeds 10MB limit. Size: " +
                            (file.getSize() / 1024 / 1024) + "MB");
        }

        // Check filename extension — more reliable than content type
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
            throw new InvalidFileException(
                    "Invalid file type. Only .csv files accepted.");
        }
    }

    private void validateHeaders(String headerLine) {
        if (headerLine == null || headerLine.trim().isEmpty()) {
            throw new InvalidFileException("CSV file is empty or missing headers");
        }

        String[] headers = headerLine.toLowerCase().split(",");
        for (int i = 0; i < EXPECTED_HEADERS.length; i++) {
            if (i >= headers.length ||
                    !headers[i].trim().equals(EXPECTED_HEADERS[i])) {
                throw new InvalidFileException(
                        "Invalid CSV headers. Expected: sku,transactionType,quantity" +
                                " but found: " + headerLine);
            }
        }
    }

    private String[] parseCsvLine(String line) {
        // Handle quoted values containing commas
        List<String> columns = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder current = new StringBuilder();

        for (char c : line.toCharArray()) {
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                columns.add(current.toString());
                current = new StringBuilder();
            } else {
                current.append(c);
            }
        }
        columns.add(current.toString());
        return columns.toArray(new String[0]);
    }
}
