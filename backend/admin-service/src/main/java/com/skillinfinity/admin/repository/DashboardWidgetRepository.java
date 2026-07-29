package com.skillinfinity.admin.repository;

import com.skillinfinity.admin.entity.DashboardWidget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DashboardWidgetRepository extends JpaRepository<DashboardWidget, UUID> {

    List<DashboardWidget> findByAdminIdAndActiveTrueOrderByPosition(UUID adminId);

    List<DashboardWidget> findByAdminIdAndVisibleTrueAndActiveTrueOrderByPosition(UUID adminId);
}
