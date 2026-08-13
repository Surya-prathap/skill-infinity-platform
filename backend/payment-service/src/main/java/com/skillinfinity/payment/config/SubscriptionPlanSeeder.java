package com.skillinfinity.payment.config;

import com.skillinfinity.payment.entity.SubscriptionPlan;
import com.skillinfinity.payment.enumeration.SubscriptionPlanType;
import com.skillinfinity.payment.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Seeds the default learner & mentor subscription plans.
 *
 * <p>Each plan carries a human-readable {@code features} list (newline
 * separated) so the subscription page can show exactly what the plan
 * includes. The seed runs on every startup but only touches plans it owns:
 * plans are upserted by name (price/currency/benefits are refreshed) and any
 * legacy seeded plans that are no longer part of the catalog are deactivated
 * rather than deleted, so historical {@code subscription_history} references
 * stay intact.
 *
 * <p>Subscriptions are platform benefits only — they never replace the credit
 * system. Therefore every plan carries zero included credits and no free
 * session allowance; professional sessions always require credits.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionPlanSeeder implements CommandLineRunner {

    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    public void run(String... args) {
        List<SubscriptionPlan> plans = buildPlans();

        int created = 0;
        int updated = 0;
        for (SubscriptionPlan plan : plans) {
            var existingOpt = subscriptionPlanRepository.findByName(plan.getName());
            if (existingOpt.isPresent()) {
                SubscriptionPlan existing = existingOpt.get();
                existing.setType(plan.getType());
                existing.setDescription(plan.getDescription());
                existing.setPrice(plan.getPrice());
                existing.setCurrency(plan.getCurrency());
                existing.setCreditsPerMonth(plan.getCreditsPerMonth());
                existing.setDurationDays(plan.getDurationDays());
                existing.setMaxSessionsPerMonth(plan.getMaxSessionsPerMonth());
                existing.setFeatures(plan.getFeatures());
                existing.setIsActive(true);
                subscriptionPlanRepository.save(existing);
                updated++;
            } else {
                subscriptionPlanRepository.save(plan);
                created++;
            }
        }

        // Deactivate legacy seeded plans that are no longer part of the catalog
        // (kept for foreign-key safety; they no longer appear anywhere).
        List<String> legacyNames = List.of("Learner Starter", "Mentor Growth", "Mentor Enterprise");
        for (String name : legacyNames) {
            subscriptionPlanRepository.findByName(name)
                    .filter(SubscriptionPlan::getIsActive)
                    .ifPresent(plan -> {
                        plan.setIsActive(false);
                        subscriptionPlanRepository.save(plan);
                        log.info("Deactivated legacy subscription plan: {}", name);
                    });
        }

        log.info("Seeded subscription plans: {} created, {} refreshed ({} learner, {} mentor)",
                created, updated,
                plans.stream().filter(p -> p.getType() == SubscriptionPlanType.LEARNER).count(),
                plans.stream().filter(p -> p.getType() == SubscriptionPlanType.MENTOR).count());
    }

    private List<SubscriptionPlan> buildPlans() {
        return List.of(
                // ---------------- Learner plans ----------------
                plan("Learner Free", SubscriptionPlanType.LEARNER,
                        "The default plan for every learner — explore mentors and learn with credits.",
                        "0",
                        "3 one-time welcome credits\nBrowse mentors\nSearch mentors\nView mentor profiles\nView availability\nAttend Community sessions\nBook Professional sessions using available credits\nBasic learner profile\nBasic wallet\nBasic dashboard"),
                plan("Learner Plus", SubscriptionPlanType.LEARNER,
                        "Everything in Free, plus discounts and priority discovery for active learners.",
                        "99",
                        "Everything in Free\n5% discount when purchasing credits\nPriority mentor search & discovery\nAdvanced availability filters\nBetter learning dashboard\nSubscription badge/status\nBasic learning statistics"),
                plan("Learner Pro", SubscriptionPlanType.LEARNER,
                        "Maximum convenience and insights for career-focused learners.",
                        "199",
                        "Everything in Learner Plus\n10% discount when purchasing credits\nPriority booking\nPremium mentor discovery\nEnhanced mentor filtering\nAdvanced learning analytics\nImproved learning progress dashboard\nPro learner badge/status"),

                // ---------------- Mentor plans ----------------
                plan("Mentor Free", SubscriptionPlanType.MENTOR,
                        "The default plan for approved mentors — start teaching and earn credits.",
                        "0",
                        "Mentor profile\nSet availability\nOffer Professional sessions\nOffer Community sessions\nChoose session type (Professional / Community / Both)\nEarn learning credits through Professional mentoring\nNormal mentor visibility\nBasic mentor dashboard\nBasic earnings information"),
                plan("Mentor Pro", SubscriptionPlanType.MENTOR,
                        "Better visibility and analytics to grow your mentor practice.",
                        "149",
                        "Everything in Mentor Free\nFeatured mentor visibility\nHigher ranking in mentor search\nMentor analytics\nProfile badge\nBetter mentor discovery\nAdvanced earnings analytics\nPriority support\nReduced platform commission"),
                plan("Mentor Premium", SubscriptionPlanType.MENTOR,
                        "Top placement and premium tools for the platform's best mentors.",
                        "299",
                        "Everything in Mentor Pro\nPremium Mentor badge\nTop/priority mentor placement\nEligible for the landing page Featured/Premium Mentors section\nAdvanced mentor analytics\nAdvanced availability controls\nEnhanced profile customization\nPriority support\nBest available platform commission rate")
        );
    }

    private SubscriptionPlan plan(String name, SubscriptionPlanType type, String description, String price, String features) {
        return SubscriptionPlan.builder()
                .name(name)
                .type(type)
                .description(description)
                .price(new BigDecimal(price))
                .currency("INR")
                .creditsPerMonth(BigDecimal.ZERO)
                .durationDays(30)
                .maxSessionsPerMonth(null)
                .features(features)
                .isActive(true)
                .build();
    }
}
