package com.example.Inventra.service;

import com.example.Inventra.dto.SupplierRequestDTO;
import com.example.Inventra.dto.SupplierResponseDTO;
import com.example.Inventra.dto.ProductResponseDTO;

import java.util.List;

public interface SupplierService {
    SupplierResponseDTO createSupplier(SupplierRequestDTO request);
    SupplierResponseDTO getSupplierById(Long id);
    List<SupplierResponseDTO> getAllSuppliers();
    SupplierResponseDTO updateSupplier(Long id, SupplierRequestDTO request);
    void deactivateSupplier(Long id);
    List<ProductResponseDTO> getProductsBySupplier(Long supplierId);
}
