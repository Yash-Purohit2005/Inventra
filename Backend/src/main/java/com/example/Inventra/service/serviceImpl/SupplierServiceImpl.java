package com.example.Inventra.service.serviceImpl;

import com.example.Inventra.dto.ProductResponseDTO;
import com.example.Inventra.dto.SupplierRequestDTO;
import com.example.Inventra.dto.SupplierResponseDTO;
import com.example.Inventra.entity.Supplier;
import com.example.Inventra.exception.DuplicateSkuException;
import com.example.Inventra.exception.DuplicateSupplierException;
import com.example.Inventra.exception.ResourceNotFoundException;
import com.example.Inventra.mapper.InventoryMapper;
import com.example.Inventra.repository.ProductRepository;
import com.example.Inventra.repository.SupplierRepository;
import com.example.Inventra.service.SupplierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final InventoryMapper inventoryMapper;

    @Override
    @Transactional
    public SupplierResponseDTO createSupplier(SupplierRequestDTO request) {
        log.info("Creating new supplier: [{}]", request.getName());

        if (supplierRepository.existsByName(request.getName())) {
            throw new DuplicateSupplierException("Supplier already exists: " + request.getName());
        }

        Supplier supplier = Supplier.builder()
                .name(request.getName())
                .contactPerson(request.getContactPerson())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .address(request.getAddress())
                .isActive(true)
                .build();

        return toResponseDTO(supplierRepository.save(supplier));
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponseDTO getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SupplierResponseDTO> getAllSuppliers() {
        return supplierRepository.findAllByIsActiveTrue()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public SupplierResponseDTO updateSupplier(Long id, SupplierRequestDTO request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id));

        // Check name conflict only if name is actually changing
        if (!supplier.getName().equalsIgnoreCase(request.getName())
                && supplierRepository.existsByName(request.getName())) {
            throw new DuplicateSupplierException("Supplier already exists: " + request.getName());
        }

        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setContactEmail(request.getContactEmail());
        supplier.setContactPhone(request.getContactPhone());
        supplier.setAddress(request.getAddress());

        return toResponseDTO(supplierRepository.save(supplier));
    }

    @Override
    @Transactional
    public void deactivateSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id));

        supplier.setIsActive(false);
        supplierRepository.save(supplier);
        log.info("Supplier deactivated: id=[{}] name=[{}]", id, supplier.getName());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponseDTO> getProductsBySupplier(Long supplierId) {
        if (!supplierRepository.existsById(supplierId)) {
            throw new ResourceNotFoundException("Supplier not found: " + supplierId);
        }
        return productRepository.findAllBySupplierIdAndIsActiveTrue(supplierId)
                .stream()
                .map(inventoryMapper::toProductDTO)
                .toList();
    }

    private SupplierResponseDTO toResponseDTO(Supplier supplier) {
        return SupplierResponseDTO.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .contactEmail(supplier.getContactEmail())
                .contactPhone(supplier.getContactPhone())
                .address(supplier.getAddress())
                .isActive(supplier.getIsActive())
                .build();
    }
}