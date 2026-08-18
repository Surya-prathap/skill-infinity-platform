package com.skillinfinity.payment.service;

import com.skillinfinity.payment.dto.response.CreditPackageResponse;

import java.util.List;

public interface CreditPackageService {

    /** All active packages, cheapest first. */
    List<CreditPackageResponse> getActivePackages();
}
