package com.skillinfinity.communication.service.impl;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ServiceException;
import com.skillinfinity.communication.dto.response.AttachmentResponse;
import com.skillinfinity.communication.entity.FileMetadata;
import com.skillinfinity.communication.repository.FileMetadataRepository;
import com.skillinfinity.communication.service.FileService;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.errors.MinioException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FileServiceImpl implements FileService {

    private final MinioClient minioClient;
    private final FileMetadataRepository fileMetadataRepository;

    @Value("${communication.minio.bucket:communication-files}")
    private String defaultBucket;

    @Value("${communication.max-file-size:10485760}")
    private long maxFileSize;

    @Value("${communication.minio.url:http://localhost:9000}")
    private String minioUrl;

    @Override
    public AttachmentResponse uploadFile(MultipartFile file, UUID uploaderId) {
        validateFile(file);

        try {
            String objectName = generateObjectName(file.getOriginalFilename());
            String bucketName = defaultBucket;

            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());

            String fileUrl = minioUrl + "/" + bucketName + "/" + objectName;

            FileMetadata metadata = FileMetadata.builder()
                    .id(UUID.randomUUID())
                    .originalName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .minioObjectName(objectName)
                    .bucketName(bucketName)
                    .fileUrl(fileUrl)
                    .uploadedBy(uploaderId)
                    .build();
            fileMetadataRepository.save(metadata);

            log.info("File uploaded: {} size: {} by user: {}", objectName, file.getSize(), uploaderId);

            return AttachmentResponse.builder()
                    .id(metadata.getId())
                    .fileName(file.getOriginalFilename())
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .fileUrl(fileUrl)
                    .build();

        } catch (MinioException e) {
            log.error("MinIO error uploading file: {}", e.getMessage());
            throw new ServiceException("Failed to upload file to storage", e);
        } catch (Exception e) {
            log.error("Error uploading file: {}", e.getMessage());
            throw new ServiceException("Failed to upload file", e);
        }
    }

    @Override
    public AttachmentResponse uploadImage(MultipartFile file, UUID uploaderId) {
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new BadRequestException("Only image files are allowed");
        }
        return uploadFile(file, uploaderId);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadFile(String minioObjectName, String bucketName) {
        try {
            InputStream stream = minioClient.getObject(GetObjectArgs.builder()
                    .bucket(bucketName)
                    .object(minioObjectName)
                    .build());
            return stream.readAllBytes();
        } catch (MinioException e) {
            log.error("MinIO error downloading file: {}", e.getMessage());
            throw new ServiceException("Failed to download file from storage", e);
        } catch (Exception e) {
            log.error("Error downloading file: {}", e.getMessage());
            throw new ServiceException("Failed to download file", e);
        }
    }

    @Override
    public void deleteFile(String minioObjectName, String bucketName) {
        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(minioObjectName)
                    .build());
            log.info("File deleted: {} from bucket: {}", minioObjectName, bucketName);
        } catch (MinioException e) {
            log.error("MinIO error deleting file: {}", e.getMessage());
            throw new ServiceException("Failed to delete file from storage", e);
        } catch (Exception e) {
            log.error("Error deleting file: {}", e.getMessage());
            throw new ServiceException("Failed to delete file", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public String getFileUrl(String minioObjectName, String bucketName) {
        return minioUrl + "/" + bucketName + "/" + minioObjectName;
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }
        if (file.getSize() > maxFileSize) {
            throw new BadRequestException("File size exceeds maximum allowed size of " + maxFileSize + " bytes");
        }
    }

    private String generateObjectName(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }
}
