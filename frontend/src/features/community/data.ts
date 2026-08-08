import type {
  Achievement,
  ActivityItem,
  Community,
  CommunityCategory,
  CommunityComment,
  CommunityPost,
  LeaderboardCategory,
  LeaderboardEntry,
  LeaderboardRange,
  LearningStats,
  Review,
  Tag,
} from '@/types';

/* ============================================================
   Empty typed defaults — every community screen renders honest
   empty states until the community-service returns real data.
   No fabricated posts, comments, users or stats.
   ============================================================ */

export const CURRENT_USER_ID = '';
export const CURRENT_USER_NAME = '';

export const seedCategories: CommunityCategory[] = [];
export const seedTags: Tag[] = [];
export const seedCommunities: Community[] = [];
export const seedPosts: CommunityPost[] = [];
export const seedComments: Record<string, CommunityComment[]> = {};
export const seedLeaderboard: Record<
  LeaderboardCategory,
  Record<LeaderboardRange, LeaderboardEntry[]>
> = {
  LEARNERS: { WEEKLY: [], MONTHLY: [], ALL_TIME: [] },
  MENTORS: { WEEKLY: [], MONTHLY: [], ALL_TIME: [] },
  CONTRIBUTORS: { WEEKLY: [], MONTHLY: [], ALL_TIME: [] },
  CHAMPIONS: { WEEKLY: [], MONTHLY: [], ALL_TIME: [] },
  HELPFUL: { WEEKLY: [], MONTHLY: [], ALL_TIME: [] },
};
export const seedActivity: ActivityItem[] = [];
export const seedAchievements: Achievement[] = [];
export const seedLearningStats: LearningStats | null = null;
export const seedReviewsByMentor: Record<string, Review[]> = {};
export const seedHubStats: Record<string, number> = {};
export const seedTrendingKeywords: string[] = [];
