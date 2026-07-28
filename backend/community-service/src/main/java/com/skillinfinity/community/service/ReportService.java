package com.skillinfinity.community.service;

import com.skillinfinity.community.dto.request.ReportRequest;
import com.skillinfinity.community.dto.response.ReportResponse;
import org.springframework.data.domain.Page;

import java.util.UUID;

public interface ReportService {

    ReportResponse createReport(ReportRequest request, UUID reporterId);

    ReportResponse resolveReport(UUID reportId, UUID moderatorId, String resolutionNotes);

    ReportResponse dismissReport(UUID reportId, UUID moderatorId, String resolutionNotes);

    ReportResponse getReport(UUID reportId);

    Page<ReportResponse> getReports(String status, int page, int size);

    long getPendingReportCount();
}
