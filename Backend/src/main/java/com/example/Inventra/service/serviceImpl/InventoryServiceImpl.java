package com.example.Inventra.service.serviceImpl;

import com.example.Inventra.dto.TransactionFilterRequest;
import com.example.Inventra.dto.TransactionResponseDTO;
import com.example.Inventra.entity.Product;
import com.example.Inventra.mapper.InventoryMapper;
import com.example.Inventra.service.AlertService;
import com.example.Inventra.service.InventoryService;
import com.example.Inventra.entity.StockTransaction;
import com.example.Inventra.entity.TransactionType;

import com.example.Inventra.exception.InsufficientStockException;
import com.example.Inventra.exception.ResourceNotFoundException;
import com.example.Inventra.repository.ProductRepository;
import com.example.Inventra.repository.StockTransactionRepository;
import com.example.Inventra.specification.TransactionSpecification;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.PrintWriter;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryServiceImpl implements InventoryService {

    private final ProductRepository productRepository;
    private final StockTransactionRepository transactionRepository;
    private final InventoryMapper inventoryMapper;
    private final AlertService alertService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TransactionResponseDTO adjustStock(String sku, Integer quantity, TransactionType txType, String operator) {
        log.info("Processing stock adjustment for SKU: [{}], Type: [{}], Quantity: [{}] by: [{}]",
                sku, txType, quantity, operator);

        String normalizedSku = sku.trim().toUpperCase();

        Product product = productRepository.findBySkuWithRelations(normalizedSku)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active product not found for SKU: " + normalizedSku));

        int currentStock = product.getCurrentStock();

        // ✅ FIX: adjustedStock computed inside expression switch — always initialized,
        // compiler guarantees every enum case is covered, no default needed
        int adjustedStock = switch (txType) {
            case RESTOCK, ADJUSTMENT_ADD -> currentStock + quantity;

            case SALE, ADJUSTMENT_SUBTRACT -> {
                if (currentStock < quantity) {
                    throw new InsufficientStockException(
                            String.format("Insufficient stock for SKU: %s. Requested: %d, Available: %d",
                                    normalizedSku, quantity, currentStock)
                    );
                }
                yield currentStock - quantity;
            }

            // INITIAL is a system-only type written during createProduct.
            // It should never arrive through the adjustStock endpoint.
            case INITIAL -> throw new IllegalArgumentException(
                    "INITIAL transaction type cannot be used for stock adjustments. SKU: " + normalizedSku);
        };

        product.setCurrentStock(adjustedStock);

        // Optimistic lock: concurrent save on stale version triggers
        // ObjectOptimisticLockingFailureException — handled in GlobalExceptionHandler
        Product updatedProduct = productRepository.save(product);

        StockTransaction logEntry = StockTransaction.builder()
                .product(updatedProduct)
                .type(txType)
                .quantity(quantity)
                .performedBy(operator)
                .build();

        StockTransaction savedTx = transactionRepository.save(logEntry);

            alertService.checkAndFireAlert(updatedProduct);


        return inventoryMapper.toTransactionDTO(savedTx);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponseDTO> getTransactionHistory(Pageable pageable) {
        return transactionRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(inventoryMapper::toTransactionDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponseDTO> getProductTransactionHistory(Long productId, Pageable pageable) {
        return transactionRepository.findByProduct_IdOrderByCreatedAtDesc(productId, pageable)
                .map(inventoryMapper::toTransactionDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionResponseDTO> getFilteredTransactions(
            TransactionFilterRequest filter, Pageable pageable) {

        return transactionRepository
                .findAll(TransactionSpecification.withFilters(filter), pageable)
                .map(inventoryMapper::toTransactionDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public void exportTransactionsCsv(TransactionFilterRequest filter,
                                      HttpServletResponse response) throws IOException {

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition",
                "attachment; filename=transactions.csv");

        PrintWriter writer = response.getWriter();

        // CSV header
        writer.println("ID,Product,SKU,Type,Quantity,Performed By,Date");

        // TODO: For massive audit trails (1M+ rows), consider switching
        // List<StockTransaction> to Stream<StockTransaction> with
        // @QueryHints(@QueryHint(name = HINT_FETCH_SIZE, value = "50"))
        // to enable lazy database cursor streaming and reduce memory pressure
        //----------------------------------------------------------------------
        // Stream directly — no Page object, no in-memory collection
        // Processes and writes each row immediately to the HTTP response stream
        transactionRepository
                .findAll(TransactionSpecification.withFilters(filter),
                        Sort.by(Sort.Direction.DESC, "createdAt"))
                .forEach(tx -> {
                    writer.println(buildCsvRow(tx));
                    writer.flush(); // flush after each row — true streaming
                });
    }

    private String buildCsvRow(StockTransaction tx) {
        return escapeCsv(String.valueOf(tx.getId())) + "," +
                escapeCsv(tx.getProduct().getName()) + "," +
                escapeCsv(tx.getProduct().getSku()) + "," +
                escapeCsv(tx.getType().name()) + "," +
                escapeCsv(String.valueOf(tx.getQuantity())) + "," +
                escapeCsv(tx.getPerformedBy()) + "," +
                escapeCsv(tx.getCreatedAt().toString());
    }

    private String escapeCsv(String value) {
        if (value == null) return "";

        // If value contains comma, newline, or quote — wrap in quotes
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            // Escape any existing quotes by doubling them
            value = value.replace("\"", "\"\"");
            return "\"" + value + "\"";
        }
        return value;
    }
}