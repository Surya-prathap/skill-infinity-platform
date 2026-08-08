import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { userService } from '@/services';
import { getErrorMessage, showError, showSuccess, showWarning } from '@/utils';
import type {
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
import { profileKeys } from './queryKeys';
import { loadStoredProfile, persistProfile } from './storage';

export type ProfileSection = 'educations' | 'experiences' | 'skills' | 'languages';

const isNetworkError = (error: unknown): boolean =>
  Boolean((error as AxiosError)?.isAxiosError && !(error as AxiosError).response);

const tempId = (prefix: string): string => `${prefix}-${Date.now()}`;

/* ============================================================
   Read
   ============================================================ */

/**
 * Fields that only exist client-side (the backend ignores them in update
 * payloads) must survive refetches of the server profile.
 */
const mergeClientOnlyFields = (local: UserProfile | null, server: UserProfile): UserProfile => ({
  ...server,
  profilePictureUrl: server.profilePictureUrl || local?.profilePictureUrl,
  resumeUrl: server.resumeUrl || local?.resumeUrl,
  certifications:
    server.certifications && server.certifications.length > 0
      ? server.certifications
      : local?.certifications,
});

/**
 * Fetches the authenticated user's profile. While loading (and when the API is
 * unreachable) the locally persisted profile — if any — is served so the UI
 * remains usable. A backend 404 means the user has no profile yet and is
 * surfaced via `notFound` so the UI can offer a create flow. No seed data.
 */
export const useProfileQuery = () => {
  const query = useQuery({
    queryKey: profileKeys.detail(),
    queryFn: async () => {
      const local = loadStoredProfile();
      const response = await userService.getProfile();
      const merged = mergeClientOnlyFields(local, response.data.data);
      persistProfile(merged);
      return merged;
    },
    placeholderData: () => loadStoredProfile() ?? undefined,
    retry: 1,
  });

  const errorStatus = (query.error as AxiosError | undefined)?.response?.status;
  const notFound = errorStatus === 404;
  const profile = notFound ? null : (query.data ?? loadStoredProfile() ?? null);

  return {
    ...query,
    profile,
    educations: profile?.educations ?? [],
    experiences: profile?.experiences ?? [],
    skills: profile?.skills ?? [],
    languages: profile?.languages ?? [],
    /** True when the last fetch failed (offline / server down). */
    isOffline: query.isError && !notFound,
    /** True when the backend reports the user has no profile yet. */
    notFound,
  };
};

/* ============================================================
   Optimistic mutation core
   ============================================================ */

interface OptimisticContext {
  previous: UserProfile | undefined;
}

type ApplyFn<TVars> = (current: UserProfile, vars: TVars) => UserProfile;

interface OptimisticConfig<TVars, TResult> {
  mutationFn: (vars: TVars) => Promise<{ data: { data: TResult } }>;
  apply: ApplyFn<TVars>;
  successMessage: string;
  localMessage: string;
}

const useOptimisticMutation = <TVars, TResult>({
  mutationFn,
  apply,
  successMessage,
  localMessage,
}: OptimisticConfig<TVars, TResult>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.detail() });
      const previous = queryClient.getQueryData<UserProfile>(profileKeys.detail());
      const current = previous ?? loadStoredProfile() ?? ({} as UserProfile);
      const next = apply(current, vars);
      queryClient.setQueryData(profileKeys.detail(), next);
      persistProfile(next);
      return { previous };
    },
    onError: (error, _vars, context: OptimisticContext | undefined) => {
      if (isNetworkError(error)) {
        // Offline: keep the optimistic change — it is already persisted locally.
        showWarning(localMessage);
        return;
      }
      if (context?.previous) {
        queryClient.setQueryData(profileKeys.detail(), context.previous);
      }
      showError(getErrorMessage(error));
    },
    onSuccess: () => {
      showSuccess(successMessage);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
  });
};

/* ============================================================
   Profile-level mutations
   ============================================================ */

export const useUpdateProfileMutation = () =>
  useOptimisticMutation<{ userId: string; payload: UpdateProfileRequest }, UserProfile>({
    mutationFn: ({ userId, payload }) => userService.updateProfile(userId, payload),
    apply: (current, { payload }) => ({ ...current, ...payload }),
    successMessage: 'Profile saved',
    localMessage: 'Changes saved on this device — they will sync when you are online',
  });

export const useCreateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProfileRequest) => userService.createProfile(payload),
    onSuccess: (response) => {
      const profile = response.data.data;
      queryClient.setQueryData(profileKeys.detail(), profile);
      persistProfile(profile);
      // Clear the 404 error state and refetch the fresh profile.
      void queryClient.resetQueries({ queryKey: profileKeys.detail() });
      showSuccess('Your profile has been created');
    },
    onError: (error) => {
      showError(getErrorMessage(error));
    },
  });
};

/* ============================================================
   Section mutations — education / experience / skills / languages
   ============================================================ */

interface AddVars<P> {
  userId: string;
  payload: P;
}

interface UpdateVars<P> {
  userId: string;
  itemId: string;
  payload: P;
}

interface DeleteVars {
  userId: string;
  itemId: string;
}

const useSectionMutation = <TVars, TResult>(config: {
  request: (vars: TVars) => Promise<{ data: { data: TResult } }>;
  apply: ApplyFn<TVars>;
  successMessage: string;
  localMessage: string;
}) =>
  useOptimisticMutation<TVars, TResult>({
    mutationFn: config.request,
    apply: config.apply,
    successMessage: config.successMessage,
    localMessage: config.localMessage,
  });

const sectionList = <P extends object>(
  current: UserProfile,
  section: ProfileSection,
): Array<P & { id?: string }> => (current[section] ?? []) as unknown as Array<P & { id?: string }>;

const appendItem = <P extends object>(
  section: ProfileSection,
  prefix: string,
): ApplyFn<AddVars<P>> =>
  (current, vars) =>
    ({
      ...current,
      [section]: [...sectionList<P>(current, section), { ...vars.payload, id: tempId(prefix) }],
    }) as UserProfile;

const updateItem = <P extends object>(
  section: ProfileSection,
): ApplyFn<UpdateVars<P>> =>
  (current, vars) =>
    ({
      ...current,
      [section]: sectionList<P>(current, section).map((item) =>
        item.id === vars.itemId ? { ...item, ...vars.payload } : item,
      ),
    }) as UserProfile;

const deleteItem = (section: ProfileSection): ApplyFn<DeleteVars> =>
  (current, vars) =>
    ({
      ...current,
      [section]: sectionList<Record<string, unknown>>(current, section).filter(
        (item) => item.id !== vars.itemId,
      ),
    }) as UserProfile;

const LOCAL_SYNC_MESSAGE = 'Saved on this device — will sync when you are online';

/* ---------------- Education ---------------- */

export const useAddEducationMutation = () =>
  useSectionMutation<AddVars<EducationRequest>, Education>({
    request: ({ userId, payload }) => userService.addEducation(userId, payload),
    apply: appendItem<EducationRequest>('educations', 'edu'),
    successMessage: 'Education added',
    localMessage: LOCAL_SYNC_MESSAGE,
  });

export const useUpdateEducationMutation = () =>
  useSectionMutation<UpdateVars<EducationRequest>, Education>({
    request: ({ userId, itemId, payload }) => userService.updateEducation(userId, itemId, payload),
    apply: updateItem<EducationRequest>('educations'),
    successMessage: 'Education updated',
    localMessage: LOCAL_SYNC_MESSAGE,
  });

export const useDeleteEducationMutation = () =>
  useSectionMutation<DeleteVars, null>({
    request: ({ userId, itemId }) => userService.deleteEducation(userId, itemId),
    apply: deleteItem('educations'),
    successMessage: 'Education removed',
    localMessage: LOCAL_SYNC_MESSAGE,
  });

/* ---------------- Experience ---------------- */

export const useAddExperienceMutation = () =>
  useSectionMutation<AddVars<ExperienceRequest>, Experience>({
    request: ({ userId, payload }) => userService.addExperience(userId, payload),
    apply: appendItem<ExperienceRequest>('experiences', 'exp'),
    successMessage: 'Experience added',
    localMessage: LOCAL_SYNC_MESSAGE,
  });

export const useUpdateExperienceMutation = () =>
  useSectionMutation<UpdateVars<ExperienceRequest>, Experience>({
    request: ({ userId, itemId, payload }) => userService.updateExperience(userId, itemId, payload),
    apply: updateItem<ExperienceRequest>('experiences'),
    successMessage: 'Experience updated',
    localMessage: LOCAL_SYNC_MESSAGE,
  });

export const useDeleteExperienceMutation = () =>
  useSectionMutation<DeleteVars, null>({
    request: ({ userId, itemId }) => userService.deleteExperience(userId, itemId),
    apply: deleteItem('experiences'),
    successMessage: 'Experience removed',
    localMessage: LOCAL_SYNC_MESSAGE,
  });

/* ---------------- Skills ---------------- */

export const useAddSkillMutation = () =>
  useSectionMutation<AddVars<SkillRequest>, Skill>({
    request: ({ userId, payload }) => userService.addSkill(userId, payload),
    apply: appendItem<SkillRequest>('skills', 'skill'),
    successMessage: 'Skill added',
    localMessage: LOCAL_SYNC_MESSAGE,
  });

export const useUpdateSkillMutation = () =>
  useSectionMutation<UpdateVars<SkillRequest>, Skill>({
    request: ({ userId, itemId, payload }) => userService.updateSkill(userId, itemId, payload),
    apply: updateItem<SkillRequest>('skills'),
    successMessage: 'Skill updated',
    localMessage: LOCAL_SYNC_MESSAGE,
  });

export const useDeleteSkillMutation = () =>
  useSectionMutation<DeleteVars, null>({
    request: ({ userId, itemId }) => userService.deleteSkill(userId, itemId),
    apply: deleteItem('skills'),
    successMessage: 'Skill removed',
    localMessage: LOCAL_SYNC_MESSAGE,
  });

/* ---------------- Languages ---------------- */

export const useAddLanguageMutation = () =>
  useSectionMutation<AddVars<LanguageRequest>, Language>({
    request: ({ userId, payload }) => userService.addLanguage(userId, payload),
    apply: appendItem<LanguageRequest>('languages', 'lang'),
    successMessage: 'Language added',
    localMessage: LOCAL_SYNC_MESSAGE,
  });

export const useUpdateLanguageMutation = () =>
  useSectionMutation<UpdateVars<LanguageRequest>, Language>({
    request: ({ userId, itemId, payload }) => userService.updateLanguage(userId, itemId, payload),
    apply: updateItem<LanguageRequest>('languages'),
    successMessage: 'Language updated',
    localMessage: LOCAL_SYNC_MESSAGE,
  });

export const useDeleteLanguageMutation = () =>
  useSectionMutation<DeleteVars, null>({
    request: ({ userId, itemId }) => userService.deleteLanguage(userId, itemId),
    apply: deleteItem('languages'),
    successMessage: 'Language removed',
    localMessage: LOCAL_SYNC_MESSAGE,
  });
