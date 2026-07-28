package com.skillinfinity.community.mapper;

import com.skillinfinity.community.dto.response.ReportResponse;
import com.skillinfinity.community.entity.Report;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReportMapper {

    @Mapping(target = "reason", expression = "java(report.getReason() != null ? report.getReason().name() : null)")
    @Mapping(target = "status", expression = "java(report.getStatus() != null ? report.getStatus().name() : null)")
    ReportResponse toReportResponse(Report report);

    List<ReportResponse> toReportResponseList(List<Report> reports);
}
