package com.skillinfinity.payment.service.impl;

import com.skillinfinity.payment.dto.response.CreditPackageResponse;
import com.skillinfinity.payment.entity.CreditPackage;
import com.skillinfinity.payment.repository.CreditPackageRepository;
import com.skillinfinity.payment.service.CreditPackageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreditPackageServiceImpl implements CreditPackageService {

    private final CreditPackageRepository creditPackageRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CreditPackageResponse> getActivePackages() {
        return creditPackageRepository.findByIsActiveTrueOrderBySortOrderAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    private CreditPackageResponse toResponse(CreditPackage pkg) {
        return CreditPackageResponse.builder()
                .code(pkg.getCode())
                .name(pkg.getName())
                .credits(pkg.getCredits())
                .price(pkg.getPrice())
                .currency(pkg.getCurrency())
                .highlighted("popular".equalsIgnoreCase(pkg.getCode()))
                .features(features(pkg))
                .active(pkg.getIsActive())
                .build();
    }

    private List<String> features(CreditPackage pkg) {
        String base = pkg.getCredits().stripTrailingZeros().toPlainString()
                + " credits · " + minutes(pkg.getCredits()) + " minutes of learning";
        return List.of(
                base,
                "1 credit = 10 minutes",
                "Added to your wallet instantly",
                "Pay securely with Razorpay (UPI / cards / net banking)");
    }

    private String minutes(java.math.BigDecimal credits) {
        return credits.multiply(java.math.BigDecimal.TEN).stripTrailingZeros().toPlainString();
    }
}
