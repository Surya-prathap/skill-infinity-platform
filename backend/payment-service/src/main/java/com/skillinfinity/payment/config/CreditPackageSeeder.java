package com.skillinfinity.payment.config;

import com.skillinfinity.payment.entity.CreditPackage;
import com.skillinfinity.payment.repository.CreditPackageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Seeds the credit package catalog. Prices are backend-controlled (database),
 * so the frontend can never dictate how many credits a payment grants.
 *
 * <p>1 credit = 10 minutes. The pack price includes GST (e.g. 10 credits =
 * ₹109 = ₹10/credit + 9% GST, rounded to a clean number). Upserts by code on
 * every startup; inactive packs stay inactive.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CreditPackageSeeder implements CommandLineRunner {

    private final CreditPackageRepository creditPackageRepository;

    @Override
    public void run(String... args) {
        List<CreditPackage> packages = List.of(
                pkg("CREDIT_10", "Starter", "10", "109", 1, "10 credits · 100 minutes of learning"),
                pkg("CREDIT_30", "Popular", "30", "299", 2, "30 credits · 5 hours of learning"),
                pkg("CREDIT_60", "Value", "60", "549", 3, "60 credits · 10 hours of learning"));

        int created = 0;
        for (CreditPackage pkg : packages) {
            var existingOpt = creditPackageRepository.findByCode(pkg.getCode());
            if (existingOpt.isPresent()) {
                CreditPackage existing = existingOpt.get();
                existing.setName(pkg.getName());
                existing.setCredits(pkg.getCredits());
                existing.setPrice(pkg.getPrice());
                existing.setDescription(pkg.getDescription());
                existing.setSortOrder(pkg.getSortOrder());
                existing.setIsActive(true);
                creditPackageRepository.save(existing);
            } else {
                creditPackageRepository.save(pkg);
                created++;
            }
        }
        log.info("Seeded credit packages: {} created", created);
    }

    private CreditPackage pkg(String code, String name, String credits, String price,
                              int sortOrder, String description) {
        return CreditPackage.builder()
                .code(code)
                .name(name)
                .credits(new BigDecimal(credits))
                .price(new BigDecimal(price))
                .currency("INR")
                .description(description)
                .sortOrder(sortOrder)
                .isActive(true)
                .build();
    }
}
