package com.example.Inventra.entity;

public enum TransactionType {
        INITIAL,
        RESTOCK,            // Regular inventory arrivals or supplier restocking
        SALE,                // Standard customer sales reductions
        ADJUSTMENT_ADD,      // Manual inventory corrections that INCREASE stock numbers
        ADJUSTMENT_SUBTRACT  // Manual inventory corrections that DECREASE stock numbers (e.g., damaged items)

}
