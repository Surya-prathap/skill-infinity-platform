import type {
  Category,
  DashboardData,
  Mentor,
  MentorAchievement,
  MentorAvailability,
  MentorCertification,
  MentorPreference,
  MentorPricing,
} from '@/types';

/* ============================================================
   Empty typed defaults — no demo data. The mentor dashboard,
   analytics and studio pages render empty states until the
   mentor / session / wallet / review services return real data.
   ============================================================ */

export const MENTOR_REVENUE_SERIES: { label: string; value: number }[] = [];
export const MENTOR_WEEKLY_ACTIVITY: { label: string; value: number }[] = [];
export const MENTOR_SESSION_MIX: { label: string; value: number; color: string }[] = [];
export const MENTOR_TODAY_SESSIONS: {
  id: string;
  student: string;
  topic: string;
  time: string;
  status: string;
  color: string;
}[] = [];
export const MENTOR_UPCOMING_SESSIONS: {
  id: string;
  student: string;
  topic: string;
  date: string;
  time: string;
  status: string;
  color: string;
}[] = [];
export const MENTOR_REVIEWS: { id: string; author: string; rating: number; text: string; time: string }[] = [];
export const MENTOR_ACTIVITY: {
  title: string;
  description: string;
  time: string;
  color: string;
}[] = [];

export const seedCertifications: MentorCertification[] = [];
export const seedAchievements: MentorAchievement[] = [];

/** Empty preference defaults — the real values come from the mentor profile. */
export const seedPreferences: MentorPreference = {
  autoApproveSessions: false,
  notificationOnBooking: false,
  notificationOnCancellation: false,
};

export const ANALYTICS_SESSION_TREND: { label: string; value: number }[] = [];
export const ANALYTICS_STUDENT_GROWTH: { label: string; value: number }[] = [];
export const ANALYTICS_BOOKING_TRENDS: { label: string; value: number }[] = [];
export const ANALYTICS_RATING_TRENDS: { label: string; value: number }[] = [];
export const ANALYTICS_TOP_SKILLS: { label: string; value: number; color: string }[] = [];
export const ANALYTICS_POPULAR_CATEGORIES: { label: string; value: number; color: string }[] = [];

export const seedAvailability: MentorAvailability[] = [];
export const seedPricing: MentorPricing[] = [];

/** Empty mentor shape — only used as a safe fallback before the API responds. */
export const seedMentor: Mentor = {
  id: '',
  userId: '',
  verified: false,
  profile: {},
};

export const seedDashboard: DashboardData = {
  upcomingSessions: 0,
  pendingRequests: 0,
};

export const FALLBACK_CATEGORIES: Category[] = [];
