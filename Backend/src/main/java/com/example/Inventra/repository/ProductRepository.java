package com.example.Inventra.repository;

import com.example.Inventra.dto.projection.CategoryDistributionProjection;
import com.example.Inventra.dto.projection.SupplierPerformanceProjection;
import com.example.Inventra.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

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

    @Query("""
    SELECT p FROM Product p
    JOIN FETCH p.category
    JOIN FETCH p.supplier
    WHERE p.isActive = true
""")
    List<Product> findAllActiveWithRelations();

    boolean existsBySku(String sku);

    // Total active products count — single aggregate query
    @Query("SELECT COUNT(p) FROM Product p WHERE p.isActive = true")
    Long countAllActiveProducts();

    // Products below threshold count — single aggregate query
    @Query("""
    SELECT COUNT(p) FROM Product p
    WHERE p.isActive = true
    AND p.currentStock <= p.lowStockThreshold
""")
    Long countProductsBelowThreshold();

    // Top 5 critical products — ordered by stock level
    @Query("""
    SELECT p FROM Product p
    JOIN FETCH p.category
    JOIN FETCH p.supplier
    WHERE p.isActive = true
    AND p.currentStock <= p.lowStockThreshold
    ORDER BY p.currentStock ASC
""")
    List<Product> findTop5LowStockProducts(Pageable pageable);

    // Category distribution — aggregate per category
    @Query("""
    SELECT p.category.name AS categoryName,
           COUNT(p) AS totalProducts,
           SUM(p.currentStock) AS totalStock
    FROM Product p
    WHERE p.isActive = true
    GROUP BY p.category.name
    ORDER BY totalStock DESC
""")
    List<CategoryDistributionProjection> getCategoryDistribution();

    // Supplier performance — join with alert count
    @Query("""
    SELECT p.supplier.name AS supplierName,
           COUNT(p) AS totalProducts,
           SUM(CASE WHEN p.currentStock <= p.lowStockThreshold
               THEN 1 ELSE 0 END) AS lowStockCount
    FROM Product p
    WHERE p.isActive = true
    GROUP BY p.supplier.name
    ORDER BY lowStockCount DESC
""")
    List<SupplierPerformanceProjection> getSupplierPerformance();

    @Query("""
    SELECT p FROM Product p
    JOIN FETCH p.category
    JOIN FETCH p.supplier
    WHERE p.sku IN :skus
    AND p.isActive = true
""")
    List<Product> findAllBySkuInWithRelations(@Param("skus") Set<String> skus);
}
