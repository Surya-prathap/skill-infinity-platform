package com.skillinfinity.community.service.impl;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.community.dto.request.ReportRequest;
import com.skillinfinity.community.dto.response.ReportResponse;
import com.skillinfinity.community.entity.Report;
import com.skillinfinity.community.entity.Post;
import com.skillinfinity.community.enumeration.ReportReason;
import com.skillinfinity.community.enumeration.ReportStatus;

import com.skillinfinity.community.exception.PostNotFoundException;
import com.skillinfinity.community.mapper.ReportMapper;
import com.skillinfinity.community.repository.PostRepository;
import com.skillinfinity.community.repository.ReportRepository;
import com.skillinfinity.community.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final PostRepository postRepository;
    private final ReportMapper mapper;

    @Override
    public ReportResponse createReport(ReportRequest request, UUID reporterId) {
        log.info("Creating report: targetType={}, targetId={}, reason={}",
                request.getTargetType(), request.getTargetId(), request.getReason());

        // Validate target exists
        if ("POST".equalsIgnoreCase(request.getTargetType())) {
            postRepository.findByIdAndActiveTrue(request.getTargetId())
                    .orElseThrow(() -> new PostNotFoundException(request.getTargetId().toString()));
        }

        ReportReason reason;
        try {
            reason = ReportReason.valueOf(request.getReason().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid report reason: " + request.getReason());
        }

        Report report = Report.builder()
                .id(UUID.randomUUID())
                .reporterId(reporterId)
                .targetType(request.getTargetType().toUpperCase())
                .targetId(request.getTargetId())
                .reason(reason)
                .description(request.getDescription())
                .status(ReportStatus.PENDING)
                .build();

        report = reportRepository.save(report);

        // Increment report count on the target post
        if ("POST".equalsIgnoreCase(request.getTargetType())) {
            postRepository.findById(request.getTargetId()).ifPresent(post -> {
                post.setReportCount(post.getReportCount() + 1);
                postRepository.save(post);
            });
        }

        log.info("Report created successfully: {}", report.getId());
        return mapper.toReportResponse(report);
    }

    @Override
    @Transactional
    public ReportResponse resolveReport(UUID reportId, UUID moderatorId, String resolutionNotes) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new BadRequestException("Report not found: " + reportId));

        report.setStatus(ReportStatus.RESOLVED);
        report.setReviewedBy(moderatorId);
        report.setReviewedAt(LocalDateTime.now());
        report.setResolutionNotes(resolutionNotes);
        report = reportRepository.save(report);

        log.info("Report resolved: {} by moderator: {}", reportId, moderatorId);
        return mapper.toReportResponse(report);
    }

    @Override
    @Transactional
    public ReportResponse dismissReport(UUID reportId, UUID moderatorId, String resolutionNotes) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new BadRequestException("Report not found: " + reportId));

        report.setStatus(ReportStatus.DISMISSED);
        report.setReviewedBy(moderatorId);
        report.setReviewedAt(LocalDateTime.now());
        report.setResolutionNotes(resolutionNotes);
        report = reportRepository.save(report);

        log.info("Report dismissed: {} by moderator: {}", reportId, moderatorId);
        return mapper.toReportResponse(report);
    }

    @Override
    @Transactional(readOnly = true)
    public ReportResponse getReport(UUID reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new BadRequestException("Report not found: " + reportId));
        return mapper.toReportResponse(report);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReportResponse> getReports(String status, int page, int size) {
        if (status != null && !status.isBlank()) {
            ReportStatus reportStatus;
            try {
                reportStatus = ReportStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid report status: " + status);
            }
            return reportRepository.findByStatusAndActiveTrue(reportStatus, PageRequest.of(page, size))
                    .map(mapper::toReportResponse);
        }
        return reportRepository.findByActiveTrueOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(mapper::toReportResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public long getPendingReportCount() {
        return reportRepository.countByStatusAndActiveTrue(ReportStatus.PENDING);
    }
}
