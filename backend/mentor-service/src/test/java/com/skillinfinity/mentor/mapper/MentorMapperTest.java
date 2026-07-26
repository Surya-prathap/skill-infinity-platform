package com.skillinfinity.mentor.mapper;

import com.skillinfinity.mentor.dto.response.MentorResponse;
import com.skillinfinity.mentor.entity.Mentor;
import com.skillinfinity.mentor.entity.MentorProfile;
import com.skillinfinity.mentor.entity.MentorStatistics;
import com.skillinfinity.mentor.enumeration.MentorStatus;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class MentorMapperTest {

    private final MentorMapper mentorMapper = Mappers.getMapper(MentorMapper.class);

    @Test
    void toMentorResponse_ShouldMapAllFields() {
        UUID mentorId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        Mentor mentor = Mentor.builder()
                .id(mentorId)
                .userId(userId)
                .status(MentorStatus.ACTIVE)
                .verified(true)
                .build();

        MentorProfile profile = MentorProfile.builder()
                .id(UUID.randomUUID())
                .mentor(mentor)
                .headline("Expert Mentor")
                .bio("Bio text")
                .country("USA")
                .build();
        mentor.setProfile(profile);

        MentorStatistics stats = MentorStatistics.builder()
                .id(UUID.randomUUID())
                .mentor(mentor)
                .totalSessions(10)
                .completedSessions(8)
                .averageRating(4.5)
                .build();
        mentor.setStatistics(stats);

        MentorResponse response = mentorMapper.toMentorResponse(mentor);

        assertNotNull(response);
        assertEquals(mentorId, response.getId());
        assertEquals(userId, response.getUserId());
        assertEquals("ACTIVE", response.getStatus());
        assertEquals("Expert Mentor", response.getProfile().getHeadline());
        assertEquals("Bio text", response.getProfile().getBio());
        assertEquals("USA", response.getProfile().getCountry());
        assertEquals(10, response.getStatistics().getTotalSessions());
        assertEquals(4.5, response.getStatistics().getAverageRating());
    }
}
