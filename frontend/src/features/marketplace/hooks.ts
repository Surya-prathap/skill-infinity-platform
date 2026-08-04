import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { mentorService } from '@/services';
import { getErrorMessage, showError, showSuccess } from '@/utils';
import { STORAGE_KEYS } from '@/constants';
import { getStoredValue, setStoredValue } from '@/utils';
import type {
  DiscoveryQuery,
  DiscoveryFilters,
  Mentor,
  MentorSortKey,
  MentorSummary,
  PageResponse,
} from '@/types';
import { marketplaceKeys } from './queryKeys';
import { seedMentorSummaries, seedMentors } from './data';

/** Client-side filter application for offline / seed mode. */
const applyFilters = (list: MentorSummary[], filters: DiscoveryFilters): MentorSummary[] => {
  let result = list;
  if (filters.keyword) {
    const q = filters.keyword.toLowerCase();
    result = result.filter(
      (m) =>
        m.headline?.toLowerCase().includes(q) ||
        m.bio?.toLowerCase().includes(q) ||
        m.city?.toLowerCase().includes(q),
    );
  }
  if (filters.categories?.length) {
    result = result.filter((m) =>
      filters.categories!.some((category) => m.headline?.toLowerCase().includes(category.toLowerCase())),
    );
  }
  if (filters.minExperience !== undefined) {
    result = result.filter((m) => (m.yearsOfExperience ?? 0) >= filters.minExperience!);
  }
  if (filters.minRating !== undefined) {
    result = result.filter((m) => m.averageRating >= filters.minRating!);
  }
  if (filters.maxPrice !== undefined) {
    result = result.filter((m) => {
      const mentor = seedMentors.find((seed) => seed.id === m.id);
      const price = mentor?.pricingList?.[0]?.price ?? 0;
      return price <= filters.maxPrice!;
    });
  }
  if (filters.verifiedOnly) {
    result = result.filter((m) => m.verified);
  }
  return result;
};

const sortSummaries = (list: MentorSummary[], sortBy?: MentorSortKey): MentorSummary[] => {
  const copy = [...list];
  switch (sortBy) {
    case 'RATING':
      return copy.sort((a, b) => b.averageRating - a.averageRating);
    case 'REVIEWS':
      return copy.sort((a, b) => b.totalReviews - a.totalReviews);
    case 'SESSIONS':
      return copy.sort((a, b) => b.totalSessions - a.totalSessions);
    case 'EXPERIENCE':
      return copy.sort((a, b) => (b.yearsOfExperience ?? 0) - (a.yearsOfExperience ?? 0));
    case 'PRICE_LOW':
      return copy.sort((a, b) => {
        const pa = seedMentors.find((s) => s.id === a.id)?.pricingList?.[0]?.price ?? 0;
        const pb = seedMentors.find((s) => s.id === b.id)?.pricingList?.[0]?.price ?? 0;
        return pa - pb;
      });
    case 'PRICE_HIGH':
      return copy.sort((a, b) => {
        const pa = seedMentors.find((s) => s.id === a.id)?.pricingList?.[0]?.price ?? 0;
        const pb = seedMentors.find((s) => s.id === b.id)?.pricingList?.[0]?.price ?? 0;
        return pb - pa;
      });
    default:
      return copy;
  }
};

/**
 * Search mentors with debounced filters. When the backend is unreachable,
 * the curated seed catalog is filtered/sorted client-side so the
 * marketplace remains fully interactive.
 */
export const useMentorSearch = (query: DiscoveryQuery) => {
  const queryKey = marketplaceKeys.search(query);
  const { sortBy, page, size } = query;

  const result = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await mentorService.searchMentors(query);
      const pageResponse = response.data.data;
      return pageResponse;
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  // Offline / fallback projection with identical page contract.
  const fallback = useMemo<PageResponse<MentorSummary>>(() => {
    const filtered = applyFilters(seedMentorSummaries, query);
    const sorted = sortBy ? sortSummaries(filtered, sortBy as MentorSortKey | undefined) : filtered;
    const start = page * size;
    const content = sorted.slice(start, start + size);
    return {
      content,
      page,
      size,
      totalElements: sorted.length,
      totalPages: Math.max(1, Math.ceil(sorted.length / size)),
      first: page === 0,
      last: start + size >= sorted.length,
      empty: content.length === 0,
    };
  }, [query, sortBy, page, size]);

  const isOffline = result.isError;
  const data = result.data ?? fallback;

  return { ...result, data, isOffline };
};

/** Full mentor profile by ID (public variant) with seed fallback. */
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

  const fallback = useMemo<Mentor | null>(() => {
    if (!mentorId) return null;
    return seedMentors.find((m) => m.id === mentorId) ?? null;
  }, [mentorId]);

  const mentor = result.data ?? fallback ?? null;
  return { ...result, mentor, isOffline: result.isError };
};

/* ============================================================
   Saved mentors (wishlist) — persisted locally
   ============================================================ */

export const useSavedMentors = () => {
  const [saved, setSaved] = useState<string[]>(() =>
    getStoredValue<string[]>(STORAGE_KEYS.SAVED_MENTORS, []),
  );

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

  const savedMentors = useMemo<Mentor[]>(
    () => seedMentors.filter((m) => saved.includes(m.id)),
    [saved],
  );

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

/** Contact-mentor flow: open a message intent (prepares chat on Day 14). */
export const useContactMentor = () =>
  useMutation({
    mutationFn: async ({ mentorId, message }: { mentorId: string; message: string }) => {
      void mentorId; // Reserved for the communication-service chat API (Day 14).
      // Prepared for the communication-service chat API.
      await new Promise((resolvePromise) => window.setTimeout(resolvePromise, 600));
      return { sent: true, message };
    },
    onSuccess: () => showSuccess('Message ready to send — chat arrives with the Communication Center.'),
    onError: (error) => showError(getErrorMessage(error)),
  });

export { seedMentors };
