package com.example.Inventra.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "import_job_errors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportJobError {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "import_job_id", nullable = false)
    private ImportJob importJob;

    @Column(name = "row_num", nullable = false)
    private Integer rowNumber;

    @Column(name = "sku", length = 50)
    private String sku;

    @Column(name = "tx_type", length = 30)
    private String transactionType;

    @Column(name = "qty")
    private Integer quantity;

    @Column(name = "error_message", nullable = false, length = 255)
    private String errorMessage;
}
