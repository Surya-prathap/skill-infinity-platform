package com.skillinfinity.communication.service;

import com.skillinfinity.communication.dto.request.AnnouncementRequest;
import com.skillinfinity.communication.dto.response.AnnouncementResponse;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface AnnouncementService {

    AnnouncementResponse createAnnouncement(AnnouncementRequest request, UUID adminUserId);

    AnnouncementResponse updateAnnouncement(UUID id, AnnouncementRequest request, UUID adminUserId);

    void deleteAnnouncement(UUID id, UUID adminUserId);

    AnnouncementResponse publishAnnouncement(UUID id, UUID adminUserId);

    Page<AnnouncementResponse> getAnnouncements(String status, int page, int size);

    AnnouncementResponse getAnnouncement(UUID id);

    List<AnnouncementResponse> getImportantAnnouncements();

    void processScheduledAnnouncements();
}
