package com.example.Inventra.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SupplierResponseDTO {
    private Long id;
    private String name;
    private String contactPerson;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private Boolean isActive;
}
