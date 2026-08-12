import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type {
  AchievementRequest,
  ApiResponse,
  AvailabilityRequest,
  BecomeMentorRequest,
  Category,
  CertificationRequest,
  DashboardData,
  DiscoveryQuery,
  ExpertiseRequest,
  Mentor,
  MentorAchievement,
  MentorAvailability,
  MentorCertification,
  MentorExpertise,
  MentorLanguage,
  MentorPricing,
  MentorSummary,
  PageResponse,
  PricingRequest,
  TimeSlot,
  UpdateMentorProfileRequest,
} from '@/types';

const resolve = (template: string, params: Record<string, string>): string =>
  Object.entries(params).reduce((url, [key, value]) => url.replace(`{${key}}`, value), template);

/**
 * mentor-service endpoints. Self-service routes (/profile, /availability,
 * /certifications, /dashboard) resolve the mentor from X-User-ID, which the
 * API gateway injects from the JWT.
 */
export const mentorService = {
  /* ---------------- Profile ---------------- */

  becomeMentor: (payload: BecomeMentorRequest) =>
    apiClient.post<ApiResponse<Mentor>>(API_ENDPOINTS.MENTORS.BASE, payload),

  getMyProfile: () => apiClient.get<ApiResponse<Mentor>>(API_ENDPOINTS.MENTORS.PROFILE),

  updateProfile: (mentorId: string, payload: UpdateMentorProfileRequest) =>
    apiClient.put<ApiResponse<Mentor>>(`${API_ENDPOINTS.MENTORS.BASE}/${mentorId}`, payload),

  /* ---------------- Marketplace (discovery) ---------------- */

  searchMentors: (query: DiscoveryQuery) =>
    apiClient.get<ApiResponse<PageResponse<MentorSummary>>>(API_ENDPOINTS.MENTORS.SEARCH, {
      params: query,
    }),

  getMentorById: (mentorId: string) =>
    apiClient.get<ApiResponse<Mentor>>(`${API_ENDPOINTS.MENTORS.BASE}/${mentorId}`),

  getPublicProfile: (mentorId: string) =>
    apiClient.get<ApiResponse<Mentor>>(
      resolve(API_ENDPOINTS.MENTORS.PUBLIC_PROFILE, { mentorId }),
    ),

  /* ---------------- Admin: verification ---------------- */

  /** Pending mentor applications (admin only). */
  getPendingMentors: (page = 0, size = 200) =>
    apiClient.get<ApiResponse<PageResponse<MentorSummary>>>(API_ENDPOINTS.MENTORS.PENDING, {
      params: { page, size },
    }),

  /** Verify (approve) or reject a mentor application (admin only). */
  verifyMentor: (mentorId: string, verified: boolean, rejectionReason?: string) =>
    apiClient.put<ApiResponse<Mentor>>(
      resolve(API_ENDPOINTS.MENTORS.VERIFY, { mentorId }),
      undefined,
      { params: { verified, ...(rejectionReason ? { rejectionReason } : {}) } },
    ),

  getMentorAvailability: (mentorId: string) =>
    apiClient.get<ApiResponse<MentorAvailability[]>>(
      resolve(API_ENDPOINTS.MENTORS.AVAILABILITY_BY_ID, { mentorId }),
    ),

  getMentorLanguages: (mentorId: string) =>
    apiClient.get<ApiResponse<MentorLanguage[]>>(
      `${API_ENDPOINTS.MENTORS.BASE}/${mentorId}/languages`,
    ),

  /* ---------------- Dashboard ---------------- */

  getDashboard: () => apiClient.get<ApiResponse<DashboardData>>(API_ENDPOINTS.MENTORS.DASHBOARD),

  /* ---------------- Taxonomy ---------------- */

  getCategories: () => apiClient.get<ApiResponse<Category[]>>(API_ENDPOINTS.MENTORS.CATEGORIES),

  /* ---------------- Expertise ---------------- */

  addExpertise: (mentorId: string, payload: ExpertiseRequest) =>
    apiClient.post<ApiResponse<MentorExpertise>>(
      resolve(API_ENDPOINTS.MENTORS.EXPERTISE, { mentorId }),
      payload,
    ),

  updateExpertise: (mentorId: string, expertiseId: string, payload: ExpertiseRequest) =>
    apiClient.put<ApiResponse<MentorExpertise>>(
      resolve(API_ENDPOINTS.MENTORS.EXPERTISE_ITEM, { mentorId, expertiseId }),
      payload,
    ),

  deleteExpertise: (mentorId: string, expertiseId: string) =>
    apiClient.delete<ApiResponse<null>>(
      resolve(API_ENDPOINTS.MENTORS.EXPERTISE_ITEM, { mentorId, expertiseId }),
    ),

  getExpertise: (mentorId: string) =>
    apiClient.get<ApiResponse<MentorExpertise[]>>(
      resolve(API_ENDPOINTS.MENTORS.EXPERTISE, { mentorId }),
    ),

  /* ---------------- Availability (self-service) ---------------- */

  getMyAvailability: () =>
    apiClient.get<ApiResponse<MentorAvailability[]>>(API_ENDPOINTS.MENTORS.AVAILABILITY),

  saveMyAvailability: (requests: AvailabilityRequest[]) =>
    apiClient.put<ApiResponse<MentorAvailability[]>>(API_ENDPOINTS.MENTORS.AVAILABILITY, requests),

  generateTimeSlots: (mentorId: string, startDate: string, endDate: string) =>
    apiClient.get<ApiResponse<TimeSlot[]>>(
      `${resolve(API_ENDPOINTS.MENTORS.GENERATE_SLOTS, { mentorId })}?startDate=${startDate}&endDate=${endDate}`,
    ),

  /* ---------------- Pricing ---------------- */

  addPricing: (mentorId: string, payload: PricingRequest) =>
    apiClient.post<ApiResponse<MentorPricing>>(
      resolve(API_ENDPOINTS.MENTORS.PRICING, { mentorId }),
      payload,
    ),

  updatePricing: (mentorId: string, pricingId: string, payload: PricingRequest) =>
    apiClient.put<ApiResponse<MentorPricing>>(
      resolve(API_ENDPOINTS.MENTORS.PRICING_ITEM, { mentorId, pricingId }),
      payload,
    ),

  deletePricing: (mentorId: string, pricingId: string) =>
    apiClient.delete<ApiResponse<null>>(
      resolve(API_ENDPOINTS.MENTORS.PRICING_ITEM, { mentorId, pricingId }),
    ),

  getPricing: (mentorId: string) =>
    apiClient.get<ApiResponse<MentorPricing[]>>(
      resolve(API_ENDPOINTS.MENTORS.PRICING, { mentorId }),
    ),

  /* ---------------- Certifications (self-service) ---------------- */

  addMyCertification: (payload: CertificationRequest) =>
    apiClient.post<ApiResponse<MentorCertification>>(API_ENDPOINTS.MENTORS.CERTIFICATIONS, payload),

  updateMyCertification: (certificationId: string, payload: CertificationRequest) =>
    apiClient.put<ApiResponse<MentorCertification>>(
      resolve(API_ENDPOINTS.MENTORS.CERTIFICATION_ITEM, { certificationId }),
      payload,
    ),

  deleteMyCertification: (certificationId: string) =>
    apiClient.delete<ApiResponse<null>>(
      `${API_ENDPOINTS.MENTORS.CERTIFICATIONS}/${certificationId}`,
    ),

  /* ---------------- Achievements ---------------- */

  getAchievements: (mentorId: string) =>
    apiClient.get<ApiResponse<MentorAchievement[]>>(
      resolve(API_ENDPOINTS.MENTORS.ACHIEVEMENTS, { mentorId }),
    ),

  addAchievement: (mentorId: string, payload: AchievementRequest) =>
    apiClient.post<ApiResponse<MentorAchievement>>(
      resolve(API_ENDPOINTS.MENTORS.ACHIEVEMENTS, { mentorId }),
      payload,
    ),

  updateAchievement: (mentorId: string, achievementId: string, payload: AchievementRequest) =>
    apiClient.put<ApiResponse<MentorAchievement>>(
      resolve(API_ENDPOINTS.MENTORS.ACHIEVEMENTS_ITEM, { mentorId, achievementId }),
      payload,
    ),

  deleteAchievement: (mentorId: string, achievementId: string) =>
    apiClient.delete<ApiResponse<null>>(
      resolve(API_ENDPOINTS.MENTORS.ACHIEVEMENTS_ITEM, { mentorId, achievementId }),
    ),
};
