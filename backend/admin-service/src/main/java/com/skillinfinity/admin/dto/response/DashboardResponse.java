package com.skillinfinity.admin.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Admin dashboard response")
public class DashboardResponse {

    @Schema(description = "User statistics")
    private UserStats userStats;

    @Schema(description = "Mentor statistics")
    private MentorStats mentorStats;

    @Schema(description = "Session statistics")
    private SessionStats sessionStats;

    @Schema(description = "Revenue statistics")
    private RevenueStats revenueStats;

    @Schema(description = "Community statistics")
    private CommunityStats communityStats;

    @Schema(description = "Review statistics")
    private ReviewStats reviewStats;

    @Schema(description = "Recent activities")
    private List<ActivityItem> recentActivities;

    @Schema(description = "System health")
    private SystemHealth systemHealth;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStats {
        private long totalUsers;
        private long totalMentors;
        private long totalLearners;
        private long activeUsersToday;
        private long dailyRegistrations;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MentorStats {
        private long totalMentors;
        private long approvedMentors;
        private long pendingApprovals;
        private long suspendedMentors;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionStats {
        private long totalSessions;
        private long completedSessions;
        private long activeSessions;
        private long cancelledSessions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueStats {
        private double totalRevenue;
        private long totalPayments;
        private long pendingPayouts;
        private double monthlyRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommunityStats {
        private long totalCommunities;
        private long totalPosts;
        private long totalComments;
        private long reportedContents;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewStats {
        private long totalReviews;
        private long pendingReviews;
        private long approvedReviews;
        private long reportedReviews;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityItem {
        private String action;
        private String description;
        private String timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemHealth {
        private String status;
        private int activeServices;
        private int totalServices;
        private double averageResponseTime;
        private long uptime;
    }
}
