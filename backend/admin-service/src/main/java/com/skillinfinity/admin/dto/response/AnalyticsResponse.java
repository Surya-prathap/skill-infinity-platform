package com.skillinfinity.admin.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Analytics response")
public class AnalyticsResponse {

    @Schema(description = "Revenue analytics")
    private RevenueAnalytics revenue;

    @Schema(description = "Growth analytics")
    private GrowthAnalytics growth;

    @Schema(description = "User analytics")
    private UserAnalytics users;

    @Schema(description = "Session analytics")
    private SessionAnalytics sessions;

    @Schema(description = "Engagement analytics")
    private EngagementAnalytics engagement;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueAnalytics {
        private double totalRevenue;
        private double monthlyRevenue;
        private double weeklyRevenue;
        private double averageTransactionValue;
        private Map<String, Double> revenueByMonth;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GrowthAnalytics {
        private double userGrowthRate;
        private double mentorGrowthRate;
        private double sessionGrowthRate;
        private double revenueGrowthRate;
        private Map<String, Long> registrationsByDay;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserAnalytics {
        private long totalUsers;
        private long activeUsers;
        private long newUsersToday;
        private long newUsersThisWeek;
        private long newUsersThisMonth;
        private Map<String, Long> usersByRole;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionAnalytics {
        private long totalSessions;
        private long completedSessions;
        private long cancelledSessions;
        private double averageSessionDuration;
        private long sessionsToday;
        private Map<String, Long> sessionsByStatus;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EngagementAnalytics {
        private double averageRating;
        private long totalReviews;
        private long totalPosts;
        private long totalComments;
        private double mentorResponseRate;
    }
}
