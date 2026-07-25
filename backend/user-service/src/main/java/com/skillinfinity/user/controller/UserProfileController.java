package com.skillinfinity.user.controller;

import com.skillinfinity.common.dto.ApiResponse;
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
import com.skillinfinity.user.service.UserProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "User profile management endpoints")
public class UserProfileController {

    private final UserProfileService userProfileService;

    @PostMapping
    @Operation(summary = "Create user profile", description = "Creates a new user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> createProfile(
            @RequestHeader("X-User-ID") UUID userId,
            @RequestHeader(value = "X-User-Email", required = false) String email,
            @Valid @RequestBody CreateProfileRequest request) {
        log.info("Create profile request for user: {}", userId);
        UserProfileResponse response = userProfileService.createProfile(userId, email, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Profile created successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user profile by ID", description = "Returns the user profile for the specified ID")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfileById(@PathVariable UUID id) {
        UserProfileResponse response = userProfileService.getProfileById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current user profile", description = "Returns the profile for the authenticated user")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile(
            @RequestHeader("X-User-ID") UUID userId) {
        UserProfileResponse response = userProfileService.getProfileByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user profile", description = "Updates the user profile for the specified ID")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @PathVariable UUID id,
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody UpdateProfileRequest request) {
        if (!id.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.<UserProfileResponse>error("You can only update your own profile"));
        }
        UserProfileResponse response = userProfileService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user profile", description = "Deletes the user profile for the specified ID")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(
            @PathVariable UUID id,
            @RequestHeader("X-User-ID") UUID userId) {
        if (!id.equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.<Void>error("You can only delete your own profile"));
        }
        userProfileService.deleteProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("Profile deleted successfully", null));
    }

    @GetMapping("/search")
    @Operation(summary = "Search profiles", description = "Search user profiles by name or headline")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> searchProfiles(
            @RequestParam String q) {
        List<UserProfileResponse> results = userProfileService.searchProfiles(q);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    // Education endpoints
    @PostMapping("/{userId}/education")
    @Operation(summary = "Add education", description = "Add education entry to user profile")
    public ResponseEntity<ApiResponse<EducationResponse>> addEducation(
            @PathVariable UUID userId,
            @Valid @RequestBody EducationRequest request) {
        EducationResponse response = userProfileService.addEducation(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)                    .body(ApiResponse.<EducationResponse>success("Education added successfully", response));
    }

    @PutMapping("/{userId}/education/{educationId}")
    @Operation(summary = "Update education", description = "Update education entry")
    public ResponseEntity<ApiResponse<EducationResponse>> updateEducation(
            @PathVariable UUID userId,
            @PathVariable UUID educationId,
            @Valid @RequestBody EducationRequest request) {
        EducationResponse response = userProfileService.updateEducation(userId, educationId, request);
        return ResponseEntity.ok(ApiResponse.success("Education updated successfully", response));
    }

    @DeleteMapping("/{userId}/education/{educationId}")
    @Operation(summary = "Delete education", description = "Delete education entry")
    public ResponseEntity<ApiResponse<Void>> deleteEducation(
            @PathVariable UUID userId,
            @PathVariable UUID educationId) {
        userProfileService.deleteEducation(userId, educationId);
        return ResponseEntity.ok(ApiResponse.success("Education deleted successfully", null));
    }

    // Experience endpoints
    @PostMapping("/{userId}/experience")
    @Operation(summary = "Add experience", description = "Add work experience entry to user profile")
    public ResponseEntity<ApiResponse<ExperienceResponse>> addExperience(
            @PathVariable UUID userId,
            @Valid @RequestBody ExperienceRequest request) {
        ExperienceResponse response = userProfileService.addExperience(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)                    .body(ApiResponse.<ExperienceResponse>success("Experience added successfully", response));
    }

    @PutMapping("/{userId}/experience/{experienceId}")
    @Operation(summary = "Update experience", description = "Update work experience entry")
    public ResponseEntity<ApiResponse<ExperienceResponse>> updateExperience(
            @PathVariable UUID userId,
            @PathVariable UUID experienceId,
            @Valid @RequestBody ExperienceRequest request) {
        ExperienceResponse response = userProfileService.updateExperience(userId, experienceId, request);
        return ResponseEntity.ok(ApiResponse.success("Experience updated successfully", response));
    }

    @DeleteMapping("/{userId}/experience/{experienceId}")
    @Operation(summary = "Delete experience", description = "Delete work experience entry")
    public ResponseEntity<ApiResponse<Void>> deleteExperience(
            @PathVariable UUID userId,
            @PathVariable UUID experienceId) {
        userProfileService.deleteExperience(userId, experienceId);
        return ResponseEntity.ok(ApiResponse.success("Experience deleted successfully", null));
    }

    // Skill endpoints
    @PostMapping("/{userId}/skills")
    @Operation(summary = "Add skill", description = "Add skill to user profile")
    public ResponseEntity<ApiResponse<SkillResponse>> addSkill(
            @PathVariable UUID userId,
            @Valid @RequestBody SkillRequest request) {
        SkillResponse response = userProfileService.addSkill(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)                    .body(ApiResponse.<SkillResponse>success("Skill added successfully", response));
    }

    @PutMapping("/{userId}/skills/{skillId}")
    @Operation(summary = "Update skill", description = "Update user skill")
    public ResponseEntity<ApiResponse<SkillResponse>> updateSkill(
            @PathVariable UUID userId,
            @PathVariable UUID skillId,
            @Valid @RequestBody SkillRequest request) {
        SkillResponse response = userProfileService.updateSkill(userId, skillId, request);
        return ResponseEntity.ok(ApiResponse.success("Skill updated successfully", response));
    }

    @DeleteMapping("/{userId}/skills/{skillId}")
    @Operation(summary = "Delete skill", description = "Delete user skill")
    public ResponseEntity<ApiResponse<Void>> deleteSkill(
            @PathVariable UUID userId,
            @PathVariable UUID skillId) {
        userProfileService.deleteSkill(userId, skillId);
        return ResponseEntity.ok(ApiResponse.success("Skill deleted successfully", null));
    }

    // Language endpoints
    @PostMapping("/{userId}/languages")
    @Operation(summary = "Add language", description = "Add language to user profile")
    public ResponseEntity<ApiResponse<LanguageResponse>> addLanguage(
            @PathVariable UUID userId,
            @Valid @RequestBody LanguageRequest request) {
        LanguageResponse response = userProfileService.addLanguage(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)                    .body(ApiResponse.<LanguageResponse>success("Language added successfully", response));
    }

    @PutMapping("/{userId}/languages/{languageId}")
    @Operation(summary = "Update language", description = "Update user language")
    public ResponseEntity<ApiResponse<LanguageResponse>> updateLanguage(
            @PathVariable UUID userId,
            @PathVariable UUID languageId,
            @Valid @RequestBody LanguageRequest request) {
        LanguageResponse response = userProfileService.updateLanguage(userId, languageId, request);
        return ResponseEntity.ok(ApiResponse.success("Language updated successfully", response));
    }

    @DeleteMapping("/{userId}/languages/{languageId}")
    @Operation(summary = "Delete language", description = "Delete user language")
    public ResponseEntity<ApiResponse<Void>> deleteLanguage(
            @PathVariable UUID userId,
            @PathVariable UUID languageId) {
        userProfileService.deleteLanguage(userId, languageId);
        return ResponseEntity.ok(ApiResponse.success("Language deleted successfully", null));
    }
}
