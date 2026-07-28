package com.skillinfinity.communication.repository;

import com.skillinfinity.communication.entity.FileMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, UUID> {

    List<FileMetadata> findByUploadedByAndActiveTrueOrderByCreatedAtDesc(UUID uploadedBy);

    List<FileMetadata> findByBucketNameAndActiveTrue(String bucketName);
}
