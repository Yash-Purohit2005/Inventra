package com.example.Inventra.repository;

import com.example.Inventra.entity.ImportJobError;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportJobErrorRepository extends JpaRepository<ImportJobError, Long> {
    List<ImportJobError> findAllByImportJob_IdOrderByRowNumberAsc(Long importJobId);
}
