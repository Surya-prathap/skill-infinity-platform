package com.skillinfinity.admin.repository;

import com.skillinfinity.admin.entity.PlatformSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlatformSettingRepository extends JpaRepository<PlatformSetting, UUID> {

    Optional<PlatformSetting> findBySettingKey(String settingKey);

    List<PlatformSetting> findByCategoryAndActiveTrue(String category);

    List<PlatformSetting> findByActiveTrue();
}
