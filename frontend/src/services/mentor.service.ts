import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type {
  ApiResponse,
  AvailabilityRequest,
  BecomeMentorRequest,
  Category,
  CertificationRequest,
  DashboardData,
  ExpertiseRequest,
  Mentor,
  MentorAvailability,
  MentorCertification,
  MentorExpertise,
  MentorPricing,
  PricingRequest,
  TimeSlot,
  UpdateMentorProfileRequest,
} from '@/types';

const resolve = (template: string, params: Record<string, string>): string =>
  Object.entries(params).reduce(
    (url, [key, value]) => url.replace(`{${key}}`, value),
    template,
  );

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
    apiClient.put<ApiResponse<Mentor>>(
      `${API_ENDPOINTS.MENTORS.BASE}/${mentorId}`,
      payload,
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
    apiClient.put<ApiResponse<MentorAvailability[]>>(
      API_ENDPOINTS.MENTORS.AVAILABILITY,
      requests,
    ),

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

  deleteMyCertification: (certificationId: string) =>
    apiClient.delete<ApiResponse<null>>(
      `${API_ENDPOINTS.MENTORS.CERTIFICATIONS}/${certificationId}`,
    ),
};
