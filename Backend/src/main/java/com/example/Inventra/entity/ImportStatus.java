package com.example.Inventra.entity;

// TODO: Add PROCESSING status when CSV import
// is moved to async background job processing
public enum ImportStatus {
    SUCCESS,        // All rows imported successfully
    PARTIAL,        // Some rows failed, some succeeded
    FAILED          // All rows failed or file invalid
}
