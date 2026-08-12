package com.skillinfinity.mentor.mapper;

import com.skillinfinity.mentor.dto.response.AchievementResponse;
import com.skillinfinity.mentor.dto.response.AvailabilityResponse;
import com.skillinfinity.mentor.dto.response.CertificationResponse;
import com.skillinfinity.mentor.dto.response.DashboardResponse;
import com.skillinfinity.mentor.dto.response.EducationResponse;
import com.skillinfinity.mentor.dto.response.ExperienceResponse;
import com.skillinfinity.mentor.dto.response.ExpertiseResponse;
import com.skillinfinity.mentor.dto.response.LanguageResponse;
import com.skillinfinity.mentor.dto.response.MentorPreferenceResponse;
import com.skillinfinity.mentor.dto.response.MentorProfileResponse;
import com.skillinfinity.mentor.dto.response.MentorResponse;
import com.skillinfinity.mentor.dto.response.MentorStatisticsResponse;
import com.skillinfinity.mentor.dto.response.MentorSummaryResponse;
import com.skillinfinity.mentor.dto.response.PricingResponse;
import com.skillinfinity.mentor.dto.response.SocialProfileResponse;
import com.skillinfinity.mentor.dto.response.TimeSlotResponse;
import com.skillinfinity.mentor.entity.Achievement;
import com.skillinfinity.mentor.entity.Certification;
import com.skillinfinity.mentor.entity.Education;
import com.skillinfinity.mentor.entity.Experience;
import com.skillinfinity.mentor.entity.Expertise;
import com.skillinfinity.mentor.entity.Language;
import com.skillinfinity.mentor.entity.Mentor;
import com.skillinfinity.mentor.entity.MentorAvailability;
import com.skillinfinity.mentor.entity.MentorPreference;
import com.skillinfinity.mentor.entity.MentorProfile;
import com.skillinfinity.mentor.entity.MentorStatistics;
import com.skillinfinity.mentor.entity.Pricing;
import com.skillinfinity.mentor.entity.SocialProfile;
import com.skillinfinity.mentor.entity.TimeSlot;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MentorMapper {

    @Mapping(target = "profile", source = "profile", qualifiedByName = "toProfileResponse")
    @Mapping(target = "expertiseList", source = "expertiseList", qualifiedByName = "toExpertiseResponseList")
    @Mapping(target = "availabilities", source = "availabilities", qualifiedByName = "toAvailabilityResponseList")
    @Mapping(target = "pricingList", source = "pricingList", qualifiedByName = "toPricingResponseList")
    @Mapping(target = "languages", source = "languages", qualifiedByName = "toLanguageResponseList")
    @Mapping(target = "certifications", source = "certifications", qualifiedByName = "toCertificationResponseList")
    @Mapping(target = "achievements", source = "achievements", qualifiedByName = "toAchievementResponseList")
    @Mapping(target = "experiences", source = "experiences", qualifiedByName = "toExperienceResponseList")
    @Mapping(target = "educationList", source = "educationList", qualifiedByName = "toEducationResponseList")
    @Mapping(target = "socialProfiles", source = "socialProfiles", qualifiedByName = "toSocialProfileResponseList")
    @Mapping(target = "preference", source = "preference", qualifiedByName = "toPreferenceResponse")
    @Mapping(target = "statistics", source = "statistics", qualifiedByName = "toStatisticsResponse")
    @Mapping(target = "status", expression = "java(mentor.getStatus() != null ? mentor.getStatus().name() : null)")
    MentorResponse toMentorResponse(Mentor mentor);

    @Named("toProfileResponse")
    @Mapping(target = "teachingLevel", source = "teachingLevel")
    MentorProfileResponse toProfileResponse(MentorProfile profile);

    @Named("toExpertiseResponse")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "subCategoryId", source = "subCategory.id")
    @Mapping(target = "subCategoryName", source = "subCategory.name")
    @Mapping(target = "skillId", source = "skill.id")
    @Mapping(target = "skillName", expression = "java(expertise.getCustomSkillName() != null ? expertise.getCustomSkillName() : (expertise.getSkill() != null ? expertise.getSkill().getName() : null))")
    @Mapping(target = "teachingLevel", expression = "java(expertise.getTeachingLevel() != null ? expertise.getTeachingLevel().name() : null)")
    ExpertiseResponse toExpertiseResponse(Expertise expertise);

    @Named("toExpertiseResponseList")
    List<ExpertiseResponse> toExpertiseResponseList(List<Expertise> expertiseList);

    @Named("toAvailabilityResponse")
    AvailabilityResponse toAvailabilityResponse(MentorAvailability availability);

    @Named("toAvailabilityResponseList")
    List<AvailabilityResponse> toAvailabilityResponseList(List<MentorAvailability> availabilities);

    @Named("toTimeSlotResponse")
    @Mapping(target = "status", expression = "java(timeSlot.getStatus() != null ? timeSlot.getStatus().name() : null)")
    TimeSlotResponse toTimeSlotResponse(TimeSlot timeSlot);

    @Named("toPricingResponse")
    PricingResponse toPricingResponse(Pricing pricing);

    @Named("toPricingResponseList")
    List<PricingResponse> toPricingResponseList(List<Pricing> pricingList);

    @Named("toLanguageResponse")
    LanguageResponse toLanguageResponse(Language language);

    @Named("toLanguageResponseList")
    List<LanguageResponse> toLanguageResponseList(List<Language> languages);

    @Named("toCertificationResponse")
    @Mapping(target = "verificationStatus", expression = "java(certification.getVerificationStatus() != null ? certification.getVerificationStatus().name() : null)")
    CertificationResponse toCertificationResponse(Certification certification);

    @Named("toCertificationResponseList")
    List<CertificationResponse> toCertificationResponseList(List<Certification> certifications);

    @Named("toAchievementResponse")
    AchievementResponse toAchievementResponse(Achievement achievement);

    @Named("toAchievementResponseList")
    List<AchievementResponse> toAchievementResponseList(List<Achievement> achievements);

    @Named("toExperienceResponse")
    ExperienceResponse toExperienceResponse(Experience experience);

    @Named("toExperienceResponseList")
    List<ExperienceResponse> toExperienceResponseList(List<Experience> experiences);

    @Named("toEducationResponse")
    EducationResponse toEducationResponse(Education education);

    @Named("toEducationResponseList")
    List<EducationResponse> toEducationResponseList(List<Education> educationList);

    @Named("toSocialProfileResponse")
    @Mapping(target = "platform", expression = "java(socialProfile.getPlatform() != null ? socialProfile.getPlatform().name() : null)")
    SocialProfileResponse toSocialProfileResponse(SocialProfile socialProfile);

    @Named("toSocialProfileResponseList")
    List<SocialProfileResponse> toSocialProfileResponseList(List<SocialProfile> socialProfiles);

    @Named("toPreferenceResponse")
    MentorPreferenceResponse toPreferenceResponse(MentorPreference preference);

    @Named("toStatisticsResponse")
    MentorStatisticsResponse toStatisticsResponse(MentorStatistics statistics);

    @Mapping(target = "profile", source = "profile", qualifiedByName = "toProfileResponse")
    @Mapping(target = "statistics", source = "statistics", qualifiedByName = "toStatisticsResponse")
    @Mapping(target = "preferences", source = "preference", qualifiedByName = "toPreferenceResponse")
    DashboardResponse toDashboardResponse(Mentor mentor);

    @Mapping(target = "status", expression = "java(mentor.getStatus() != null ? mentor.getStatus().name() : null)")
    @Mapping(target = "verified", source = "mentor.verified")
    @Mapping(target = "createdAt", source = "mentor.createdAt")
    @Mapping(target = "headline", source = "profile.headline")
    @Mapping(target = "bio", source = "profile.bio")
    @Mapping(target = "profilePictureUrl", source = "profile.profilePictureUrl")
    @Mapping(target = "country", source = "profile.country")
    @Mapping(target = "city", source = "profile.city")
    @Mapping(target = "yearsOfExperience", source = "profile.yearsOfExperience")
    @Mapping(target = "averageRating", source = "statistics.averageRating")
    @Mapping(target = "totalReviews", source = "statistics.totalReviews")
    @Mapping(target = "totalSessions", source = "statistics.totalSessions")
    @Mapping(target = "totalStudents", source = "statistics.totalStudents")
    @Mapping(target = "profileCompletionPercentage", source = "profile.profileCompletionPercentage")
    MentorSummaryResponse toMentorSummaryResponse(Mentor mentor);
}
