package com.skillinfinity.user.service.impl;

import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.common.exception.ResourceNotFoundException;
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
import com.skillinfinity.user.entity.Education;
import com.skillinfinity.user.entity.Experience;
import com.skillinfinity.user.entity.Language;
import com.skillinfinity.user.entity.Skill;
import com.skillinfinity.user.entity.UserProfile;
import com.skillinfinity.user.repository.EducationRepository;
import com.skillinfinity.user.repository.ExperienceRepository;
import com.skillinfinity.user.repository.LanguageRepository;
import com.skillinfinity.user.repository.SkillRepository;
import com.skillinfinity.user.repository.UserProfileRepository;
import com.skillinfinity.user.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserProfileServiceImpl implements UserProfileService {

    private final UserProfileRepository userProfileRepository;
    private final EducationRepository educationRepository;
    private final ExperienceRepository experienceRepository;
    private final SkillRepository skillRepository;
    private final LanguageRepository languageRepository;

    @Override
    @Transactional
    public UserProfileResponse createProfile(UUID userId, String email, CreateProfileRequest request) {
        if (userProfileRepository.existsByUserId(userId)) {
            throw new BadRequestException("Profile already exists for user: " + userId);
        }

        UserProfile profile = UserProfile.builder()
                .userId(userId)
                .email(email)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .headline(request.getHeadline())
                .bio(request.getBio())
                .phone(request.getPhone())
                .dateOfBirth(request.getDateOfBirth())
                .country(request.getCountry())
                .city(request.getCity())
                .website(request.getWebsite())
                .linkedinUrl(request.getLinkedinUrl())
                .githubUrl(request.getGithubUrl())
                .profileCompletionPercentage(0)
                .build();

        profile = userProfileRepository.save(profile);
        calculateProfileCompletion(profile);

        log.info("Profile created for user: {}", userId);
        return toProfileResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfileByUserId(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "userId", userId.toString()));
        return toProfileResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfileById(UUID profileId) {
        UserProfile profile = userProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "id", profileId.toString()));
        return toProfileResponse(profile);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "userId", userId.toString()));

        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName());
        if (request.getLastName() != null) profile.setLastName(request.getLastName());
        if (request.getHeadline() != null) profile.setHeadline(request.getHeadline());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getDateOfBirth() != null) profile.setDateOfBirth(request.getDateOfBirth());
        if (request.getCountry() != null) profile.setCountry(request.getCountry());
        if (request.getCity() != null) profile.setCity(request.getCity());
        if (request.getWebsite() != null) profile.setWebsite(request.getWebsite());
        if (request.getLinkedinUrl() != null) profile.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGithubUrl() != null) profile.setGithubUrl(request.getGithubUrl());
        if (request.getTwitterUrl() != null) profile.setTwitterUrl(request.getTwitterUrl());
        if (request.getAddress() != null) profile.setAddress(request.getAddress());
        if (request.getTimezone() != null) profile.setTimezone(request.getTimezone());

        profile = userProfileRepository.save(profile);
        calculateProfileCompletion(profile);

        log.info("Profile updated for user: {}", userId);
        return toProfileResponse(profile);
    }

    @Override
    @Transactional
    public void deleteProfile(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "userId", userId.toString()));
        userProfileRepository.delete(profile);
        log.info("Profile deleted for user: {}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserProfileResponse> searchProfiles(String query) {
        return userProfileRepository.search(query).stream()
                .map(this::toProfileResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EducationResponse addEducation(UUID userId, EducationRequest request) {
        UserProfile profile = getProfileByUserIdEntity(userId);
        Education education = Education.builder()
                .userProfile(profile)
                .institution(request.getInstitution())
                .degree(request.getDegree())
                .fieldOfStudy(request.getFieldOfStudy())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .currentlyStudying(request.isCurrentlyStudying())
                .description(request.getDescription())
                .grade(request.getGrade())
                .sortOrder(request.getSortOrder())
                .build();
        education = educationRepository.save(education);
        log.info("Education added for user: {}", userId);
        return toEducationResponse(education);
    }

    @Override
    @Transactional
    public EducationResponse updateEducation(UUID userId, UUID educationId, EducationRequest request) {
        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> new ResourceNotFoundException("Education", "id", educationId.toString()));
        if (!education.getUserProfile().getUserId().equals(userId)) {
            throw new BadRequestException("Education does not belong to this user");
        }
        if (request.getInstitution() != null) education.setInstitution(request.getInstitution());
        if (request.getDegree() != null) education.setDegree(request.getDegree());
        if (request.getFieldOfStudy() != null) education.setFieldOfStudy(request.getFieldOfStudy());
        if (request.getStartDate() != null) education.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) education.setEndDate(request.getEndDate());
        education.setCurrentlyStudying(request.isCurrentlyStudying());
        if (request.getDescription() != null) education.setDescription(request.getDescription());
        if (request.getGrade() != null) education.setGrade(request.getGrade());
        education.setSortOrder(request.getSortOrder());
        education = educationRepository.save(education);
        return toEducationResponse(education);
    }

    @Override
    @Transactional
    public void deleteEducation(UUID userId, UUID educationId) {
        Education education = educationRepository.findById(educationId)
                .orElseThrow(() -> new ResourceNotFoundException("Education", "id", educationId.toString()));
        if (!education.getUserProfile().getUserId().equals(userId)) {
            throw new BadRequestException("Education does not belong to this user");
        }
        educationRepository.delete(education);
    }

    @Override
    @Transactional
    public ExperienceResponse addExperience(UUID userId, ExperienceRequest request) {
        UserProfile profile = getProfileByUserIdEntity(userId);
        Experience experience = Experience.builder()
                .userProfile(profile)
                .company(request.getCompany())
                .title(request.getTitle())
                .location(request.getLocation())
                .employmentType(request.getEmploymentType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .currentlyWorking(request.isCurrentlyWorking())
                .description(request.getDescription())
                .sortOrder(request.getSortOrder())
                .build();
        experience = experienceRepository.save(experience);
        log.info("Experience added for user: {}", userId);
        return toExperienceResponse(experience);
    }

    @Override
    @Transactional
    public ExperienceResponse updateExperience(UUID userId, UUID experienceId, ExperienceRequest request) {
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience", "id", experienceId.toString()));
        if (!experience.getUserProfile().getUserId().equals(userId)) {
            throw new BadRequestException("Experience does not belong to this user");
        }
        if (request.getCompany() != null) experience.setCompany(request.getCompany());
        if (request.getTitle() != null) experience.setTitle(request.getTitle());
        if (request.getLocation() != null) experience.setLocation(request.getLocation());
        if (request.getEmploymentType() != null) experience.setEmploymentType(request.getEmploymentType());
        if (request.getStartDate() != null) experience.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) experience.setEndDate(request.getEndDate());
        experience.setCurrentlyWorking(request.isCurrentlyWorking());
        if (request.getDescription() != null) experience.setDescription(request.getDescription());
        experience.setSortOrder(request.getSortOrder());
        experience = experienceRepository.save(experience);
        return toExperienceResponse(experience);
    }

    @Override
    @Transactional
    public void deleteExperience(UUID userId, UUID experienceId) {
        Experience experience = experienceRepository.findById(experienceId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience", "id", experienceId.toString()));
        if (!experience.getUserProfile().getUserId().equals(userId)) {
            throw new BadRequestException("Experience does not belong to this user");
        }
        experienceRepository.delete(experience);
    }

    @Override
    @Transactional
    public SkillResponse addSkill(UUID userId, SkillRequest request) {
        UserProfile profile = getProfileByUserIdEntity(userId);
        Skill skill = Skill.builder()
                .userProfile(profile)
                .name(request.getName())
                .proficiencyLevel(request.getProficiencyLevel())
                .yearsOfExperience(request.getYearsOfExperience())
                .sortOrder(request.getSortOrder())
                .build();
        skill = skillRepository.save(skill);
        calculateProfileCompletion(profile);
        log.info("Skill added for user: {}", userId);
        return toSkillResponse(skill);
    }

    @Override
    @Transactional
    public SkillResponse updateSkill(UUID userId, UUID skillId, SkillRequest request) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", skillId.toString()));
        if (!skill.getUserProfile().getUserId().equals(userId)) {
            throw new BadRequestException("Skill does not belong to this user");
        }
        if (request.getName() != null) skill.setName(request.getName());
        if (request.getProficiencyLevel() != null) skill.setProficiencyLevel(request.getProficiencyLevel());
        if (request.getYearsOfExperience() != null) skill.setYearsOfExperience(request.getYearsOfExperience());
        skill.setSortOrder(request.getSortOrder());
        skill = skillRepository.save(skill);
        return toSkillResponse(skill);
    }

    @Override
    @Transactional
    public void deleteSkill(UUID userId, UUID skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", skillId.toString()));
        if (!skill.getUserProfile().getUserId().equals(userId)) {
            throw new BadRequestException("Skill does not belong to this user");
        }
        skillRepository.delete(skill);
        calculateProfileCompletion(skill.getUserProfile());
    }

    @Override
    @Transactional
    public LanguageResponse addLanguage(UUID userId, LanguageRequest request) {
        UserProfile profile = getProfileByUserIdEntity(userId);
        Language language = Language.builder()
                .userProfile(profile)
                .name(request.getName())
                .proficiencyLevel(request.getProficiencyLevel())
                .isNative(request.isNative())
                .sortOrder(request.getSortOrder())
                .build();
        language = languageRepository.save(language);
        log.info("Language added for user: {}", userId);
        return toLanguageResponse(language);
    }

    @Override
    @Transactional
    public LanguageResponse updateLanguage(UUID userId, UUID languageId, LanguageRequest request) {
        Language language = languageRepository.findById(languageId)
                .orElseThrow(() -> new ResourceNotFoundException("Language", "id", languageId.toString()));
        if (!language.getUserProfile().getUserId().equals(userId)) {
            throw new BadRequestException("Language does not belong to this user");
        }
        if (request.getName() != null) language.setName(request.getName());
        if (request.getProficiencyLevel() != null) language.setProficiencyLevel(request.getProficiencyLevel());
        language.setNative(request.isNative());
        language.setSortOrder(request.getSortOrder());
        language = languageRepository.save(language);
        return toLanguageResponse(language);
    }

    @Override
    @Transactional
    public void deleteLanguage(UUID userId, UUID languageId) {
        Language language = languageRepository.findById(languageId)
                .orElseThrow(() -> new ResourceNotFoundException("Language", "id", languageId.toString()));
        if (!language.getUserProfile().getUserId().equals(userId)) {
            throw new BadRequestException("Language does not belong to this user");
        }
        languageRepository.delete(language);
    }

    private void calculateProfileCompletion(UserProfile profile) {
        int score = 0;
        int total = 14;

        if (profile.getFirstName() != null && !profile.getFirstName().isBlank()) score++;
        if (profile.getLastName() != null && !profile.getLastName().isBlank()) score++;
        if (profile.getHeadline() != null && !profile.getHeadline().isBlank()) score++;
        if (profile.getBio() != null && !profile.getBio().isBlank()) score++;
        if (profile.getPhone() != null && !profile.getPhone().isBlank()) score++;
        if (profile.getCountry() != null && !profile.getCountry().isBlank()) score++;
        if (profile.getCity() != null && !profile.getCity().isBlank()) score++;
        if (profile.getWebsite() != null && !profile.getWebsite().isBlank()) score++;
        if (profile.getProfilePictureUrl() != null) score++;
        if (profile.getEducations() != null && !profile.getEducations().isEmpty()) score++;
        if (profile.getExperiences() != null && !profile.getExperiences().isEmpty()) score++;
        if (profile.getSkills() != null && !profile.getSkills().isEmpty()) score++;
        if (profile.getLanguages() != null && !profile.getLanguages().isEmpty()) score++;

        int percentage = (int) Math.round((double) score / total * 100);
        profile.setProfileCompletionPercentage(Math.min(percentage, 100));
        userProfileRepository.save(profile);
    }

    private UserProfile getProfileByUserIdEntity(UUID userId) {
        return userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("UserProfile", "userId", userId.toString()));
    }

    private UserProfileResponse toProfileResponse(UserProfile profile) {
        return UserProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUserId())
                .email(profile.getEmail())
                .firstName(profile.getFirstName())
                .lastName(profile.getLastName())
                .headline(profile.getHeadline())
                .bio(profile.getBio())
                .phone(profile.getPhone())
                .dateOfBirth(profile.getDateOfBirth())
                .country(profile.getCountry())
                .city(profile.getCity())
                .address(profile.getAddress())
                .timezone(profile.getTimezone())
                .profilePictureUrl(profile.getProfilePictureUrl())
                .resumeUrl(profile.getResumeUrl())
                .website(profile.getWebsite())
                .linkedinUrl(profile.getLinkedinUrl())
                .githubUrl(profile.getGithubUrl())
                .twitterUrl(profile.getTwitterUrl())
                .profileCompletionPercentage(profile.getProfileCompletionPercentage())
                .educations(profile.getEducations().stream().map(this::toEducationResponse).toList())
                .experiences(profile.getExperiences().stream().map(this::toExperienceResponse).toList())
                .skills(profile.getSkills().stream().map(this::toSkillResponse).toList())
                .languages(profile.getLanguages().stream().map(this::toLanguageResponse).toList())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private EducationResponse toEducationResponse(Education e) {
        return EducationResponse.builder()
                .id(e.getId()).institution(e.getInstitution()).degree(e.getDegree())
                .fieldOfStudy(e.getFieldOfStudy()).startDate(e.getStartDate()).endDate(e.getEndDate())
                .currentlyStudying(e.isCurrentlyStudying()).description(e.getDescription())
                .grade(e.getGrade()).sortOrder(e.getSortOrder()).build();
    }

    private ExperienceResponse toExperienceResponse(Experience e) {
        return ExperienceResponse.builder()
                .id(e.getId()).company(e.getCompany()).title(e.getTitle())
                .location(e.getLocation()).employmentType(e.getEmploymentType())
                .startDate(e.getStartDate()).endDate(e.getEndDate())
                .currentlyWorking(e.isCurrentlyWorking()).description(e.getDescription())
                .sortOrder(e.getSortOrder()).build();
    }

    private SkillResponse toSkillResponse(Skill s) {
        return SkillResponse.builder()
                .id(s.getId()).name(s.getName())
                .proficiencyLevel(s.getProficiencyLevel())
                .yearsOfExperience(s.getYearsOfExperience())
                .sortOrder(s.getSortOrder()).build();
    }

    private LanguageResponse toLanguageResponse(Language l) {
        return LanguageResponse.builder()
                .id(l.getId()).name(l.getName())
                .proficiencyLevel(l.getProficiencyLevel())
                .isNative(l.isNative()).sortOrder(l.getSortOrder()).build();
    }
}
