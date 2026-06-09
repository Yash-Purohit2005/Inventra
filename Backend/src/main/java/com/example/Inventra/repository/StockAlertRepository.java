package com.example.Inventra.repository;

import com.example.Inventra.entity.AlertStatus;
import com.example.Inventra.entity.StockAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockAlertRepository extends JpaRepository<StockAlert, Long> {

    Optional<StockAlert> findByProduct_IdAndStatus(Long productId, AlertStatus status);

    @Query("""
        SELECT a FROM StockAlert a
        JOIN FETCH a.product p
        JOIN FETCH p.category
        JOIN FETCH p.supplier
        WHERE a.status = :status
        ORDER BY a.createdAt DESC
    """)
    List<StockAlert> findAllByStatusWithProduct(@Param("status") AlertStatus status);

    @Query("""
        SELECT a FROM StockAlert a
        JOIN FETCH a.product p
        JOIN FETCH p.category
        JOIN FETCH p.supplier
        WHERE a.product.id = :productId
        ORDER BY a.createdAt DESC
    """)
    List<StockAlert> findByProductIdWithRelations(@Param("productId") Long productId);

    // Active open alerts count
    @Query("SELECT COUNT(a) FROM StockAlert a WHERE a.status = 'OPEN'")
    Long countOpenAlerts();
}