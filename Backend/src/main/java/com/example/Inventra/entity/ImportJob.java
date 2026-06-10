package com.example.Inventra.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "import_jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportJob {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "filename", nullable = false)
    private String filename;

    @Column(name = "uploaded_by", nullable = false)
    private String uploadedBy;

    @Column(name = "total_rows", nullable = false)
    private Integer totalRows;

    @Column(name = "success_rows", nullable = false)
    private Integer successRows;

    @Column(name = "failed_rows", nullable = false)
    private Integer failedRows;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ImportStatus status;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false, nullable = false)
    private LocalDateTime uploadedAt;

    @Column(name = "unique_skus")
    private Integer uniqueSkus;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
