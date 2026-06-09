package com.example.Inventra.dto.projection;

import java.time.LocalDate;

public interface StockMovementProjection {
    LocalDate getMovementDate();
    Long getUnitsIn();
    Long getUnitsOut();
}
