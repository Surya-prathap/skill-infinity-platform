import type { AdminDashboard } from '@/types';

/* ============================================================
   Empty typed defaults — the admin console renders honest empty
   states until the admin-service returns real data. No fabricated
   users, mentors, payments or system metrics.
   ============================================================ */

export const seedDashboard: AdminDashboard = {
  totalUsers: 0,
  totalMentors: 0,
  totalLearners: 0,
  recentActivities: [],
  systemHealth: { status: 'UP', uptime: 0 },
};
