package com.skillinfinity.admin.service;

import com.skillinfinity.admin.dto.request.PlatformSettingRequest;
import com.skillinfinity.admin.dto.response.AdminUserResponse;
import com.skillinfinity.admin.dto.response.DashboardResponse;
import com.skillinfinity.admin.entity.PlatformSetting;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

public interface AdminService {

    DashboardResponse getDashboard();

    // User Management
    Page<AdminUserResponse> getUsers(int page, int size);
    void suspendUser(UUID userId);
    void activateUser(UUID userId);

    // Mentor Management
    // Approval decisions are forwarded to the mentor-service (PUT /mentors/{id}/verify),
    // which owns mentor status and publishes the ROLE_MENTOR grant event. The adminId is
    // recorded by mentor-service as the reviewer.
    void approveMentor(UUID mentorId, UUID adminId);
    void rejectMentor(UUID mentorId, String reason, UUID adminId);

    // Platform Settings
    List<PlatformSetting> getSettings();
    PlatformSetting updateSetting(PlatformSettingRequest request, UUID adminId);
}
