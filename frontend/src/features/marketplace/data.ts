import type { Mentor, MentorSummary } from '@/types';

/* ============================================================
   Empty typed defaults — the mentor marketplace renders honest
   empty states until the mentor-service returns real data.
   ============================================================ */

export const seedMentors: Mentor[] = [];
export const seedMentorSummaries: MentorSummary[] = [];
export const seedCategories: { label: string; icon: string }[] = [];
export const seedTrendingSkills: string[] = [];
