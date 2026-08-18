import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { mentorService } from '@/services';
import { getErrorMessage, showError } from '@/utils';
import { STORAGE_KEYS } from '@/constants';
import { getStoredValue, setStoredValue } from '@/utils';
import type {
  DiscoveryQuery,
  Mentor,
  MentorSummary,
  PageResponse,
} from '@/types';
import { marketplaceKeys } from './queryKeys';

const emptyPage = (page: number, size: number): PageResponse<MentorSummary> => ({
  content: [],
  page,
  size,
  totalElements: 0,
  totalPages: 1,
  first: page === 0,
  last: true,
  empty: true,
});

/** Search mentors with debounced filters (filtering/sorting is server-side). */
export const useMentorSearch = (query: DiscoveryQuery) => {
  const { page, size } = query;

  const result = useQuery({
    queryKey: marketplaceKeys.search(query),
    queryFn: async () => {
      // silent: the directory renders its own skeletons; this fetch must not
      // pin the global loading bar (especially when embedded on the dashboard).
      const response = await mentorService.searchMentors(query, { silent: true });
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const isOffline = result.isError;
  const data = result.data ?? emptyPage(page, size);

  return { ...result, data, isOffline };
};

/** Full mentor profile by ID (public variant). */
export const useMentorProfile = (mentorId?: string) => {
  const result = useQuery({
    queryKey: marketplaceKeys.publicMentor(mentorId ?? 'none'),
    queryFn: async () => {
      const response = await mentorService.getPublicProfile(mentorId!);
      return response.data.data;
    },
    enabled: Boolean(mentorId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const mentor = result.data ?? null;
  return { ...result, mentor, isOffline: result.isError };
};

/* ============================================================
   Saved mentors (wishlist) — persisted locally, fetched from API
   ============================================================ */

export const useSavedMentors = () => {
  const [saved, setSaved] = useState<string[]>(() =>
    getStoredValue<string[]>(STORAGE_KEYS.SAVED_MENTORS, []),
  );

  const savedQuery = useQuery({
    queryKey: ['saved-mentors', saved],
    queryFn: async (): Promise<Mentor[]> => {
      const results = await Promise.all(
        saved.map((id) => mentorService.getPublicProfile(id).then((r) => r.data.data)),
      );
      return results;
    },
    enabled: saved.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const isSaved = (mentorId: string): boolean => saved.includes(mentorId);

  const toggleSaved = useCallback((mentorId: string) => {
    setSaved((prev) => {
      const next = prev.includes(mentorId)
        ? prev.filter((id) => id !== mentorId)
        : [...prev, mentorId];
      setStoredValue(STORAGE_KEYS.SAVED_MENTORS, next);
      return next;
    });
  }, []);

  const savedMentors = useMemo<Mentor[]>(() => savedQuery.data ?? [], [savedQuery.data]);

  return { saved, savedMentors, isSaved, toggleSaved };
};

/* ============================================================
   Recent searches — persisted locally
   ============================================================ */

export const useRecentSearches = () => {
  const key = STORAGE_KEYS.RECENT_SEARCHES;
  const [recent, setRecent] = useState<string[]>(() => getStoredValue<string[]>(key, []));

  const addSearch = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecent((prev) => {
      const next = [trimmed, ...prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      setStoredValue(key, next);
      return next;
    });
  }, [key]);

  const clearSearches = useCallback(() => {
    setStoredValue(key, []);
    setRecent([]);
  }, [key]);

  return { recent, addSearch, clearSearches };
};

/** Contact-mentor flow: open a message intent. */
export const useContactMentor = () =>
  useMutation({
    mutationFn: async ({ mentorId, message }: { mentorId: string; message: string }) => {
      // Reserved for a future direct-messaging API.
      void mentorId;
      void message;
      throw new Error('Direct messaging is not available yet.');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
