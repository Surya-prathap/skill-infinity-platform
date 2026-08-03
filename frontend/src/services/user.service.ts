import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type {
  ApiResponse,
  CreateProfileRequest,
  Education,
  EducationRequest,
  Experience,
  ExperienceRequest,
  Language,
  LanguageRequest,
  Skill,
  SkillRequest,
  UpdateProfileRequest,
  UserProfile,
} from '@/types';

const collection = (template: string, userId: string, itemId?: string): string =>
  template.replace('{userId}', userId).replace('{itemId}', itemId ?? '');

/**
 * user-service profile endpoints. All section routes are keyed by the
 * authenticated user's UUID (X-User-ID is injected by the API gateway).
 */
export const userService = {
  getProfile: () => apiClient.get<ApiResponse<UserProfile>>(API_ENDPOINTS.USERS.PROFILE),

  createProfile: (payload: CreateProfileRequest) =>
    apiClient.post<ApiResponse<UserProfile>>(API_ENDPOINTS.USERS.BASE, payload),

  updateProfile: (userId: string, payload: UpdateProfileRequest) =>
    apiClient.put<ApiResponse<UserProfile>>(`${API_ENDPOINTS.USERS.BASE}/${userId}`, payload),

  /* ---------------- Education ---------------- */
  addEducation: (userId: string, payload: EducationRequest) =>
    apiClient.post<ApiResponse<Education>>(
      collection(API_ENDPOINTS.USERS.EDUCATION, userId),
      payload,
    ),

  updateEducation: (userId: string, educationId: string, payload: EducationRequest) =>
    apiClient.put<ApiResponse<Education>>(
      collection(API_ENDPOINTS.USERS.EDUCATION_ITEM, userId, educationId),
      payload,
    ),

  deleteEducation: (userId: string, educationId: string) =>
    apiClient.delete<ApiResponse<null>>(
      collection(API_ENDPOINTS.USERS.EDUCATION_ITEM, userId, educationId),
    ),

  /* ---------------- Experience ---------------- */
  addExperience: (userId: string, payload: ExperienceRequest) =>
    apiClient.post<ApiResponse<Experience>>(
      collection(API_ENDPOINTS.USERS.EXPERIENCE, userId),
      payload,
    ),

  updateExperience: (userId: string, experienceId: string, payload: ExperienceRequest) =>
    apiClient.put<ApiResponse<Experience>>(
      collection(API_ENDPOINTS.USERS.EXPERIENCE_ITEM, userId, experienceId),
      payload,
    ),

  deleteExperience: (userId: string, experienceId: string) =>
    apiClient.delete<ApiResponse<null>>(
      collection(API_ENDPOINTS.USERS.EXPERIENCE_ITEM, userId, experienceId),
    ),

  /* ---------------- Skills ---------------- */
  addSkill: (userId: string, payload: SkillRequest) =>
    apiClient.post<ApiResponse<Skill>>(
      collection(API_ENDPOINTS.USERS.SKILLS, userId),
      payload,
    ),

  updateSkill: (userId: string, skillId: string, payload: SkillRequest) =>
    apiClient.put<ApiResponse<Skill>>(
      collection(API_ENDPOINTS.USERS.SKILLS_ITEM, userId, skillId),
      payload,
    ),

  deleteSkill: (userId: string, skillId: string) =>
    apiClient.delete<ApiResponse<null>>(
      collection(API_ENDPOINTS.USERS.SKILLS_ITEM, userId, skillId),
    ),

  /* ---------------- Languages ---------------- */
  addLanguage: (userId: string, payload: LanguageRequest) =>
    apiClient.post<ApiResponse<Language>>(
      collection(API_ENDPOINTS.USERS.LANGUAGES, userId),
      payload,
    ),

  updateLanguage: (userId: string, languageId: string, payload: LanguageRequest) =>
    apiClient.put<ApiResponse<Language>>(
      collection(API_ENDPOINTS.USERS.LANGUAGES_ITEM, userId, languageId),
      payload,
    ),

  deleteLanguage: (userId: string, languageId: string) =>
    apiClient.delete<ApiResponse<null>>(
      collection(API_ENDPOINTS.USERS.LANGUAGES_ITEM, userId, languageId),
    ),
};
