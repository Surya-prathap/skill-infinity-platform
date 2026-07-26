package com.skillinfinity.mentor.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillinfinity.mentor.dto.request.BecomeMentorRequest;
import com.skillinfinity.mentor.dto.response.MentorResponse;
import com.skillinfinity.mentor.service.MentorService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = MentorController.class)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class MentorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MentorService mentorService;

    @Test
    void becomeMentor_ShouldReturn201() throws Exception {
        UUID userId = UUID.randomUUID();
        BecomeMentorRequest request = BecomeMentorRequest.builder()
                .headline("Expert Java Mentor")
                .bio("10+ years of experience")
                .country("USA")
                .build();

        MentorResponse response = MentorResponse.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .build();

        when(mentorService.becomeMentor(any(UUID.class), any(BecomeMentorRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/v1/mentors")
                        .header("X-User-ID", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getPublicProfile_ShouldReturn200() throws Exception {
        UUID mentorId = UUID.randomUUID();
        MentorResponse response = MentorResponse.builder()
                .id(mentorId)
                .userId(UUID.randomUUID())
                .build();

        when(mentorService.getPublicMentorProfile(any(UUID.class)))
                .thenReturn(response);

        mockMvc.perform(get("/api/v1/mentors/{id}/public", mentorId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
