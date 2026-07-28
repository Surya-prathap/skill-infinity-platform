package com.skillinfinity.communication.service;

import com.skillinfinity.communication.dto.request.AnnouncementRequest;
import com.skillinfinity.communication.dto.response.AnnouncementResponse;
import com.skillinfinity.communication.entity.Announcement;
import com.skillinfinity.communication.enumeration.AnnouncementStatus;
import com.skillinfinity.communication.enumeration.AnnouncementTarget;
import com.skillinfinity.communication.exception.AnnouncementNotFoundException;
import com.skillinfinity.communication.mapper.CommunicationMapper;
import com.skillinfinity.communication.repository.AnnouncementRepository;
import com.skillinfinity.communication.service.impl.AnnouncementServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnnouncementServiceTest {

    @Mock
    private AnnouncementRepository announcementRepository;
    @Mock
    private CommunicationMapper mapper;

    private AnnouncementService announcementService;
    private UUID adminUserId;
    private UUID announcementId;
    private Announcement announcement;

    @BeforeEach
    void setUp() {
        announcementService = new AnnouncementServiceImpl(announcementRepository, mapper);

        adminUserId = UUID.randomUUID();
        announcementId = UUID.randomUUID();

        announcement = Announcement.builder()
                .id(announcementId)
                .title("Test Announcement")
                .content("Test content")
                .status(AnnouncementStatus.DRAFT)
                .targetAudience(AnnouncementTarget.ALL_USERS)
                .active(true)
                .createdAt(LocalDateTime.now())
                .createdBy(adminUserId.toString())
                .build();
    }

    @Test
    void createAnnouncement_ShouldCreateDraft() {
        AnnouncementRequest request = AnnouncementRequest.builder()
                .title("New Announcement")
                .content("Content")
                .status("DRAFT")
                .targetAudience("ALL_USERS")
                .build();

        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcement);
        when(mapper.toAnnouncementResponse(any(Announcement.class))).thenReturn(
                AnnouncementResponse.builder().id(announcementId).title("New Announcement").build());

        AnnouncementResponse response = announcementService.createAnnouncement(request, adminUserId);

        assertNotNull(response);
        assertEquals(announcementId, response.getId());
        verify(announcementRepository).save(any(Announcement.class));
    }

    @Test
    void updateAnnouncement_ShouldUpdateFields() {
        AnnouncementRequest request = AnnouncementRequest.builder()
                .title("Updated Title")
                .content("Updated content")
                .status("PUBLISHED")
                .targetAudience("MENTORS_ONLY")
                .build();

        when(announcementRepository.findById(announcementId)).thenReturn(Optional.of(announcement));
        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcement);
        when(mapper.toAnnouncementResponse(any(Announcement.class))).thenReturn(
                AnnouncementResponse.builder().id(announcementId).title("Updated Title").build());

        AnnouncementResponse response = announcementService.updateAnnouncement(announcementId, request, adminUserId);

        assertNotNull(response);
        verify(announcementRepository).save(any(Announcement.class));
    }

    @Test
    void deleteAnnouncement_ShouldSoftDelete() {
        when(announcementRepository.findById(announcementId)).thenReturn(Optional.of(announcement));

        announcementService.deleteAnnouncement(announcementId, adminUserId);

        assertFalse(announcement.isActive());
        assertNotNull(announcement.getArchivedAt());
        verify(announcementRepository).save(announcement);
    }

    @Test
    void getAnnouncement_ShouldThrowException_WhenNotFound() {
        when(announcementRepository.findById(announcementId)).thenReturn(Optional.empty());

        assertThrows(AnnouncementNotFoundException.class, () -> announcementService.getAnnouncement(announcementId));
    }

    @Test
    void publishAnnouncement_ShouldChangeStatus() {
        when(announcementRepository.findById(announcementId)).thenReturn(Optional.of(announcement));
        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcement);
        when(mapper.toAnnouncementResponse(any(Announcement.class))).thenReturn(
                AnnouncementResponse.builder().id(announcementId).status("PUBLISHED").build());

        AnnouncementResponse response = announcementService.publishAnnouncement(announcementId, adminUserId);

        assertNotNull(response);
        assertEquals(AnnouncementStatus.PUBLISHED, announcement.getStatus());
        assertNotNull(announcement.getPublishedAt());
    }

    @Test
    void getAnnouncements_ShouldReturnAllWhenNoStatus() {
        Page<Announcement> announcementPage = new PageImpl<>(List.of(announcement));

        when(announcementRepository.findByActiveTrueOrderByCreatedAtDesc(any(PageRequest.class)))
                .thenReturn(announcementPage);
        when(mapper.toAnnouncementResponse(any(Announcement.class))).thenReturn(
                AnnouncementResponse.builder().id(announcementId).build());

        Page<AnnouncementResponse> responses = announcementService.getAnnouncements(null, 0, 20);

        assertNotNull(responses);
        assertEquals(1, responses.getTotalElements());
    }

    @Test
    void getImportantAnnouncements_ShouldReturnList() {
        when(announcementRepository.findImportantAnnouncements()).thenReturn(List.of(announcement));
        when(mapper.toAnnouncementResponse(any(Announcement.class))).thenReturn(
                AnnouncementResponse.builder().id(announcementId).build());

        List<AnnouncementResponse> responses = announcementService.getImportantAnnouncements();

        assertNotNull(responses);
        assertEquals(1, responses.size());
    }

    @Test
    void processScheduledAnnouncements_ShouldPublishDue() {
        when(announcementRepository.findScheduledAnnouncementsReadyToPublish(
                eq(AnnouncementStatus.SCHEDULED), any()))
                .thenReturn(List.of(announcement));

        announcementService.processScheduledAnnouncements();

        assertEquals(AnnouncementStatus.PUBLISHED, announcement.getStatus());
        assertNotNull(announcement.getPublishedAt());
        verify(announcementRepository).save(announcement);
    }
}
