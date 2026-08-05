import type { AchievementRarity } from '@/types';

/** Community cover gradients — index into this for deterministic covers. */
export const COMMUNITY_COVERS = [
  'linear-gradient(135deg, #6D5DF6 0%, #43C6C0 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)',
  'linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)',
  'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)',
  'linear-gradient(135deg, #F43F5E 0%, #F59E0B 100%)',
  'linear-gradient(135deg, #14B8A6 0%, #6D5DF6 100%)',
] as const;

export const communityCover = (index: number): string =>
  COMMUNITY_COVERS[index % COMMUNITY_COVERS.length] ?? COMMUNITY_COVERS[0]!;

export const LEADERBOARD_CATEGORY_LABELS: Record<string, string> = {
  LEARNERS: 'Top Learners',
  MENTORS: 'Top Mentors',
  CONTRIBUTORS: 'Top Contributors',
  CHAMPIONS: 'Community Champions',
  HELPFUL: 'Most Helpful Users',
};

export const LEADERBOARD_RANGE_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  ALL_TIME: 'All Time',
};

export const ACHIEVEMENT_RARITY: Record<AchievementRarity, { label: string; color: string }> = {
  COMMON: { label: 'Common', color: '#94A3B8' },
  RARE: { label: 'Rare', color: '#3B82F6' },
  EPIC: { label: 'Epic', color: '#8B5CF6' },
  LEGENDARY: { label: 'Legendary', color: '#F59E0B' },
};

export const REVIEW_DIMENSION_LABELS: Record<string, string> = {
  skill: 'Skill',
  communication: 'Communication',
  knowledge: 'Knowledge',
  professionalism: 'Professionalism',
};

export const POST_CONTENT_TYPE_LABELS: Record<string, string> = {
  TEXT: 'Text',
  IMAGE: 'Image',
  VIDEO: 'Video',
  DOCUMENT: 'Document',
  CODE: 'Code',
  LINK: 'Link',
  POLL: 'Poll',
};
