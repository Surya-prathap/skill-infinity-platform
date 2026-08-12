package com.skillinfinity.payment.config;

import com.skillinfinity.payment.entity.SubscriptionPlan;
import com.skillinfinity.payment.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Seeds the default learner & mentor subscription plans on first startup.
 *
 * <p>Each plan carries a human-readable {@code features} list (comma/newline
 * separated) so the subscription page can show exactly what the plan
 * includes. The seed only runs when the {@code subscription_plans} table is
 * empty — plans can be edited later by the admin without being overwritten.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionPlanSeeder implements CommandLineRunner {

    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    public void run(String... args) {
        if (subscriptionPlanRepository.count() > 0) {
            return;
        }

        List<SubscriptionPlan> plans = List.of(
                // ---------------- Learner plans ----------------
                SubscriptionPlan.builder()
                        .name("Learner Starter")
                        .description("Everything you need to begin your learning journey with priority access.")
                        .price(new BigDecimal("199"))
                        .currency("INR")
                        .creditsPerMonth(new BigDecimal("300"))
                        .durationDays(30)
                        .maxSessionsPerMonth(6)
                        .features("Priority session booking\nAccess to 1:1 mentorship slots\nAdvanced session search & filters\nMonthly learning progress report\nEmail support within 24 hours")
                        .isActive(true)
                        .build(),
                SubscriptionPlan.builder()
                        .name("Learner Plus")
                        .description("The most popular plan for active learners — more sessions and exclusive perks.")
                        .price(new BigDecimal("499"))
                        .currency("INR")
                        .creditsPerMonth(new BigDecimal("800"))
                        .durationDays(30)
                        .maxSessionsPerMonth(15)
                        .features("Everything in Learner Starter\n15 sessions per month\nEarly access to new mentor slots\nExclusive webinars & live Q&As\nSession recordings for 7 days\nPriority email support within 6 hours")
                        .isActive(true)
                        .build(),
                SubscriptionPlan.builder()
                        .name("Learner Pro")
                        .description("Maximum access for career-focused learners with dedicated guidance.")
                        .price(new BigDecimal("999"))
                        .currency("INR")
                        .creditsPerMonth(new BigDecimal("2000"))
                        .durationDays(30)
                        .maxSessionsPerMonth(30)
                        .features("Everything in Learner Plus\nUnlimited community sessions\nDedicated career counselling\n1:1 mentorship priority queue\nSession recordings for 30 days\n24/7 priority chat support\nCertificate-ready progress tracking")
                        .isActive(true)
                        .build(),

                // ---------------- Mentor plans ----------------
                SubscriptionPlan.builder()
                        .name("Mentor Growth")
                        .description("Visibility and analytics tools to grow your mentor practice.")
                        .price(new BigDecimal("499"))
                        .currency("INR")
                        .creditsPerMonth(new BigDecimal("500"))
                        .durationDays(30)
                        .maxSessionsPerMonth(30)
                        .features("Verified mentor badge on your profile\nEnhanced profile visibility in search\nDetailed session analytics\nLearner feedback summaries\nSchedule up to 5 sessions per day")
                        .isActive(true)
                        .build(),
                SubscriptionPlan.builder()
                        .name("Mentor Pro")
                        .description("Professional tools for mentors building a thriving teaching practice.")
                        .price(new BigDecimal("999"))
                        .currency("INR")
                        .creditsPerMonth(new BigDecimal("1200"))
                        .durationDays(30)
                        .maxSessionsPerMonth(60)
                        .features("Everything in Mentor Growth\nAppears in featured mentors carousel\nAdvanced earning & payout analytics\nCommunity impact leaderboard boost\nCustomizable session pricing tools\nPriority support within 6 hours")
                        .isActive(true)
                        .build(),
                SubscriptionPlan.builder()
                        .name("Mentor Enterprise")
                        .description("For full-time mentors and institutions teaching at scale.")
                        .price(new BigDecimal("2499"))
                        .currency("INR")
                        .creditsPerMonth(new BigDecimal("4000"))
                        .durationDays(30)
                        .maxSessionsPerMonth(120)
                        .features("Everything in Mentor Pro\nTop placement in mentor marketplace\nGroup & cohort session hosting\nDedicated account manager\nCustom branding on session pages\nAPI access for scheduling\n24/7 priority support")
                        .isActive(true)
                        .build()
        );

        subscriptionPlanRepository.saveAll(plans);
        log.info("Seeded {} subscription plans ({} learner, {} mentor)",
                plans.size(), plans.stream().filter(p -> p.getName().contains("Learner")).count(),
                plans.stream().filter(p -> p.getName().contains("Mentor")).count());
    }
}
