package com.skillinfinity.mentor.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorProfileUpdatedEvent implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private UUID mentorId;
    private UUID userId;
    private String headline;
    private String bio;
    private String country;
    private String city;
    private String timezone;
    private Integer yearsOfExperience;
    private int profileCompletionPercentage;
    private LocalDateTime timestamp;
}
