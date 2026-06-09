package com.example.Inventra.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StockMovementDTO {
    private String date;
    private Long unitsIn;
    private Long unitsOut;
    private Long netMovement;       // ← unitsIn - unitsOut
}
