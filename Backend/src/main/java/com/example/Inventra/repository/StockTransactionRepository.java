package com.example.Inventra.repository;

import com.example.Inventra.entity.StockTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    // 🏆 FIXED: Explicitly added sorting to the JPQL string since method name derivation is ignored here
    @Query(value = """
           SELECT tx FROM StockTransaction tx 
           JOIN FETCH tx.product 
           ORDER BY tx.createdAt DESC
           """,
            countQuery = "SELECT COUNT(tx) FROM StockTransaction tx")
    Page<StockTransaction> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 🏆 FIXED: Explicitly added sorting for the product-specific history lookup stream
    @Query(value = """
           SELECT tx FROM StockTransaction tx 
           JOIN FETCH tx.product 
           WHERE tx.product.id = :productId 
           ORDER BY tx.createdAt DESC
           """,
            countQuery = "SELECT COUNT(tx) FROM StockTransaction tx WHERE tx.product.id = :productId")
    Page<StockTransaction> findByProduct_IdOrderByCreatedAtDesc(@Param("productId") Long productId, Pageable pageable);
}