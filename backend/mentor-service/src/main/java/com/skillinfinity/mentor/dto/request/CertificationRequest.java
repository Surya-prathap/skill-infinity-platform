package com.skillinfinity.mentor.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CertificationRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Issuing organization is required")
    @Size(max = 200, message = "Issuing organization must not exceed 200 characters")
    private String issuingOrganization;

    @Size(max = 200, message = "Credential ID must not exceed 200 characters")
    private String credentialId;

    @Size(max = 500, message = "Credential URL must not exceed 500 characters")
    private String credentialUrl;

    private LocalDate issueDate;

    private LocalDate expiryDate;

    private boolean doesNotExpire;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 500, message = "File URL must not exceed 500 characters")
    private String fileUrl;

    private int sortOrder;
}
