package com.skillinfinity.user.service;

import com.skillinfinity.user.dto.request.CreateProfileRequest;
import com.skillinfinity.user.dto.request.EducationRequest;
import com.skillinfinity.user.dto.request.ExperienceRequest;
import com.skillinfinity.user.dto.request.LanguageRequest;
import com.skillinfinity.user.dto.request.SkillRequest;
import com.skillinfinity.user.dto.request.UpdateProfileRequest;
import com.skillinfinity.user.dto.response.EducationResponse;
import com.skillinfinity.user.dto.response.ExperienceResponse;
import com.skillinfinity.user.dto.response.LanguageResponse;
import com.skillinfinity.user.dto.response.SkillResponse;
import com.skillinfinity.user.dto.response.UserProfileResponse;

import java.util.List;
import java.util.UUID;

public interface UserProfileService {

    UserProfileResponse createProfile(UUID userId, String email, CreateProfileRequest request);

    UserProfileResponse getProfileByUserId(UUID userId);

    UserProfileResponse getProfileById(UUID profileId);

    UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request);

    void deleteProfile(UUID userId);

    List<UserProfileResponse> searchProfiles(String query);

    // Education
    EducationResponse addEducation(UUID userId, EducationRequest request);
    EducationResponse updateEducation(UUID userId, UUID educationId, EducationRequest request);
    void deleteEducation(UUID userId, UUID educationId);

    // Experience
    ExperienceResponse addExperience(UUID userId, ExperienceRequest request);
    ExperienceResponse updateExperience(UUID userId, UUID experienceId, ExperienceRequest request);
    void deleteExperience(UUID userId, UUID experienceId);

    // Skills
    SkillResponse addSkill(UUID userId, SkillRequest request);
    SkillResponse updateSkill(UUID userId, UUID skillId, SkillRequest request);
    void deleteSkill(UUID userId, UUID skillId);

    // Languages
    LanguageResponse addLanguage(UUID userId, LanguageRequest request);
    LanguageResponse updateLanguage(UUID userId, UUID languageId, LanguageRequest request);
    void deleteLanguage(UUID userId, UUID languageId);
}
