package com.skillinfinity.mentor.controller;

import com.skillinfinity.common.dto.ApiResponse;
import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.mentor.dto.request.AvailabilityRequest;
import com.skillinfinity.mentor.dto.request.AchievementRequest;
import com.skillinfinity.mentor.dto.request.BecomeMentorRequest;
import com.skillinfinity.mentor.dto.request.CertificationRequest;
import com.skillinfinity.mentor.dto.request.ExpertiseRequest;
import com.skillinfinity.mentor.dto.request.LanguageRequest;
import com.skillinfinity.mentor.dto.request.PricingRequest;
import com.skillinfinity.mentor.dto.request.SearchRequest;
import com.skillinfinity.mentor.dto.request.UpdateMentorProfileRequest;
import com.skillinfinity.mentor.dto.response.AchievementResponse;
import com.skillinfinity.mentor.dto.response.AvailabilityResponse;
import com.skillinfinity.mentor.dto.response.CertificationResponse;
import com.skillinfinity.mentor.dto.response.DashboardResponse;
import com.skillinfinity.mentor.dto.response.ExpertiseResponse;
import com.skillinfinity.mentor.dto.response.LanguageResponse;
import com.skillinfinity.mentor.dto.response.MentorResponse;
import com.skillinfinity.mentor.dto.response.MentorSummaryResponse;
import com.skillinfinity.mentor.dto.response.PricingResponse;
import com.skillinfinity.mentor.dto.response.TimeSlotResponse;
import com.skillinfinity.mentor.service.MentorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/mentors")
@RequiredArgsConstructor
@Tag(name = "Mentor Management", description = "Mentor profile, expertise, availability, pricing, and certification management")
public class MentorController {

    private final MentorService mentorService;

    @PostMapping
    @Operation(summary = "Become a mentor", description = "Registers the authenticated user as a mentor")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Mentor registered successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "User is already a mentor or invalid input")
    })
    public ResponseEntity<ApiResponse<MentorResponse>> becomeMentor(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody BecomeMentorRequest request) {
        log.info("Become mentor request for user: {}", userId);
        MentorResponse response = mentorService.becomeMentor(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Mentor registered successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all mentors", description = "Returns paginated list of active mentors")
    public ResponseEntity<ApiResponse<PageResponse<MentorSummaryResponse>>> getAllMentors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        SearchRequest searchRequest = SearchRequest.builder().build();
        PageResponse<MentorSummaryResponse> response = mentorService.searchMentors(searchRequest, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get pending mentor applications", description = "Returns paginated list of mentors awaiting admin verification (admin only)")
    public ResponseEntity<ApiResponse<PageResponse<MentorSummaryResponse>>> getPendingMentors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<MentorSummaryResponse> response = mentorService.getPendingMentors(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get mentor by ID", description = "Returns full mentor profile for the specified ID")
    public ResponseEntity<ApiResponse<MentorResponse>> getMentorById(@PathVariable UUID id) {
        MentorResponse response = mentorService.getMentorById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update mentor profile", description = "Updates mentor profile information")
    public ResponseEntity<ApiResponse<MentorResponse>> updateMentorProfile(
            @PathVariable UUID id,
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody UpdateMentorProfileRequest request) {
        MentorResponse response = mentorService.updateMentorProfile(id, userId, request);
        return ResponseEntity.ok(ApiResponse.success("Mentor profile updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete mentor profile", description = "Deletes the mentor profile for the specified ID")
    public ResponseEntity<ApiResponse<Void>> deleteMentorProfile(
            @PathVariable UUID id,
            @RequestHeader("X-User-ID") UUID userId) {
        mentorService.deleteMentorProfile(id, userId);
        return ResponseEntity.ok(ApiResponse.success("Mentor profile deleted successfully", null));
    }

    @GetMapping("/search")
    @Operation(summary = "Search mentors", description = "Advanced search mentors by keyword, skill, category, experience, language, price, country")
    public ResponseEntity<ApiResponse<PageResponse<MentorSummaryResponse>>> searchMentors(
            @Valid @ModelAttribute SearchRequest request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<MentorSummaryResponse> response = mentorService.searchMentors(request, page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get my mentor profile", description = "Returns the mentor profile for the authenticated user")
    public ResponseEntity<ApiResponse<MentorResponse>> getMyProfile(
            @RequestHeader("X-User-ID") UUID userId) {
        MentorResponse response = mentorService.getMentorByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}/public")
    @Operation(summary = "Get public mentor profile", description = "Returns public mentor profile without authentication")
    public ResponseEntity<ApiResponse<MentorResponse>> getPublicProfile(@PathVariable UUID id) {
        MentorResponse response = mentorService.getPublicMentorProfile(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ============================================================
    // Expertise Endpoints
    // ============================================================

    @PostMapping("/{id}/expertise")
    @Operation(summary = "Add expertise", description = "Add expertise/skill to mentor profile")
    public ResponseEntity<ApiResponse<ExpertiseResponse>> addExpertise(
            @PathVariable UUID id,
            @Valid @RequestBody ExpertiseRequest request) {
        ExpertiseResponse response = mentorService.addExpertise(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Expertise added successfully", response));
    }

    @PutMapping("/{id}/expertise/{expertiseId}")
    @Operation(summary = "Update expertise", description = "Update mentor expertise entry")
    public ResponseEntity<ApiResponse<ExpertiseResponse>> updateExpertise(
            @PathVariable UUID id,
            @PathVariable UUID expertiseId,
            @Valid @RequestBody ExpertiseRequest request) {
        ExpertiseResponse response = mentorService.updateExpertise(id, expertiseId, request);
        return ResponseEntity.ok(ApiResponse.success("Expertise updated successfully", response));
    }

    @DeleteMapping("/{id}/expertise/{expertiseId}")
    @Operation(summary = "Delete expertise", description = "Delete mentor expertise entry")
    public ResponseEntity<ApiResponse<Void>> deleteExpertise(
            @PathVariable UUID id,
            @PathVariable UUID expertiseId) {
        mentorService.deleteExpertise(id, expertiseId);
        return ResponseEntity.ok(ApiResponse.success("Expertise deleted successfully", null));
    }

    @GetMapping("/{id}/expertise")
    @Operation(summary = "Get expertise", description = "Get all expertise entries for a mentor")
    public ResponseEntity<ApiResponse<List<ExpertiseResponse>>> getExpertise(@PathVariable UUID id) {
        List<ExpertiseResponse> response = mentorService.getExpertise(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ============================================================
    // Availability Endpoints (Self-service - based on authenticated user)
    // ============================================================

    @PostMapping("/availability")
    @Operation(summary = "Add availability (self)", description = "Add weekly availability schedule for authenticated mentor")
    public ResponseEntity<ApiResponse<List<AvailabilityResponse>>> addMyAvailability(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody List<AvailabilityRequest> requests) {
        MentorResponse mentor = mentorService.getMentorByUserId(userId);
        List<AvailabilityResponse> response = mentorService.addAvailability(mentor.getId(), requests);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Availability added successfully", response));
    }

    @PutMapping("/availability")
    @Operation(summary = "Update availability (self)", description = "Replace all availability for authenticated mentor")
    public ResponseEntity<ApiResponse<List<AvailabilityResponse>>> updateMyAvailability(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody List<AvailabilityRequest> requests) {
        MentorResponse mentor = mentorService.getMentorByUserId(userId);
        List<AvailabilityResponse> response = mentorService.updateAvailability(mentor.getId(), requests);
        return ResponseEntity.ok(ApiResponse.success("Availability updated successfully", response));
    }

    @GetMapping("/availability")
    @Operation(summary = "Get availability (self)", description = "Get authenticated mentor's weekly availability schedule")
    public ResponseEntity<ApiResponse<List<AvailabilityResponse>>> getMyAvailability(
            @RequestHeader("X-User-ID") UUID userId) {
        MentorResponse mentor = mentorService.getMentorByUserId(userId);
        List<AvailabilityResponse> response = mentorService.getAvailability(mentor.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // Availability by mentor ID (admin/other services)
    @PostMapping("/{id}/availability")
    @Operation(summary = "Add availability by ID", description = "Add weekly availability schedule for a mentor by ID")
    public ResponseEntity<ApiResponse<List<AvailabilityResponse>>> addAvailability(
            @PathVariable UUID id,
            @Valid @RequestBody List<AvailabilityRequest> requests) {
        List<AvailabilityResponse> response = mentorService.addAvailability(id, requests);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Availability added successfully", response));
    }

    @PutMapping("/{id}/availability")
    @Operation(summary = "Update availability by ID", description = "Replace all availability for a mentor by ID")
    public ResponseEntity<ApiResponse<List<AvailabilityResponse>>> updateAvailability(
            @PathVariable UUID id,
            @Valid @RequestBody List<AvailabilityRequest> requests) {
        List<AvailabilityResponse> response = mentorService.updateAvailability(id, requests);
        return ResponseEntity.ok(ApiResponse.success("Availability updated successfully", response));
    }

    @GetMapping("/{id}/availability")
    @Operation(summary = "Get availability by ID", description = "Get mentor's weekly availability schedule by ID")
    public ResponseEntity<ApiResponse<List<AvailabilityResponse>>> getAvailability(@PathVariable UUID id) {
        List<AvailabilityResponse> response = mentorService.getAvailability(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{id}/availability/generate-slots")
    @Operation(summary = "Generate time slots", description = "Generate available time slots for a date range")
    public ResponseEntity<ApiResponse<List<TimeSlotResponse>>> generateTimeSlots(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<TimeSlotResponse> response = mentorService.generateTimeSlots(id, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("Time slots generated successfully", response));
    }

    // ============================================================
    // Certification Endpoints (Self-service)
    // ============================================================

    @PostMapping("/certifications")
    @Operation(summary = "Add certification (self)", description = "Add certification to authenticated mentor's profile")
    public ResponseEntity<ApiResponse<CertificationResponse>> addMyCertification(
            @RequestHeader("X-User-ID") UUID userId,
            @Valid @RequestBody CertificationRequest request) {
        MentorResponse mentor = mentorService.getMentorByUserId(userId);
        CertificationResponse response = mentorService.addCertification(mentor.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Certification added successfully", response));
    }

    @PutMapping("/certifications/{certificationId}")
    @Operation(summary = "Update certification (self)", description = "Update authenticated mentor's certification")
    public ResponseEntity<ApiResponse<CertificationResponse>> updateMyCertification(
            @RequestHeader("X-User-ID") UUID userId,
            @PathVariable UUID certificationId,
            @Valid @RequestBody CertificationRequest request) {
        MentorResponse mentor = mentorService.getMentorByUserId(userId);
        CertificationResponse response = mentorService.updateCertification(mentor.getId(), certificationId, request);
        return ResponseEntity.ok(ApiResponse.success("Certification updated successfully", response));
    }

    @DeleteMapping("/certifications/{certificationId}")
    @Operation(summary = "Delete certification (self)", description = "Delete authenticated mentor's certification")
    public ResponseEntity<ApiResponse<Void>> deleteMyCertification(
            @RequestHeader("X-User-ID") UUID userId,
            @PathVariable UUID certificationId) {
        MentorResponse mentor = mentorService.getMentorByUserId(userId);
        mentorService.deleteCertification(mentor.getId(), certificationId);
        return ResponseEntity.ok(ApiResponse.success("Certification deleted successfully", null));
    }

    // Certification by mentor ID
    @PostMapping("/{id}/certifications")
    @Operation(summary = "Add certification by ID", description = "Add certification to a mentor by ID")
    public ResponseEntity<ApiResponse<CertificationResponse>> addCertification(
            @PathVariable UUID id,
            @Valid @RequestBody CertificationRequest request) {
        CertificationResponse response = mentorService.addCertification(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Certification added successfully", response));
    }

    @PutMapping("/{id}/certifications/{certificationId}")
    @Operation(summary = "Update certification by ID", description = "Update certification for a mentor by ID")
    public ResponseEntity<ApiResponse<CertificationResponse>> updateCertification(
            @PathVariable UUID id,
            @PathVariable UUID certificationId,
            @Valid @RequestBody CertificationRequest request) {
        CertificationResponse response = mentorService.updateCertification(id, certificationId, request);
        return ResponseEntity.ok(ApiResponse.success("Certification updated successfully", response));
    }

    @DeleteMapping("/{id}/certifications/{certificationId}")
    @Operation(summary = "Delete certification by ID", description = "Delete certification from a mentor by ID")
    public ResponseEntity<ApiResponse<Void>> deleteCertification(
            @PathVariable UUID id,
            @PathVariable UUID certificationId) {
        mentorService.deleteCertification(id, certificationId);
        return ResponseEntity.ok(ApiResponse.success("Certification deleted successfully", null));
    }

    @GetMapping("/{id}/certifications")
    @Operation(summary = "Get certifications", description = "Get all certifications for a mentor")
    public ResponseEntity<ApiResponse<List<CertificationResponse>>> getCertifications(@PathVariable UUID id) {
        List<CertificationResponse> response = mentorService.getCertifications(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ============================================================
    // Pricing Endpoints
    // ============================================================

    @PostMapping("/{id}/pricing")
    @Operation(summary = "Add pricing", description = "Add pricing option for mentor sessions")
    public ResponseEntity<ApiResponse<PricingResponse>> addPricing(
            @PathVariable UUID id,
            @Valid @RequestBody PricingRequest request) {
        PricingResponse response = mentorService.addPricing(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Pricing added successfully", response));
    }

    @PutMapping("/{id}/pricing/{pricingId}")
    @Operation(summary = "Update pricing", description = "Update mentor pricing option")
    public ResponseEntity<ApiResponse<PricingResponse>> updatePricing(
            @PathVariable UUID id,
            @PathVariable UUID pricingId,
            @Valid @RequestBody PricingRequest request) {
        PricingResponse response = mentorService.updatePricing(id, pricingId, request);
        return ResponseEntity.ok(ApiResponse.success("Pricing updated successfully", response));
    }

    @DeleteMapping("/{id}/pricing/{pricingId}")
    @Operation(summary = "Delete pricing", description = "Delete mentor pricing option")
    public ResponseEntity<ApiResponse<Void>> deletePricing(
            @PathVariable UUID id,
            @PathVariable UUID pricingId) {
        mentorService.deletePricing(id, pricingId);
        return ResponseEntity.ok(ApiResponse.success("Pricing deleted successfully", null));
    }

    @GetMapping("/{id}/pricing")
    @Operation(summary = "Get pricing", description = "Get all pricing options for a mentor")
    public ResponseEntity<ApiResponse<List<PricingResponse>>> getPricing(@PathVariable UUID id) {
        List<PricingResponse> response = mentorService.getPricing(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ============================================================
    // Achievement Endpoints
    // ============================================================

    @PostMapping("/{id}/achievements")
    @Operation(summary = "Add achievement", description = "Add achievement/award to mentor profile")
    public ResponseEntity<ApiResponse<AchievementResponse>> addAchievement(
            @PathVariable UUID id,
            @Valid @RequestBody AchievementRequest request) {
        AchievementResponse response = mentorService.addAchievement(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Achievement added successfully", response));
    }

    @PutMapping("/{id}/achievements/{achievementId}")
    @Operation(summary = "Update achievement", description = "Update mentor achievement")
    public ResponseEntity<ApiResponse<AchievementResponse>> updateAchievement(
            @PathVariable UUID id,
            @PathVariable UUID achievementId,
            @Valid @RequestBody AchievementRequest request) {
        AchievementResponse response = mentorService.updateAchievement(id, achievementId, request);
        return ResponseEntity.ok(ApiResponse.success("Achievement updated successfully", response));
    }

    @DeleteMapping("/{id}/achievements/{achievementId}")
    @Operation(summary = "Delete achievement", description = "Delete mentor achievement")
    public ResponseEntity<ApiResponse<Void>> deleteAchievement(
            @PathVariable UUID id,
            @PathVariable UUID achievementId) {
        mentorService.deleteAchievement(id, achievementId);
        return ResponseEntity.ok(ApiResponse.success("Achievement deleted successfully", null));
    }

    @GetMapping("/{id}/achievements")
    @Operation(summary = "Get achievements", description = "Get all achievements for a mentor")
    public ResponseEntity<ApiResponse<List<AchievementResponse>>> getAchievements(@PathVariable UUID id) {
        List<AchievementResponse> response = mentorService.getAchievements(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ============================================================
    // Language Endpoints
    // ============================================================

    @PostMapping("/{id}/languages")
    @Operation(summary = "Add language", description = "Add language to mentor profile")
    public ResponseEntity<ApiResponse<LanguageResponse>> addLanguage(
            @PathVariable UUID id,
            @Valid @RequestBody LanguageRequest request) {
        LanguageResponse response = mentorService.addLanguage(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Language added successfully", response));
    }

    @PutMapping("/{id}/languages/{languageId}")
    @Operation(summary = "Update language", description = "Update mentor language")
    public ResponseEntity<ApiResponse<LanguageResponse>> updateLanguage(
            @PathVariable UUID id,
            @PathVariable UUID languageId,
            @Valid @RequestBody LanguageRequest request) {
        LanguageResponse response = mentorService.updateLanguage(id, languageId, request);
        return ResponseEntity.ok(ApiResponse.success("Language updated successfully", response));
    }

    @DeleteMapping("/{id}/languages/{languageId}")
    @Operation(summary = "Delete language", description = "Delete mentor language")
    public ResponseEntity<ApiResponse<Void>> deleteLanguage(
            @PathVariable UUID id,
            @PathVariable UUID languageId) {
        mentorService.deleteLanguage(id, languageId);
        return ResponseEntity.ok(ApiResponse.success("Language deleted successfully", null));
    }

    // ============================================================
    // Dashboard Endpoint
    // ============================================================

    @GetMapping("/dashboard")
    @Operation(summary = "Get mentor dashboard", description = "Returns dashboard data for the authenticated mentor")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard(
            @RequestHeader("X-User-ID") UUID userId) {
        MentorResponse mentor = mentorService.getMentorByUserId(userId);
        DashboardResponse response = mentorService.getDashboard(mentor.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ============================================================
    // Verification Endpoint (Admin)
    // ============================================================

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verify mentor", description = "Approve or reject mentor verification (Admin only)")
    public ResponseEntity<ApiResponse<MentorResponse>> verifyMentor(
            @PathVariable UUID id,
            @RequestHeader("X-User-ID") UUID adminId,
            @RequestParam boolean verified,
            @RequestParam(required = false) String rejectionReason) {
        MentorResponse response = mentorService.verifyMentor(id, adminId, verified, rejectionReason);
        String message = verified ? "Mentor verified successfully" : "Mentor rejected";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }
}
