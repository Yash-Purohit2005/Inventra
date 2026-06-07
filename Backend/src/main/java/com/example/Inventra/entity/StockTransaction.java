package com.example.Inventra.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "stock_transactions",
        indexes = {
                @Index(name = "idx_tx_product_id", columnList = "product_id"),
                @Index(name = "idx_tx_created_at", columnList = "created_at")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // For JPA
@AllArgsConstructor
@Builder
@ToString(exclude = "product") // Prevents circular reference loops
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class StockTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    // 🏆 GOLDMINE: Lazy fetch prevents performance drag on massive table reads
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false, updatable = false)
    private Product product;

    @NotNull(message = "Transaction type is required")
    @Column(nullable = false, length = 20, updatable = false)
    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @NotNull(message = "Transaction quantity is required")
    @Min(value = 1, message = "Transaction quantity must be at least 1")
    @Column(nullable = false, updatable = false)
    private Integer quantity;

    @NotBlank(message = "Operator identity is required")
    @Column(name = "performed_by", nullable = false, length = 50, updatable = false)
    private String performedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;
}
