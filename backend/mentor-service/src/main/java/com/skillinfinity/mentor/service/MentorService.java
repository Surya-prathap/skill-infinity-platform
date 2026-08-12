package com.skillinfinity.mentor.service;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.mentor.dto.request.AvailabilityRequest;
import com.skillinfinity.mentor.dto.request.BecomeMentorRequest;
import com.skillinfinity.mentor.dto.request.CertificationRequest;
import com.skillinfinity.mentor.dto.request.ExpertiseRequest;
import com.skillinfinity.mentor.dto.request.LanguageRequest;
import com.skillinfinity.mentor.dto.request.PricingRequest;
import com.skillinfinity.mentor.dto.request.SearchRequest;
import com.skillinfinity.mentor.dto.request.UpdateMentorProfileRequest;
import com.skillinfinity.mentor.dto.request.AchievementRequest;
import com.skillinfinity.mentor.dto.response.AchievementResponse;
import com.skillinfinity.mentor.dto.response.AvailabilityResponse;
import com.skillinfinity.mentor.dto.response.CertificationResponse;
import com.skillinfinity.mentor.dto.response.DashboardResponse;
import com.skillinfinity.mentor.dto.response.EducationResponse;
import com.skillinfinity.mentor.dto.response.ExperienceResponse;
import com.skillinfinity.mentor.dto.response.ExpertiseResponse;
import com.skillinfinity.mentor.dto.response.LanguageResponse;
import com.skillinfinity.mentor.dto.response.MentorPreferenceResponse;
import com.skillinfinity.mentor.dto.response.MentorResponse;
import com.skillinfinity.mentor.dto.response.MentorSummaryResponse;
import com.skillinfinity.mentor.dto.response.PricingResponse;
import com.skillinfinity.mentor.dto.response.SocialProfileResponse;
import com.skillinfinity.mentor.dto.response.TimeSlotResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface MentorService {

    MentorResponse becomeMentor(UUID userId, BecomeMentorRequest request);

    MentorResponse getMentorById(UUID mentorId);

    MentorResponse getMentorByUserId(UUID userId);

    MentorResponse getPublicMentorProfile(UUID mentorId);

    MentorResponse updateMentorProfile(UUID mentorId, UUID userId, UpdateMentorProfileRequest request);

    void deleteMentorProfile(UUID mentorId, UUID userId);

    PageResponse<MentorSummaryResponse> searchMentors(SearchRequest request, int page, int size);

    PageResponse<MentorSummaryResponse> getPendingMentors(int page, int size);

    // Expertise
    ExpertiseResponse addExpertise(UUID mentorId, ExpertiseRequest request);
    ExpertiseResponse updateExpertise(UUID mentorId, UUID expertiseId, ExpertiseRequest request);
    void deleteExpertise(UUID mentorId, UUID expertiseId);
    List<ExpertiseResponse> getExpertise(UUID mentorId);

    // Availability
    List<AvailabilityResponse> addAvailability(UUID mentorId, List<AvailabilityRequest> requests);
    List<AvailabilityResponse> updateAvailability(UUID mentorId, List<AvailabilityRequest> requests);
    List<AvailabilityResponse> getAvailability(UUID mentorId);
    List<TimeSlotResponse> generateTimeSlots(UUID mentorId, LocalDate startDate, LocalDate endDate);

    // Pricing
    PricingResponse addPricing(UUID mentorId, PricingRequest request);
    PricingResponse updatePricing(UUID mentorId, UUID pricingId, PricingRequest request);
    void deletePricing(UUID mentorId, UUID pricingId);
    List<PricingResponse> getPricing(UUID mentorId);

    // Languages
    LanguageResponse addLanguage(UUID mentorId, LanguageRequest request);
    LanguageResponse updateLanguage(UUID mentorId, UUID languageId, LanguageRequest request);
    void deleteLanguage(UUID mentorId, UUID languageId);
    List<LanguageResponse> getLanguages(UUID mentorId);

    // Certifications
    CertificationResponse addCertification(UUID mentorId, CertificationRequest request);
    CertificationResponse updateCertification(UUID mentorId, UUID certificationId, CertificationRequest request);
    void deleteCertification(UUID mentorId, UUID certificationId);
    List<CertificationResponse> getCertifications(UUID mentorId);

    // Dashboard
    DashboardResponse getDashboard(UUID mentorId);

    // Achievements
    AchievementResponse addAchievement(UUID mentorId, AchievementRequest request);
    AchievementResponse updateAchievement(UUID mentorId, UUID achievementId, AchievementRequest request);
    void deleteAchievement(UUID mentorId, UUID achievementId);
    List<AchievementResponse> getAchievements(UUID mentorId);

    // Verify mentor (admin)
    MentorResponse verifyMentor(UUID mentorId, UUID adminId, boolean verified, String rejectionReason);
}
