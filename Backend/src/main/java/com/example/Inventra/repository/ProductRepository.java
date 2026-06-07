package com.example.Inventra.repository;

import com.example.Inventra.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {


    // Single product by ID — fetches category and supplier in one query
    @Query("""
        SELECT p FROM Product p
        JOIN FETCH p.category
        JOIN FETCH p.supplier
        WHERE p.id = :id AND p.isActive = true
    """)
    Optional<Product> findByIdWithRelations(@Param("id") Long id);

    // Single product by SKU — fetches category and supplier in one query
    @Query("""
        SELECT p FROM Product p
        JOIN FETCH p.category
        JOIN FETCH p.supplier
        WHERE p.sku = :sku AND p.isActive = true
    """)
    Optional<Product> findBySkuWithRelations(@Param("sku") String sku);

    // Paginated all active products — one join query, no N+1
    @Query(value = """
        SELECT p FROM Product p
        JOIN FETCH p.category
        JOIN FETCH p.supplier
        WHERE p.isActive = true
        """,
            countQuery = "SELECT COUNT(p) FROM Product p WHERE p.isActive = true")
    Page<Product> findAllActiveWithRelations(Pageable pageable);

    // Low stock dashboard — one join query
    @Query("""
        SELECT p FROM Product p
        JOIN FETCH p.category
        JOIN FETCH p.supplier
        WHERE p.isActive = true
        AND p.currentStock <= p.lowStockThreshold
        ORDER BY p.currentStock ASC
    """)
    List<Product> findLowStockItems();

    // Used in adjustStock — needs relations for mapper
    @Query("""
        SELECT p FROM Product p
        JOIN FETCH p.category
        JOIN FETCH p.supplier
        WHERE p.sku = :sku AND p.isActive = true
    """)
    Optional<Product> findBySkuAndIsActiveTrue(@Param("sku") String sku);

    @Query("""
    SELECT p FROM Product p
    JOIN FETCH p.category
    JOIN FETCH p.supplier
    WHERE p.category.id = :categoryId
    AND p.isActive = true
""")
    List<Product> findAllByCategoryIdAndIsActiveTrue(@Param("categoryId") Long categoryId);

    @Query("""
    SELECT p FROM Product p
    JOIN FETCH p.category
    JOIN FETCH p.supplier
    WHERE p.supplier.id = :supplierId
    AND p.isActive = true
""")
    List<Product> findAllBySupplierIdAndIsActiveTrue(@Param("supplierId") Long supplierId);

    boolean existsBySku(String sku);



}
