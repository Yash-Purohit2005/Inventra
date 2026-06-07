package com.example.Inventra.repository;

import com.example.Inventra.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByName(String name);
    Optional<Category> findByNameIgnoreCase(String name);
    List<Category> findAllByIsActiveTrue();
}
