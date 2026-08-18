package com.skillinfinity.session.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityImpactResponse {

    /** Total successful community sessions conducted. */
    private long completedSessions;

    /** Distinct learners helped across community sessions. */
    private long learnersHelped;

    /** Total community mentoring hours. */
    private double communityHours;

    /** Current recognition level index (0 = no level yet). */
    private int level;

    /** Recognition level label, e.g. "Community Mentor". */
    private String levelLabel;

    /** Sessions needed to reach the next recognition level (0 when at max). */
    private long nextLevelAt;

    /** Next recognition label, or null when at the highest level. */
    private String nextLevelLabel;
}
