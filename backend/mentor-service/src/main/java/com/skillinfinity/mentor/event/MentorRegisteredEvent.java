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
public class MentorRegisteredEvent implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private UUID mentorId;
    private UUID userId;
    private String email;
    private String headline;
    private String country;
    private LocalDateTime timestamp;
}
