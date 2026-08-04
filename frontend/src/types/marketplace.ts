/**
 * Marketplace domain types — mirror the mentor-service
 * MentorSummaryResponse and SearchRequest contracts, plus client-side
 * filter state used by the discovery experience.
 */

/** Summary card returned by the mentor search endpoint. */
export interface MentorSummary {
  id: string;
  userId: string;
  headline?: string;
  bio?: string;
  profilePictureUrl?: string;
  country?: string;
  city?: string;
  yearsOfExperience?: number;
  averageRating: number;
  totalReviews: number;
  totalSessions: number;
  totalStudents: number;
  profileCompletionPercentage: number;
  verified?: boolean;
}

/** Client-side discovery filter state (serialized to the search API). */
export interface DiscoveryFilters {
  keyword?: string;
  skills?: string[];
  categories?: string[];
  subcategories?: string[];
  minExperience?: number;
  maxExperience?: number;
  languages?: string[];
  maxPrice?: number;
  country?: string;
  timezone?: string;
  minRating?: number;
  availableNow?: boolean;
  verifiedOnly?: boolean;
}

export type MentorSortKey =
  | 'RATING'
  | 'REVIEWS'
  | 'SESSIONS'
  | 'EXPERIENCE'
  | 'PRICE_LOW'
  | 'PRICE_HIGH';

export interface MentorSortOption {
  value: MentorSortKey;
  label: string;
}

export interface DiscoveryQuery extends DiscoveryFilters {
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
}
