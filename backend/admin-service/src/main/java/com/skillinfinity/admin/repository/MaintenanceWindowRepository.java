package com.skillinfinity.admin.repository;

import com.skillinfinity.admin.entity.MaintenanceWindow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceWindowRepository extends JpaRepository<MaintenanceWindow, UUID> {

    List<MaintenanceWindow> findByStatusAndActiveTrue(String status);

    List<MaintenanceWindow> findByEndTimeBeforeAndActiveTrue(LocalDateTime now);
}
