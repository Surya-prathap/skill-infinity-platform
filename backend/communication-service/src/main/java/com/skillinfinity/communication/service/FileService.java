package com.skillinfinity.communication.service;

import com.skillinfinity.communication.dto.response.AttachmentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface FileService {

    AttachmentResponse uploadFile(MultipartFile file, UUID uploaderId);

    AttachmentResponse uploadImage(MultipartFile file, UUID uploaderId);

    byte[] downloadFile(String minioObjectName, String bucketName);

    void deleteFile(String minioObjectName, String bucketName);

    String getFileUrl(String minioObjectName, String bucketName);
}
