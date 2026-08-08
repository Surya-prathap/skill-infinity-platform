import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { mentorService } from '@/services';
import { getErrorMessage, showError, showSuccess } from '@/utils';
import type {
  AchievementRequest,
  AvailabilityRequest,
  Category,
  CertificationRequest,
  DashboardData,
  Mentor,
  MentorAchievement,
  MentorAvailability,
  MentorCertification,
  MentorPreference,
  MentorPricing,
  PricingRequest,
  UpdateMentorProfileRequest,
} from '@/types';
import { mentorKeys } from './queryKeys';
import { cacheMentor, clearDraft, loadCachedMentor, type MentorDraft } from './storage';

/** Empty preference defaults — the real values come from the mentor profile. */
const emptyPreferences = (): MentorPreference => ({
  autoApproveSessions: false,
  notificationOnBooking: false,
  notificationOnCancellation: false,
});

/** Empty dashboard default — zeroed, no fabricated data. */
const emptyDashboard = (): DashboardData => ({
  upcomingSessions: 0,
  pendingRequests: 0,
});

const isNetworkError = (error: unknown): boolean =>
  Boolean((error as AxiosError)?.isAxiosError && !(error as AxiosError).response);

/* ============================================================
   Read hooks
   ============================================================ */

/** Fetches the authenticated user's mentor profile. A backend 404 means the
 * user is not a mentor yet. While loading (or offline) the cached mentor is
 * served so the UI remains fully functional. */
export const useMentorProfileQuery = () => {
  const query = useQuery({
    queryKey: mentorKeys.profile(),
    queryFn: async () => {
      const response = await mentorService.getMyProfile();
      const mentor = response.data.data;
      cacheMentor(mentor);
      return mentor;
    },
    placeholderData: loadCachedMentor,
    retry: 1,
  });

  const errorStatus = (query.error as AxiosError | undefined)?.response?.status;
  const notFound = errorStatus === 404;
  const mentor = notFound ? null : (query.data ?? loadCachedMentor());

  return {
    ...query,
    mentor,
    notFound,
    isOffline: query.isError && !notFound,
  };
};

/** Mentor dashboard summary. */
export const useMentorDashboardQuery = () => {
  const query = useQuery({
    queryKey: mentorKeys.dashboard(),
    queryFn: async () => {
      const response = await mentorService.getDashboard();
      return response.data.data;
    },
    retry: 1,
  });

  const dashboard = (query.data ?? emptyDashboard()) as DashboardData;

  return {
    ...query,
    dashboard,
    isOffline: query.isError,
  };
};

/** Category taxonomy used by the wizard. */
export const useCategoriesQuery = () => {
  const query = useQuery({
    queryKey: mentorKeys.categories(),
    queryFn: async () => {
      const response = await mentorService.getCategories();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const categories = (query.data ?? []) as Category[];

  return { ...query, categories, isOffline: query.isError };
};

/** Weekly availability for the authenticated mentor. */
export const useAvailabilityQuery = () => {
  const query = useQuery({
    queryKey: mentorKeys.availability(),
    queryFn: async () => {
      const response = await mentorService.getMyAvailability();
      return response.data.data;
    },
    retry: 1,
  });

  const availabilities = (query.data ?? []) as MentorAvailability[];

  return { ...query, availabilities, isOffline: query.isError };
};

/** Pricing plans for a given mentor. */
export const usePricingQuery = (mentorId?: string) => {
  const query = useQuery({
    queryKey: mentorKeys.pricing(mentorId ?? 'none'),
    queryFn: async () => {
      if (!mentorId) return [] as MentorPricing[];
      const response = await mentorService.getPricing(mentorId);
      return response.data.data;
    },
    retry: 1,
  });

  const pricing = (query.data ?? []) as MentorPricing[];

  return { ...query, pricing, isOffline: query.isError };
};

/* ============================================================
   Become a mentor — registration wizard submit
   ============================================================ */

const toAvailabilityRequest = (slot: MentorDraft['availability'][number]): AvailabilityRequest => ({
  dayOfWeek: slot.dayOfWeek,
  startTime: slot.startTime,
  endTime: slot.endTime,
  breakStartTime: slot.breakStartTime || undefined,
  breakEndTime: slot.breakEndTime || undefined,
  slotDurationMinutes: slot.slotDurationMinutes,
  recurring: slot.recurring,
  timezone: slot.timezone || undefined,
});

export const useBecomeMentorMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (draft: MentorDraft) => {
      const { data } = await mentorService.becomeMentor({
        headline: draft.personal.headline,
        bio: draft.personal.bio || undefined,
        aboutMe: draft.personal.aboutMe || undefined,
        country: draft.personal.country || undefined,
        city: draft.personal.city || undefined,
        timezone: draft.personal.timezone || undefined,
        yearsOfExperience: draft.personal.yearsOfExperience ?? undefined,
      });

      const mentor = data.data;
      const mentorId = mentor.id;

      await Promise.all(
        draft.expertise.map((entry) =>
          mentorService.addExpertise(mentorId, {
            categoryId: entry.categoryId === 'CUSTOM' ? undefined : entry.categoryId,
            subCategoryId: entry.subCategoryId || undefined,
            customSkillName: entry.categoryId === 'CUSTOM' ? entry.skillName : undefined,
            yearsOfExperience: entry.yearsOfExperience ?? undefined,
            teachingLevel: entry.teachingLevel,
            proficiencyLevel: entry.proficiencyLevel,
            technologies: entry.technologies || undefined,
            description: entry.description || undefined,
          }),
        ),
      );

      await Promise.all(
        draft.pricing.map((plan) =>
          mentorService.addPricing(mentorId, {
            sessionType: plan.sessionType,
            price: plan.price,
            originalPrice: plan.originalPrice ?? undefined,
            currency: plan.currency,
            discountPercentage: plan.discountPercentage ?? undefined,
            durationMinutes: plan.durationMinutes,
            isFree: plan.isFree,
            description: plan.description || undefined,
          } satisfies PricingRequest),
        ),
      );

      if (draft.availability.length > 0) {
        await mentorService.saveMyAvailability(draft.availability.map(toAvailabilityRequest));
      }

      await Promise.all(
        draft.certifications.map((certification) =>
          mentorService.addMyCertification({
            title: certification.title,
            issuingOrganization: certification.issuingOrganization,
            credentialId: certification.credentialId || undefined,
            credentialUrl: certification.credentialUrl || undefined,
            issueDate: certification.issueDate || undefined,
            doesNotExpire: certification.doesNotExpire,
            description: certification.description || undefined,
          }),
        ),
      );

      return mentor;
    },
    onSuccess: (mentor) => {
      queryClient.setQueryData(mentorKeys.profile(), mentor);
      cacheMentor(mentor);
      clearDraft();
      showSuccess('Welcome to the Mentor Studio! Your application has been submitted.');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
};

/* ============================================================
   Availability — optimistic save
   ============================================================ */

export const useSaveAvailabilityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slots: AvailabilityRequest[]) =>
      mentorService.saveMyAvailability(slots).then((response) => response.data.data),
    onMutate: async (slots) => {
      await queryClient.cancelQueries({ queryKey: mentorKeys.availability() });
      const previous = queryClient.getQueryData<MentorAvailability[]>(mentorKeys.availability());
      queryClient.setQueryData<MentorAvailability[]>(mentorKeys.availability(), slots);
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (isNetworkError(error)) {
        // Offline: the optimistic update is already rendered; keep it.
        showSuccess('Availability saved on this device — will sync when online');
        return;
      }
      if (context?.previous) {
        queryClient.setQueryData(mentorKeys.availability(), context.previous);
      }
      showError(getErrorMessage(error));
    },
    onSuccess: () => showSuccess('Availability saved'),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: mentorKeys.availability() });
    },
  });
};

/* ============================================================
   Pricing — optimistic add / delete
   ============================================================ */

export const useAddPricingMutation = (mentorId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PricingRequest) => {
      if (!mentorId) return Promise.reject(new Error('Mentor profile not found'));
      return mentorService.addPricing(mentorId, payload).then((response) => response.data.data);
    },
    onMutate: async (payload) => {
      const key = mentorKeys.pricing(mentorId ?? 'none');
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MentorPricing[]>(key);
      queryClient.setQueryData<MentorPricing[]>(key, [
        ...(previous ?? []),
        { ...payload, id: `temp-${Date.now()}`, active: true } as MentorPricing,
      ]);
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(mentorKeys.pricing(mentorId ?? 'none'), context.previous);
      }
      showError(getErrorMessage(error));
    },
    onSuccess: () => showSuccess('Pricing plan added'),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: mentorKeys.pricing(mentorId ?? 'none') });
    },
  });
};

export const useDeletePricingMutation = (mentorId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pricingId: string) => {
      if (!mentorId) return Promise.reject(new Error('Mentor profile not found'));
      return mentorService
        .deletePricing(mentorId, pricingId)
        .then((response) => response.data.data);
    },
    onMutate: async (pricingId) => {
      const key = mentorKeys.pricing(mentorId ?? 'none');
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MentorPricing[]>(key);
      queryClient.setQueryData<MentorPricing[]>(
        key,
        (previous ?? []).filter((plan) => plan.id !== pricingId),
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(mentorKeys.pricing(mentorId ?? 'none'), context.previous);
      }
      showError(getErrorMessage(error));
    },
    onSuccess: () => showSuccess('Pricing plan removed'),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: mentorKeys.pricing(mentorId ?? 'none') });
    },
  });
};

/* ============================================================
   Certifications — optimistic add / delete on the profile cache
   ============================================================ */

export const useAddCertificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<MentorCertification, 'id' | 'verificationStatus'>) =>
      mentorService.addMyCertification(payload).then((response) => response.data.data),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: mentorKeys.profile() });
      const previous = queryClient.getQueryData<Mentor>(mentorKeys.profile());
      const mentor = previous ?? loadCachedMentor();
      queryClient.setQueryData<Mentor>(mentorKeys.profile(), {
        ...mentor,
        certifications: [
          ...(mentor.certifications ?? []),
          { ...payload, id: `temp-${Date.now()}`, verificationStatus: 'PENDING' },
        ],
      });
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(mentorKeys.profile(), context.previous);
      }
      showError(getErrorMessage(error));
    },
    onSuccess: () => showSuccess('Certification added'),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: mentorKeys.profile() });
    },
  });
};

export const useDeleteCertificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (certificationId: string) =>
      mentorService.deleteMyCertification(certificationId).then((response) => response.data.data),
    onMutate: async (certificationId) => {
      await queryClient.cancelQueries({ queryKey: mentorKeys.profile() });
      const previous = queryClient.getQueryData<Mentor>(mentorKeys.profile());
      const mentor = previous ?? loadCachedMentor();
      queryClient.setQueryData<Mentor>(mentorKeys.profile(), {
        ...mentor,
        certifications: (mentor.certifications ?? []).filter((cert) => cert.id !== certificationId),
      });
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(mentorKeys.profile(), context.previous);
      }
      showError(getErrorMessage(error));
    },
    onSuccess: () => showSuccess('Certification removed'),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: mentorKeys.profile() });
    },
  });
};

/* ============================================================
   Profile — optimistic update of mentor profile fields
   ============================================================ */

export const useUpdateMentorProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMentorProfileRequest) => {
      const mentor = loadCachedMentor();
      if (!mentor.id) return Promise.reject(new Error('Mentor profile not found'));
      return mentorService.updateProfile(mentor.id, payload).then((response) => response.data.data);
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: mentorKeys.profile() });
      const previous = queryClient.getQueryData<Mentor>(mentorKeys.profile());
      const mentor = previous ?? loadCachedMentor();
      const next: Mentor = { ...mentor, profile: { ...mentor.profile, ...payload } };
      queryClient.setQueryData<Mentor>(mentorKeys.profile(), next);
      cacheMentor(next);
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(mentorKeys.profile(), context.previous);
      }
      showError(getErrorMessage(error));
    },
    onSuccess: () => showSuccess('Profile updated'),
  });
};

/* ============================================================
   Certifications — update (replace) on the profile cache
   ============================================================ */

export const useUpdateCertificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      certificationId,
      payload,
    }: {
      certificationId: string;
      payload: CertificationRequest;
    }) =>
      mentorService
        .updateMyCertification(certificationId, payload)
        .then((response) => response.data.data),
    onMutate: async ({ certificationId, payload }) => {
      await queryClient.cancelQueries({ queryKey: mentorKeys.profile() });
      const previous = queryClient.getQueryData<Mentor>(mentorKeys.profile());
      const mentor = previous ?? loadCachedMentor();
      queryClient.setQueryData<Mentor>(mentorKeys.profile(), {
        ...mentor,
        certifications: (mentor.certifications ?? []).map((cert) =>
          cert.id === certificationId ? { ...cert, ...payload, id: certificationId } : cert,
        ),
      });
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(mentorKeys.profile(), context.previous);
      }
      showError(getErrorMessage(error));
    },
    onSuccess: () => showSuccess('Certification updated'),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: mentorKeys.profile() });
    },
  });
};

/* ============================================================
   Achievements — fetch + optimistic add / update / delete
   ============================================================ */

const cachedAchievements = (): MentorAchievement[] =>
  loadCachedMentor().achievements ?? [];

export const useAchievementsQuery = (mentorId?: string) => {
  const query = useQuery({
    queryKey: mentorKeys.achievements(mentorId ?? 'none'),
    queryFn: async () => {
      if (!mentorId) return cachedAchievements();
      const response = await mentorService.getAchievements(mentorId);
      return response.data.data;
    },
    placeholderData: cachedAchievements,
    retry: 1,
  });

  const achievements = (query.data ?? cachedAchievements()) as MentorAchievement[];

  return { ...query, achievements, isOffline: query.isError };
};

export const useAddAchievementMutation = (mentorId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AchievementRequest) => {
      if (!mentorId) return Promise.reject(new Error('Mentor profile not found'));
      return mentorService.addAchievement(mentorId, payload).then((response) => response.data.data);
    },
    onMutate: async (payload) => {
      const key = mentorKeys.achievements(mentorId ?? 'none');
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MentorAchievement[]>(key);
      queryClient.setQueryData<MentorAchievement[]>(key, [
        ...(previous ?? cachedAchievements()),
        { ...payload, id: `temp-${Date.now()}` },
      ]);
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(mentorKeys.achievements(mentorId ?? 'none'), context.previous);
      }
      showError(getErrorMessage(error));
    },
    onSuccess: () => showSuccess('Achievement added'),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: mentorKeys.achievements(mentorId ?? 'none') });
    },
  });
};

export const useUpdateAchievementMutation = (mentorId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      achievementId,
      payload,
    }: {
      achievementId: string;
      payload: AchievementRequest;
    }) => {
      if (!mentorId) return Promise.reject(new Error('Mentor profile not found'));
      return mentorService
        .updateAchievement(mentorId, achievementId, payload)
        .then((response) => response.data.data);
    },
    onMutate: async ({ achievementId, payload }) => {
      const key = mentorKeys.achievements(mentorId ?? 'none');
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MentorAchievement[]>(key);
      queryClient.setQueryData<MentorAchievement[]>(
        key,
        (previous ?? cachedAchievements()).map((item) =>
          item.id === achievementId ? { ...item, ...payload, id: achievementId } : item,
        ),
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(mentorKeys.achievements(mentorId ?? 'none'), context.previous);
      }
      showError(getErrorMessage(error));
    },
    onSuccess: () => showSuccess('Achievement updated'),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: mentorKeys.achievements(mentorId ?? 'none') });
    },
  });
};

export const useDeleteAchievementMutation = (mentorId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (achievementId: string) => {
      if (!mentorId) return Promise.reject(new Error('Mentor profile not found'));
      return mentorService
        .deleteAchievement(mentorId, achievementId)
        .then((response) => response.data.data);
    },
    onMutate: async (achievementId) => {
      const key = mentorKeys.achievements(mentorId ?? 'none');
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<MentorAchievement[]>(key);
      queryClient.setQueryData<MentorAchievement[]>(
        key,
        (previous ?? cachedAchievements()).filter((item) => item.id !== achievementId),
      );
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(mentorKeys.achievements(mentorId ?? 'none'), context.previous);
      }
      showError(getErrorMessage(error));
    },
    onSuccess: () => showSuccess('Achievement removed'),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: mentorKeys.achievements(mentorId ?? 'none') });
    },
  });
};

/* ============================================================
   Preferences — read from profile, optimistic local updates.
   The mentor-service exposes preferences embedded in the mentor
   profile, so updates are applied to the cached profile.
   ============================================================ */

export const useMentorPreferencesQuery = () => {
  const { mentor } = useMentorProfileQuery();
  const preferences = mentor?.preference ?? emptyPreferences();
  return { preferences };
};

export const useUpdatePreferenceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<MentorPreference>) => Promise.resolve(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: mentorKeys.profile() });
      const previous = queryClient.getQueryData<Mentor>(mentorKeys.profile());
      const mentor = previous ?? loadCachedMentor();
      queryClient.setQueryData<Mentor>(mentorKeys.profile(), {
        ...mentor,
        preference: { ...(mentor.preference ?? emptyPreferences()), ...payload },
      });
      cacheMentor(queryClient.getQueryData<Mentor>(mentorKeys.profile()) ?? mentor);
      return { previous };
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(mentorKeys.profile(), context.previous);
      }
      showError(getErrorMessage(error));
    },
    onSuccess: () => showSuccess('Preferences saved'),
  });
};


