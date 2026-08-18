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

    @Schema(description = "Total registered users")
    private long totalUsers;

    @Schema(description = "Total mentors (from the synced user index)")
    private long totalMentors;

    @Schema(description = "Total learners (from the synced user index)")
    private long totalLearners;

    @Schema(description = "Recent admin activity")
    private List<ActivityItem> recentActivities;

    @Schema(description = "System health")
    private SystemHealth systemHealth;

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
        private long uptime;
    }
}
