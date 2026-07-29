package com.skillinfinity.admin.mapper;

import com.skillinfinity.admin.dto.response.AdminUserResponse;
import com.skillinfinity.admin.dto.response.AuditLogResponse;
import com.skillinfinity.admin.entity.AdminUser;
import com.skillinfinity.admin.entity.AuditLog;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AdminMapper {

    AdminUserResponse toAdminUserResponse(AdminUser adminUser);

    List<AdminUserResponse> toAdminUserResponseList(List<AdminUser> adminUsers);

    AuditLogResponse toAuditLogResponse(AuditLog auditLog);

    List<AuditLogResponse> toAuditLogResponseList(List<AuditLog> auditLogs);
}
