package com.skillinfinity.communication.service.impl;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.communication.dto.request.AnnouncementRequest;
import com.skillinfinity.communication.dto.response.AnnouncementResponse;
import com.skillinfinity.communication.entity.Announcement;
import com.skillinfinity.communication.enumeration.AnnouncementStatus;
import com.skillinfinity.communication.enumeration.AnnouncementTarget;
import com.skillinfinity.communication.exception.AnnouncementNotFoundException;
import com.skillinfinity.communication.mapper.CommunicationMapper;
import com.skillinfinity.communication.repository.AnnouncementRepository;
import com.skillinfinity.communication.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final CommunicationMapper mapper;

    @Override
    public AnnouncementResponse createAnnouncement(AnnouncementRequest request, UUID adminUserId) {
        log.info("Creating announcement by admin: {}", adminUserId);

        AnnouncementStatus status = AnnouncementStatus.DRAFT;
        if (request.getStatus() != null) {
            try {
                status = AnnouncementStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid announcement status: " + request.getStatus());
            }
        }

        AnnouncementTarget targetAudience = AnnouncementTarget.ALL_USERS;
        if (request.getTargetAudience() != null) {
            try {
                targetAudience = AnnouncementTarget.valueOf(request.getTargetAudience().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid target audience: " + request.getTargetAudience());
            }
        }

        Announcement announcement = Announcement.builder()
                .id(UUID.randomUUID())
                .title(request.getTitle())
                .content(request.getContent())
                .summary(request.getSummary())
                .status(status)
                .targetAudience(targetAudience)
                .important(request.isImportant())
                .scheduledAt(request.getScheduledAt())
                .createdBy(adminUserId.toString())
                .build();

        if (request.getSpecificUserIds() != null && !request.getSpecificUserIds().isEmpty()) {
            announcement.setSpecificUserIds(
                    request.getSpecificUserIds().stream()
                            .map(UUID::toString)
                            .collect(Collectors.joining(","))
            );
        }

        if (status == AnnouncementStatus.PUBLISHED) {
            announcement.setPublishedAt(LocalDateTime.now());
            announcement.setPublishedBy(adminUserId);
        }

        announcement = announcementRepository.save(announcement);
        log.info("Announcement created: {}", announcement.getId());
        return mapper.toAnnouncementResponse(announcement);
    }

    @Override
    public AnnouncementResponse updateAnnouncement(UUID id, AnnouncementRequest request, UUID adminUserId) {
        log.info("Updating announcement: {} by admin: {}", id, adminUserId);

        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new AnnouncementNotFoundException(id.toString()));

        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setSummary(request.getSummary());
        announcement.setImportant(request.isImportant());
        announcement.setUpdatedBy(adminUserId.toString());

        if (request.getStatus() != null) {
            try {
                AnnouncementStatus newStatus = AnnouncementStatus.valueOf(request.getStatus().toUpperCase());
                announcement.setStatus(newStatus);
                if (newStatus == AnnouncementStatus.PUBLISHED && announcement.getPublishedAt() == null) {
                    announcement.setPublishedAt(LocalDateTime.now());
                    announcement.setPublishedBy(adminUserId);
                }
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid announcement status: " + request.getStatus());
            }
        }

        if (request.getTargetAudience() != null) {
            try {
                announcement.setTargetAudience(AnnouncementTarget.valueOf(request.getTargetAudience().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid target audience: " + request.getTargetAudience());
            }
        }

        announcement.setScheduledAt(request.getScheduledAt());

        if (request.getSpecificUserIds() != null) {
            announcement.setSpecificUserIds(
                    request.getSpecificUserIds().stream()
                            .map(UUID::toString)
                            .collect(Collectors.joining(","))
            );
        }

        announcement = announcementRepository.save(announcement);
        return mapper.toAnnouncementResponse(announcement);
    }

    @Override
    public void deleteAnnouncement(UUID id, UUID adminUserId) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new AnnouncementNotFoundException(id.toString()));

        announcement.setActive(false);
        announcement.setArchivedAt(LocalDateTime.now());
        announcement.setUpdatedBy(adminUserId.toString());
        announcementRepository.save(announcement);
        log.info("Announcement deleted: {}", id);
    }

    @Override
    public AnnouncementResponse publishAnnouncement(UUID id, UUID adminUserId) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new AnnouncementNotFoundException(id.toString()));

        announcement.setStatus(AnnouncementStatus.PUBLISHED);
        announcement.setPublishedAt(LocalDateTime.now());
        announcement.setPublishedBy(adminUserId);
        announcement.setUpdatedBy(adminUserId.toString());
        announcement = announcementRepository.save(announcement);

        log.info("Announcement published: {}", id);
        return mapper.toAnnouncementResponse(announcement);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AnnouncementResponse> getAnnouncements(String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Announcement> announcements;
        if (status != null && !status.isBlank()) {
            try {
                AnnouncementStatus announcementStatus = AnnouncementStatus.valueOf(status.toUpperCase());
                announcements = announcementRepository.findByStatusAndActiveTrueOrderByCreatedAtDesc(announcementStatus, pageable);
            } catch (IllegalArgumentException e) {
                announcements = announcementRepository.findByActiveTrueOrderByCreatedAtDesc(pageable);
            }
        } else {
            announcements = announcementRepository.findByActiveTrueOrderByCreatedAtDesc(pageable);
        }

        return announcements.map(mapper::toAnnouncementResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AnnouncementResponse getAnnouncement(UUID id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new AnnouncementNotFoundException(id.toString()));
        return mapper.toAnnouncementResponse(announcement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getImportantAnnouncements() {
        return announcementRepository.findImportantAnnouncements()
                .stream()
                .map(mapper::toAnnouncementResponse)
                .toList();
    }

    @Override
    @Scheduled(fixedRate = 60000)
    public void processScheduledAnnouncements() {
        List<Announcement> scheduledAnnouncements = announcementRepository
                .findScheduledAnnouncementsReadyToPublish(AnnouncementStatus.SCHEDULED, LocalDateTime.now());

        for (Announcement announcement : scheduledAnnouncements) {
            announcement.setStatus(AnnouncementStatus.PUBLISHED);
            announcement.setPublishedAt(LocalDateTime.now());
            announcementRepository.save(announcement);
            log.info("Scheduled announcement published: {}", announcement.getId());
        }

        if (!scheduledAnnouncements.isEmpty()) {
            log.info("Processed {} scheduled announcements", scheduledAnnouncements.size());
        }
    }
}
