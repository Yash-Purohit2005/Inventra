package com.example.Inventra.specification;

import com.example.Inventra.dto.TransactionFilterRequest;
import com.example.Inventra.entity.StockTransaction;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class TransactionSpecification {

    // Private constructor — utility class, not instantiable
    private TransactionSpecification() {}

    public static Specification<StockTransaction> withFilters(
            TransactionFilterRequest filter) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Filter by product ID
            if (filter.getProductId() != null) {
                predicates.add(cb.equal(
                        root.get("product").get("id"),
                        filter.getProductId()
                ));
            }

            // Filter by transaction type
            if (filter.getType() != null) {
                predicates.add(cb.equal(
                        root.get("type"),
                        filter.getType()
                ));
            }

            // Filter by start date — beginning of day
            if (filter.getStartDate() != null) {
                LocalDateTime startOfDay = filter.getStartDate()
                        .atStartOfDay();
                predicates.add(cb.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        startOfDay
                ));
            }

            // Filter by end date — end of day
            // Timezone fix — push to 23:59:59 so full day is included
            if (filter.getEndDate() != null) {
                LocalDateTime endOfDay = filter.getEndDate()
                        .atTime(23, 59, 59);
                predicates.add(cb.lessThanOrEqualTo(
                        root.get("createdAt"),
                        endOfDay
                ));
            }

            // Always sort newest first
            query.orderBy(cb.desc(root.get("createdAt")));

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}