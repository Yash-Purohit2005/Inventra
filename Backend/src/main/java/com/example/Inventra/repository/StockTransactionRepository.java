package com.example.Inventra.repository;

import com.example.Inventra.dto.projection.StockMovementProjection;
import com.example.Inventra.entity.StockTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    // FIXED: Explicitly added sorting to the JPQL string since method name derivation is ignored here
    @Query(value = """
           SELECT tx FROM StockTransaction tx 
           JOIN FETCH tx.product 
           ORDER BY tx.createdAt DESC
           """,
            countQuery = "SELECT COUNT(tx) FROM StockTransaction tx")
    Page<StockTransaction> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // FIXED: Explicitly added sorting for the product-specific history lookup stream
    @Query(value = """
           SELECT tx FROM StockTransaction tx 
           JOIN FETCH tx.product 
           WHERE tx.product.id = :productId 
           ORDER BY tx.createdAt DESC
           """,
            countQuery = "SELECT COUNT(tx) FROM StockTransaction tx WHERE tx.product.id = :productId")
    Page<StockTransaction> findByProduct_IdOrderByCreatedAtDesc(@Param("productId") Long productId, Pageable pageable);

    // Today's total sales value
    @Query("""
    SELECT COALESCE(SUM(p.price * t.quantity), 0)
    FROM StockTransaction t
    JOIN t.product p
    WHERE t.type = com.example.Inventra.entity.TransactionType.SALE
    AND t.createdAt >= :startOfDay
    AND t.createdAt < :endOfDay
""")
    BigDecimal getTodayTotalSales(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    // Stock movements last 7 days — split inbound/outbound
    @Query("""
    SELECT FUNCTION('DATE', t.createdAt) AS movementDate,
           SUM(CASE WHEN t.type IN (
               com.example.Inventra.entity.TransactionType.RESTOCK,
               com.example.Inventra.entity.TransactionType.ADJUSTMENT_ADD)
               THEN t.quantity ELSE 0 END) AS unitsIn,
           SUM(CASE WHEN t.type IN (
               com.example.Inventra.entity.TransactionType.SALE,
               com.example.Inventra.entity.TransactionType.ADJUSTMENT_SUBTRACT)
               THEN t.quantity ELSE 0 END) AS unitsOut
    FROM StockTransaction t
    WHERE t.createdAt >= :sevenDaysAgo
    GROUP BY FUNCTION('DATE', t.createdAt)
    ORDER BY FUNCTION('DATE', t.createdAt) ASC
""")
    List<StockMovementProjection> getStockMovementsLast7Days(
            @Param("sevenDaysAgo") LocalDateTime sevenDaysAgo);
}