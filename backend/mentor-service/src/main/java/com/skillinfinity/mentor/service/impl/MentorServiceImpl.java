package com.skillinfinity.mentor.service.impl;

import com.skillinfinity.common.dto.PageResponse;
import com.skillinfinity.common.exception.BadRequestException;
import com.skillinfinity.mentor.dto.request.AvailabilityRequest;
import com.skillinfinity.mentor.dto.request.BecomeMentorRequest;
import com.skillinfinity.mentor.dto.request.ExpertiseRequest;
import com.skillinfinity.mentor.dto.request.LanguageRequest;
import com.skillinfinity.mentor.dto.request.PricingRequest;
import com.skillinfinity.mentor.dto.request.SearchRequest;
import com.skillinfinity.mentor.dto.request.UpdateMentorProfileRequest;
import com.skillinfinity.mentor.dto.response.AvailabilityResponse;
import com.skillinfinity.mentor.dto.response.DashboardResponse;
import com.skillinfinity.mentor.dto.response.ExpertiseResponse;
import com.skillinfinity.mentor.dto.response.LanguageResponse;
import com.skillinfinity.mentor.dto.response.MentorResponse;
import com.skillinfinity.mentor.dto.response.MentorSummaryResponse;
import com.skillinfinity.mentor.dto.response.PricingResponse;
import com.skillinfinity.mentor.dto.response.TimeSlotResponse;
import com.skillinfinity.mentor.entity.Category;
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
import com.skillinfinity.mentor.entity.Skill;
import com.skillinfinity.mentor.entity.SubCategory;
import com.skillinfinity.mentor.entity.TimeSlot;
import com.skillinfinity.mentor.enumeration.MentorStatus;
import com.skillinfinity.mentor.enumeration.SlotStatus;
import com.skillinfinity.mentor.enumeration.TeachingLevel;
import com.skillinfinity.mentor.exception.CategoryNotFoundException;
import com.skillinfinity.mentor.exception.DuplicateSkillException;
import com.skillinfinity.mentor.exception.InvalidAvailabilityException;
import com.skillinfinity.mentor.exception.MentorNotFoundException;
import com.skillinfinity.mentor.event.MentorEventPublisher;
import com.skillinfinity.mentor.mapper.MentorMapper;
import com.skillinfinity.mentor.repository.CategoryRepository;
import com.skillinfinity.mentor.repository.ExpertiseRepository;
import com.skillinfinity.mentor.repository.LanguageRepository;
import com.skillinfinity.mentor.repository.MentorAvailabilityRepository;
import com.skillinfinity.mentor.repository.MentorEducationRepository;
import com.skillinfinity.mentor.repository.MentorExperienceRepository;
import com.skillinfinity.mentor.repository.MentorPreferenceRepository;
import com.skillinfinity.mentor.repository.MentorProfileRepository;
import com.skillinfinity.mentor.repository.MentorRepository;
import com.skillinfinity.mentor.repository.MentorStatisticsRepository;
import com.skillinfinity.mentor.repository.PricingRepository;
import com.skillinfinity.mentor.repository.SkillRepository;
import com.skillinfinity.mentor.repository.SocialProfileRepository;
import com.skillinfinity.mentor.repository.SubCategoryRepository;
import com.skillinfinity.mentor.repository.TimeSlotRepository;
import com.skillinfinity.mentor.service.MentorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MentorServiceImpl implements MentorService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final List<String> VALID_DAYS = List.of(
            "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
    );

    /**
     * The session durations a mentor may configure for a session type. This is
     * the backend source of truth — the frontend selector mirrors it. 10 and
     * 20 minute sessions are supported (session-service enforces a 10-minute
     * minimum on actual session times).
     */
    private static final List<Integer> SUPPORTED_SESSION_DURATIONS = List.of(10, 20, 30, 45, 60, 90, 120);

    private final MentorRepository mentorRepository;
    private final MentorProfileRepository mentorProfileRepository;
    private final MentorStatisticsRepository mentorStatisticsRepository;
    private final MentorPreferenceRepository mentorPreferenceRepository;
    private final ExpertiseRepository expertiseRepository;
    private final MentorAvailabilityRepository mentorAvailabilityRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final PricingRepository pricingRepository;
    private final LanguageRepository languageRepository;
    private final MentorExperienceRepository mentorExperienceRepository;
    private final MentorEducationRepository mentorEducationRepository;
    private final CategoryRepository categoryRepository;
    private final SubCategoryRepository subCategoryRepository;
    private final SkillRepository skillRepository;
    private final SocialProfileRepository socialProfileRepository;
    private final MentorMapper mentorMapper;
    private final MentorEventPublisher eventPublisher;

    @Override
    @Transactional
    public MentorResponse becomeMentor(UUID userId, BecomeMentorRequest request) {
        if (mentorRepository.existsByUserId(userId)) {
            throw new BadRequestException("User is already a mentor: " + userId);
        }

        Mentor mentor = Mentor.builder()
                .userId(userId)
                .status(MentorStatus.PENDING_VERIFICATION)
                .verified(false)
                .build();

        mentor = mentorRepository.save(mentor);

        MentorProfile profile = MentorProfile.builder()
                .mentor(mentor)
                .headline(request.getHeadline())
                .bio(request.getBio())
                .aboutMe(request.getAboutMe())
                .country(request.getCountry())
                .city(request.getCity())
                .timezone(request.getTimezone())
                .yearsOfExperience(request.getYearsOfExperience())
                .profileCompletionPercentage(calculateProfileCompletion(mentor))
                .build();

        mentor.setProfile(mentorProfileRepository.save(profile));

        MentorStatistics statistics = MentorStatistics.builder()
                .mentor(mentor)
                .build();
        mentor.setStatistics(mentorStatisticsRepository.save(statistics));

        MentorPreference preference = MentorPreference.builder()
                .mentor(mentor)
                .build();
        mentor.setPreference(mentorPreferenceRepository.save(preference));

        mentor = mentorRepository.save(mentor);

        eventPublisher.publishMentorRegistered(mentor.getId(), userId,
                null, request.getHeadline(), request.getCountry());

        log.info("Mentor registered successfully: userId={}, mentorId={}", userId, mentor.getId());
        return mentorMapper.toMentorResponse(mentor);
    }

    @Override
    @Transactional(readOnly = true)
    public MentorResponse getMentorById(UUID mentorId) {
        Mentor mentor = findMentorById(mentorId);
        return mentorMapper.toMentorResponse(mentor);
    }

    @Override
    @Transactional(readOnly = true)
    public MentorResponse getMentorByUserId(UUID userId) {
        Mentor mentor = mentorRepository.findByUserId(userId)
                .orElseThrow(() -> new MentorNotFoundException("userId", userId.toString()));
        return mentorMapper.toMentorResponse(mentor);
    }

    @Override
    @Transactional(readOnly = true)
    public MentorResponse getPublicMentorProfile(UUID mentorId) {
        Mentor mentor = findMentorById(mentorId);
        if (!mentor.isVerified() || !MentorStatus.ACTIVE.equals(mentor.getStatus())) {
            throw new MentorNotFoundException("id", mentorId.toString());
        }
        if (mentor.getProfile() != null && !mentor.getProfile().isProfileVisible()) {
            throw new MentorNotFoundException("id", mentorId.toString());
        }
        return mentorMapper.toMentorResponse(mentor);
    }

    @Override
    @Transactional
    public MentorResponse updateMentorProfile(UUID mentorId, UUID userId, UpdateMentorProfileRequest request) {
        Mentor mentor = findMentorById(mentorId);
        validateOwnership(mentor, userId);

        MentorProfile profile = mentor.getProfile();
        if (profile == null) {
            profile = MentorProfile.builder().mentor(mentor).build();
        }

        if (request.getHeadline() != null) profile.setHeadline(request.getHeadline());
        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getAboutMe() != null) profile.setAboutMe(request.getAboutMe());
        if (request.getProfilePictureUrl() != null) profile.setProfilePictureUrl(request.getProfilePictureUrl());
        if (request.getCoverImageUrl() != null) profile.setCoverImageUrl(request.getCoverImageUrl());
        if (request.getCountry() != null) profile.setCountry(request.getCountry());
        if (request.getCity() != null) profile.setCity(request.getCity());
        if (request.getTimezone() != null) profile.setTimezone(request.getTimezone());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getWebsite() != null) profile.setWebsite(request.getWebsite());
        if (request.getYearsOfExperience() != null) profile.setYearsOfExperience(request.getYearsOfExperience());
        if (request.getTeachingLevel() != null) profile.setTeachingLevel(request.getTeachingLevel());
        if (request.getProfileVisible() != null) profile.setProfileVisible(request.getProfileVisible());
        if (request.getAcceptingStudents() != null) profile.setAcceptingStudents(request.getAcceptingStudents());
        if (request.getMaxStudents() != null) profile.setMaxStudents(request.getMaxStudents());

        profile.setProfileCompletionPercentage(calculateProfileCompletion(mentor));
        mentorProfileRepository.save(profile);

        eventPublisher.publishMentorProfileUpdated(mentorId, userId,
                profile.getHeadline(), profile.getBio(), profile.getCountry(),
                profile.getCity(), profile.getTimezone(),
                profile.getYearsOfExperience(), profile.getProfileCompletionPercentage());

        log.info("Mentor profile updated: mentorId={}", mentorId);
        return mentorMapper.toMentorResponse(mentor);
    }

    @Override
    @Transactional
    public void deleteMentorProfile(UUID mentorId, UUID userId) {
        Mentor mentor = findMentorById(mentorId);
        validateOwnership(mentor, userId);
        mentorRepository.delete(mentor);
        log.info("Mentor profile deleted: mentorId={}", mentorId);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MentorSummaryResponse> searchMentors(SearchRequest request, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "statistics.averageRating"));

        Page<Mentor> mentorPage;
        if (request.getKeyword() != null && !request.getKeyword().isBlank()) {
            mentorPage = mentorRepository.searchMentors(request.getKeyword(), pageable);
        } else if (request.getSkills() != null && !request.getSkills().isEmpty()) {
            List<UUID> skillIds = request.getSkills().stream().map(UUID::fromString).toList();
            mentorPage = mentorRepository.findBySkillIds(skillIds, pageable);
        } else if (request.getCountry() != null && !request.getCountry().isBlank()) {
            mentorPage = mentorRepository.findByCountry(request.getCountry(), pageable);
        } else {
            mentorPage = mentorRepository.findByStatus(MentorStatus.ACTIVE, pageable);
        }

        List<MentorSummaryResponse> content = mentorPage.getContent().stream()
                .map(mentorMapper::toMentorSummaryResponse)
                .toList();

        return PageResponse.of(content, page, size, mentorPage.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MentorSummaryResponse> getPendingMentors(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        Page<Mentor> mentorPage = mentorRepository.findByStatus(MentorStatus.PENDING_VERIFICATION, pageable);

        List<MentorSummaryResponse> content = mentorPage.getContent().stream()
                .map(mentorMapper::toMentorSummaryResponse)
                .toList();

        return PageResponse.of(content, page, size, mentorPage.getTotalElements());
    }

    @Override
    @Transactional
    public ExpertiseResponse addExpertise(UUID mentorId, ExpertiseRequest request) {
        Mentor mentor = findMentorById(mentorId);

        String skillName = request.getCustomSkillName();
        if (request.getSkillId() != null) {
            Skill skill = skillRepository.findById(request.getSkillId())
                    .orElseThrow(() -> new CategoryNotFoundException("skillId", request.getSkillId().toString()));
            skillName = skill.getName();
        }

        if (skillName != null && expertiseRepository.existsByMentorIdAndSkillNameIgnoreCase(mentorId, skillName)) {
            throw new DuplicateSkillException(skillName);
        }

        Expertise expertise = Expertise.builder()
                .mentor(mentor)
                .customSkillName(request.getCustomSkillName())
                .yearsOfExperience(request.getYearsOfExperience())
                .teachingLevel(request.getTeachingLevel() != null ? TeachingLevel.valueOf(request.getTeachingLevel()) : null)
                .proficiencyLevel(request.getProficiencyLevel())
                .description(request.getDescription())
                .learningDomains(request.getLearningDomains())
                .technologies(request.getTechnologies())
                .displayOrder(request.getDisplayOrder())
                .build();

        if (request.getCategoryId() != null) {
            expertise.setCategory(categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new CategoryNotFoundException("categoryId", request.getCategoryId().toString())));
        }
        if (request.getSubCategoryId() != null) {
            expertise.setSubCategory(subCategoryRepository.findById(request.getSubCategoryId())
                    .orElseThrow(() -> new CategoryNotFoundException("subCategoryId", request.getSubCategoryId().toString())));
        }
        if (request.getSkillId() != null) {
            expertise.setSkill(skillRepository.findById(request.getSkillId())
                    .orElseThrow(() -> new CategoryNotFoundException("skillId", request.getSkillId().toString())));
        }

        expertise = expertiseRepository.save(expertise);
        log.info("Expertise added: mentorId={}, skill={}", mentorId, skillName);
        return mentorMapper.toExpertiseResponse(expertise);
    }

    @Override
    @Transactional
    public ExpertiseResponse updateExpertise(UUID mentorId, UUID expertiseId, ExpertiseRequest request) {
        Expertise expertise = expertiseRepository.findById(expertiseId)
                .orElseThrow(() -> new MentorNotFoundException("expertiseId", expertiseId.toString()));

        if (!expertise.getMentor().getId().equals(mentorId)) {
            throw new BadRequestException("Expertise does not belong to this mentor");
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new CategoryNotFoundException("categoryId", request.getCategoryId().toString()));
            expertise.setCategory(category);
        }
        if (request.getSubCategoryId() != null) {
            SubCategory subCategory = subCategoryRepository.findById(request.getSubCategoryId())
                    .orElseThrow(() -> new CategoryNotFoundException("subCategoryId", request.getSubCategoryId().toString()));
            expertise.setSubCategory(subCategory);
        }
        if (request.getSkillId() != null) {
            Skill skill = skillRepository.findById(request.getSkillId())
                    .orElseThrow(() -> new CategoryNotFoundException("skillId", request.getSkillId().toString()));
            expertise.setSkill(skill);
        }
        if (request.getCustomSkillName() != null) expertise.setCustomSkillName(request.getCustomSkillName());
        if (request.getYearsOfExperience() != null) expertise.setYearsOfExperience(request.getYearsOfExperience());
        if (request.getTeachingLevel() != null) expertise.setTeachingLevel(TeachingLevel.valueOf(request.getTeachingLevel()));
        if (request.getProficiencyLevel() != null) expertise.setProficiencyLevel(request.getProficiencyLevel());
        if (request.getDescription() != null) expertise.setDescription(request.getDescription());
        if (request.getLearningDomains() != null) expertise.setLearningDomains(request.getLearningDomains());
        if (request.getTechnologies() != null) expertise.setTechnologies(request.getTechnologies());

        expertise = expertiseRepository.save(expertise);
        return mentorMapper.toExpertiseResponse(expertise);
    }

    @Override
    @Transactional
    public void deleteExpertise(UUID mentorId, UUID expertiseId) {
        Expertise expertise = expertiseRepository.findById(expertiseId)
                .orElseThrow(() -> new MentorNotFoundException("expertiseId", expertiseId.toString()));
        if (!expertise.getMentor().getId().equals(mentorId)) {
            throw new BadRequestException("Expertise does not belong to this mentor");
        }
        expertiseRepository.delete(expertise);
        log.info("Expertise deleted: mentorId={}, expertiseId={}", mentorId, expertiseId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpertiseResponse> getExpertise(UUID mentorId) {
        return expertiseRepository.findByMentorIdOrderByDisplayOrderAsc(mentorId).stream()
                .map(mentorMapper::toExpertiseResponse)
                .toList();
    }

    @Override
    @Transactional
    public List<AvailabilityResponse> addAvailability(UUID mentorId, List<AvailabilityRequest> requests) {
        Mentor mentor = findMentorById(mentorId);
        List<MentorAvailability> saved = new ArrayList<>();

        for (AvailabilityRequest req : requests) {
            validateAvailabilityRequest(req);

            Optional<MentorAvailability> existing = mentorAvailabilityRepository
                    .findByMentorIdAndDayOfWeek(mentorId, req.getDayOfWeek());
            if (existing.isPresent() && req.isRecurring()) {
                throw new InvalidAvailabilityException(
                        "Availability already exists for " + req.getDayOfWeek());
            }

            MentorAvailability availability = MentorAvailability.builder()
                    .mentor(mentor)
                    .dayOfWeek(req.getDayOfWeek())
                    .startTime(req.getStartTime())
                    .endTime(req.getEndTime())
                    .breakStartTime(req.getBreakStartTime())
                    .breakEndTime(req.getBreakEndTime())
                    .slotDurationMinutes(req.getSlotDurationMinutes() != null ? req.getSlotDurationMinutes() : 60)
                    .recurring(req.isRecurring())
                    .specificDate(req.getSpecificDate())
                    .timezone(req.getTimezone())
                    .build();

            saved.add(mentorAvailabilityRepository.save(availability));
        }

        eventPublisher.publishMentorAvailabilityUpdated(mentorId, mentor.getUserId(), saved.size());

        log.info("Availability added: mentorId={}, slots={}", mentorId, requests.size());
        return saved.stream().map(mentorMapper::toAvailabilityResponse).toList();
    }

    @Override
    @Transactional
    public List<AvailabilityResponse> updateAvailability(UUID mentorId, List<AvailabilityRequest> requests) {
        mentorAvailabilityRepository.deleteByMentorId(mentorId);
        return addAvailability(mentorId, requests);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AvailabilityResponse> getAvailability(UUID mentorId) {
        return mentorAvailabilityRepository.findByMentorIdOrderByDayOfWeekAsc(mentorId).stream()
                .map(mentorMapper::toAvailabilityResponse)
                .toList();
    }

    @Override
    @Transactional
    public List<TimeSlotResponse> generateTimeSlots(UUID mentorId, LocalDate startDate, LocalDate endDate) {
        List<MentorAvailability> availabilities = mentorAvailabilityRepository.findByMentorIdAndActiveTrue(mentorId);
        if (availabilities.isEmpty()) {
            throw new InvalidAvailabilityException("No availability defined for mentor");
        }

        List<TimeSlot> generatedSlots = new ArrayList<>();
        LocalDate current = startDate;

        while (!current.isAfter(endDate)) {
            String dayName = current.getDayOfWeek().name();

            for (MentorAvailability availability : availabilities) {
                if (!availability.getDayOfWeek().equalsIgnoreCase(dayName)) {
                    continue;
                }

                LocalTime slotStart;
                LocalTime slotEnd;
                try {
                    slotStart = LocalTime.parse(availability.getStartTime(), TIME_FORMATTER);
                    slotEnd = LocalTime.parse(availability.getEndTime(), TIME_FORMATTER);
                } catch (DateTimeParseException e) {
                    log.warn("Invalid time format for availability: id={}", availability.getId());
                    continue;
                }

                int durationMinutes = availability.getSlotDurationMinutes() != null
                        ? availability.getSlotDurationMinutes() : 60;

                if (availability.getBreakStartTime() != null && availability.getBreakEndTime() != null) {
                    try {
                        LocalTime breakStart = LocalTime.parse(availability.getBreakStartTime(), TIME_FORMATTER);
                        LocalTime breakEnd = LocalTime.parse(availability.getBreakEndTime(), TIME_FORMATTER);

                        generatedSlots.addAll(
                                generateSlotsForRange(mentorId, availability, current, slotStart, breakStart, durationMinutes));
                        generatedSlots.addAll(
                                generateSlotsForRange(mentorId, availability, current, breakEnd, slotEnd, durationMinutes));
                    } catch (DateTimeParseException e) {
                        log.warn("Invalid break time format for availability: id={}", availability.getId());
                    }
                } else {
                    generatedSlots.addAll(
                            generateSlotsForRange(mentorId, availability, current, slotStart, slotEnd, durationMinutes));
                }
            }
            current = current.plusDays(1);
        }

        List<TimeSlot> savedSlots = timeSlotRepository.saveAll(generatedSlots);
        log.info("Generated {} time slots for mentor: {}", savedSlots.size(), mentorId);
        return savedSlots.stream().map(mentorMapper::toTimeSlotResponse).toList();
    }

    private List<TimeSlot> generateSlotsForRange(UUID mentorId, MentorAvailability availability,
                                                  LocalDate date, LocalTime rangeStart, LocalTime rangeEnd,
                                                  int durationMinutes) {
        List<TimeSlot> slots = new ArrayList<>();
        LocalTime currentStart = rangeStart;

        while (currentStart.plusMinutes(durationMinutes).isBefore(rangeEnd)
                || currentStart.plusMinutes(durationMinutes).equals(rangeEnd)) {
            LocalTime currentEnd = currentStart.plusMinutes(durationMinutes);

            if (!timeSlotRepository.existsOverlappingSlot(mentorId, date, currentStart, currentEnd)) {
                TimeSlot slot = TimeSlot.builder()
                        .availability(availability)
                        .date(date)
                        .startTime(currentStart)
                        .endTime(currentEnd)
                        .status(SlotStatus.AVAILABLE)
                        .build();
                slots.add(slot);
            }

            currentStart = currentEnd;
        }

        return slots;
    }

    @Override
    @Transactional
    public PricingResponse addPricing(UUID mentorId, PricingRequest request) {
        Mentor mentor = findMentorById(mentorId);
        validatePricingDuration(request.getDurationMinutes());

        Pricing pricing = Pricing.builder()
                .mentor(mentor)
                .sessionType(request.getSessionType())
                .price(request.getPrice() != null ? request.getPrice() : BigDecimal.ZERO)
                .originalPrice(request.getOriginalPrice())
                .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                .discountPercentage(request.getDiscountPercentage())
                .durationMinutes(request.getDurationMinutes())
                .isFree(request.isFree())
                .description(request.getDescription())
                .build();

        pricing = pricingRepository.save(pricing);
        log.info("Pricing added: mentorId={}, type={}", mentorId, request.getSessionType());
        return mentorMapper.toPricingResponse(pricing);
    }

    @Override
    @Transactional
    public PricingResponse updatePricing(UUID mentorId, UUID pricingId, PricingRequest request) {
        Pricing pricing = pricingRepository.findById(pricingId)
                .orElseThrow(() -> new MentorNotFoundException("pricingId", pricingId.toString()));
        if (!pricing.getMentor().getId().equals(mentorId)) {
            throw new BadRequestException("Pricing does not belong to this mentor");
        }

        if (request.getDurationMinutes() != null) {
            validatePricingDuration(request.getDurationMinutes());
        }
        if (request.getSessionType() != null) pricing.setSessionType(request.getSessionType());
        if (request.getPrice() != null) pricing.setPrice(request.getPrice());
        if (request.getOriginalPrice() != null) pricing.setOriginalPrice(request.getOriginalPrice());
        if (request.getCurrency() != null) pricing.setCurrency(request.getCurrency());
        if (request.getDiscountPercentage() != null) pricing.setDiscountPercentage(request.getDiscountPercentage());
        if (request.getDurationMinutes() != null) pricing.setDurationMinutes(request.getDurationMinutes());
        pricing.setFree(request.isFree());
        if (request.getDescription() != null) pricing.setDescription(request.getDescription());

        pricing = pricingRepository.save(pricing);
        return mentorMapper.toPricingResponse(pricing);
    }

    @Override
    @Transactional
    public void deletePricing(UUID mentorId, UUID pricingId) {
        Pricing pricing = pricingRepository.findById(pricingId)
                .orElseThrow(() -> new MentorNotFoundException("pricingId", pricingId.toString()));
        if (!pricing.getMentor().getId().equals(mentorId)) {
            throw new BadRequestException("Pricing does not belong to this mentor");
        }
        pricingRepository.delete(pricing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PricingResponse> getPricing(UUID mentorId) {
        return pricingRepository.findByMentorIdOrderBySessionTypeAsc(mentorId).stream()
                .map(mentorMapper::toPricingResponse)
                .toList();
    }

    @Override
    @Transactional
    public LanguageResponse addLanguage(UUID mentorId, LanguageRequest request) {
        Mentor mentor = findMentorById(mentorId);

        languageRepository.findByMentorIdAndNameIgnoreCase(mentorId, request.getName())
                .ifPresent(l -> { throw new BadRequestException("Language already exists: " + request.getName()); });

        Language language = Language.builder()
                .mentor(mentor)
                .name(request.getName())
                .proficiencyLevel(request.getProficiencyLevel())
                .isNative(request.isNative())
                .sortOrder(request.getSortOrder())
                .build();

        language = languageRepository.save(language);
        return mentorMapper.toLanguageResponse(language);
    }

    @Override
    @Transactional
    public LanguageResponse updateLanguage(UUID mentorId, UUID languageId, LanguageRequest request) {
        Language language = languageRepository.findById(languageId)
                .orElseThrow(() -> new MentorNotFoundException("languageId", languageId.toString()));
        if (!language.getMentor().getId().equals(mentorId)) {
            throw new BadRequestException("Language does not belong to this mentor");
        }

        if (request.getName() != null) language.setName(request.getName());
        if (request.getProficiencyLevel() != null) language.setProficiencyLevel(request.getProficiencyLevel());
        language.setNative(request.isNative());
        language.setSortOrder(request.getSortOrder());

        language = languageRepository.save(language);
        return mentorMapper.toLanguageResponse(language);
    }

    @Override
    @Transactional
    public void deleteLanguage(UUID mentorId, UUID languageId) {
        Language language = languageRepository.findById(languageId)
                .orElseThrow(() -> new MentorNotFoundException("languageId", languageId.toString()));
        if (!language.getMentor().getId().equals(mentorId)) {
            throw new BadRequestException("Language does not belong to this mentor");
        }
        languageRepository.delete(language);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LanguageResponse> getLanguages(UUID mentorId) {
        return languageRepository.findByMentorIdOrderBySortOrderAsc(mentorId).stream()
                .map(mentorMapper::toLanguageResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(UUID mentorId) {
        Mentor mentor = findMentorById(mentorId);
        DashboardResponse response = mentorMapper.toDashboardResponse(mentor);

        List<String> missingFields = new ArrayList<>();
        if (mentor.getProfile() != null) {
            if (!StringUtils.hasText(mentor.getProfile().getHeadline())) missingFields.add("headline");
            if (!StringUtils.hasText(mentor.getProfile().getBio())) missingFields.add("bio");
            if (!StringUtils.hasText(mentor.getProfile().getCountry())) missingFields.add("country");
            if (mentor.getProfile().getYearsOfExperience() == null) missingFields.add("yearsOfExperience");
        }
        if (mentor.getExpertiseList() == null || mentor.getExpertiseList().isEmpty()) missingFields.add("expertise");
        if (mentor.getPricingList() == null || mentor.getPricingList().isEmpty()) missingFields.add("pricing");

        return DashboardResponse.builder()
                .profile(mentorMapper.toProfileResponse(mentor.getProfile()))
                .statistics(mentorMapper.toStatisticsResponse(mentor.getStatistics()))
                .preferences(mentorMapper.toPreferenceResponse(mentor.getPreference()))
                .upcomingSessions(mentor.getStatistics() != null ? mentor.getStatistics().getUpcomingSessions() : 0)
                .pendingRequests(0)
                .availabilitySummary(getAvailability(mentorId))
                .missingProfileFields(missingFields)
                .build();
    }

    @Override
    @Transactional
    public MentorResponse verifyMentor(UUID mentorId, UUID adminId, boolean verified, String rejectionReason) {
        Mentor mentor = findMentorById(mentorId);
        mentor.setVerified(verified);
        mentor.setVerifiedBy(adminId.toString());
        mentor.setVerifiedAt(LocalDateTime.now());

        if (verified) {
            mentor.setStatus(MentorStatus.ACTIVE);
        } else {
            mentor.setStatus(MentorStatus.REJECTED);
            mentor.setRejectionReason(rejectionReason);
        }

        mentor = mentorRepository.save(mentor);

        eventPublisher.publishMentorVerified(mentorId, mentor.getUserId(), verified);

        log.info("Mentor verification: mentorId={}, verified={}", mentorId, verified);
        return mentorMapper.toMentorResponse(mentor);
    }

    /**
     * Backend source of truth for session-type durations: only the seven
     * supported values (10, 20, 30, 45, 60, 90, 120 minutes) are accepted.
     * Mirrors the frontend SESSION_DURATIONS selector — the two never diverge.
     */
    private void validatePricingDuration(Integer durationMinutes) {
        if (durationMinutes == null) {
            throw new BadRequestException("Session duration is required");
        }
        if (!SUPPORTED_SESSION_DURATIONS.contains(durationMinutes)) {
            throw new BadRequestException("Session duration must be one of: "
                    + SUPPORTED_SESSION_DURATIONS + " minutes");
        }
    }

    private void validateAvailabilityRequest(AvailabilityRequest request) {
        if (!VALID_DAYS.contains(request.getDayOfWeek().toUpperCase()) && !request.isRecurring()) {
            throw new InvalidAvailabilityException("Invalid day of week: " + request.getDayOfWeek());
        }

        if (request.getSlotDurationMinutes() != null
                && (request.getSlotDurationMinutes() < 10 || request.getSlotDurationMinutes() > 180)) {
            throw new InvalidAvailabilityException("Slot duration must be between 10 and 180 minutes");
        }

        try {
            LocalTime startTime = LocalTime.parse(request.getStartTime(), TIME_FORMATTER);
            LocalTime endTime = LocalTime.parse(request.getEndTime(), TIME_FORMATTER);

            if (!endTime.isAfter(startTime)) {
                throw new InvalidAvailabilityException("End time must be after start time");
            }

            if (request.getBreakStartTime() != null && request.getBreakEndTime() != null) {
                LocalTime breakStart = LocalTime.parse(request.getBreakStartTime(), TIME_FORMATTER);
                LocalTime breakEnd = LocalTime.parse(request.getBreakEndTime(), TIME_FORMATTER);

                if (!breakEnd.isAfter(breakStart)) {
                    throw new InvalidAvailabilityException("Break end time must be after break start time");
                }

                if (breakStart.isBefore(startTime) || breakEnd.isAfter(endTime)) {
                    throw new InvalidAvailabilityException("Break time must be within working hours");
                }
            }
        } catch (DateTimeParseException e) {
            throw new InvalidAvailabilityException("Invalid time format. Use HH:mm format");
        }
    }

    private void validateOwnership(Mentor mentor, UUID userId) {
        if (!mentor.getUserId().equals(userId)) {
            throw new BadRequestException("You can only modify your own mentor profile");
        }
    }

    private Mentor findMentorById(UUID mentorId) {
        return mentorRepository.findById(mentorId)
                .orElseThrow(() -> new MentorNotFoundException("id", mentorId.toString()));
    }

    private int calculateProfileCompletion(Mentor mentor) {
        int score = 0;
        int total = 9;

        MentorProfile profile = mentor.getProfile();
        if (profile == null) return 0;

        if (StringUtils.hasText(profile.getHeadline())) score++;
        if (StringUtils.hasText(profile.getBio())) score++;
        if (StringUtils.hasText(profile.getCountry())) score++;
        if (StringUtils.hasText(profile.getCity())) score++;
        if (StringUtils.hasText(profile.getProfilePictureUrl())) score++;
        if (profile.getYearsOfExperience() != null) score++;
        if (mentor.getExpertiseList() != null && !mentor.getExpertiseList().isEmpty()) score++;
        if (mentor.getPricingList() != null && !mentor.getPricingList().isEmpty()) score++;
        if (mentor.getLanguages() != null && !mentor.getLanguages().isEmpty()) score++;

        return Math.min((int) Math.round((double) score / total * 100), 100);
    }
}
