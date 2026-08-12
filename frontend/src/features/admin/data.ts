import type {
  AdminAnalytics,
  AdminCoupon,
  AdminDashboard,
  AdminMentor,
  AdminPayment,
  AdminRefund,
  AdminSession,
  AdminSubscription,
  AdminUser,
  AdminWalletTransaction,
  AnnouncementTemplate,
  AuditLog,
  FeatureFlag,
  MentorApproval,
  ModerationReview,
  MonitoredService,
  PlatformSetting,
  ReportDefinition,
  ReviewModerationAnalytics,
  SupportTicket,
  SystemAnnouncement,
  SystemMetrics,
  WalletStats,
} from '@/types';

/* ============================================================
   Empty typed defaults — the admin console renders honest empty
   states until the admin-service returns real data. No fabricated
   users, payments, communities or system metrics.
   ============================================================ */

export const seedDashboard: AdminDashboard = {
  userStats: { totalUsers: 0, totalMentors: 0, totalLearners: 0, activeUsersToday: 0, dailyRegistrations: 0 },
  mentorStats: { totalMentors: 0, approvedMentors: 0, pendingApprovals: 0, suspendedMentors: 0 },
  sessionStats: { totalSessions: 0, completedSessions: 0, activeSessions: 0, cancelledSessions: 0 },
  revenueStats: { totalRevenue: 0, totalPayments: 0, pendingPayouts: 0, monthlyRevenue: 0 },
  communityStats: { totalCommunities: 0, totalPosts: 0, totalComments: 0, reportedContents: 0 },
  reviewStats: { totalReviews: 0, pendingReviews: 0, approvedReviews: 0, reportedReviews: 0 },
  recentActivities: [],
  systemHealth: { status: 'UP', activeServices: 0, totalServices: 0, averageResponseTime: 0, uptime: 0 },
};

export const seedAnalytics: AdminAnalytics = {
  revenue: { totalRevenue: 0, monthlyRevenue: 0, weeklyRevenue: 0, averageTransactionValue: 0, revenueByMonth: {} },
  growth: { userGrowthRate: 0, mentorGrowthRate: 0, sessionGrowthRate: 0, revenueGrowthRate: 0, registrationsByDay: {} },
  users: { totalUsers: 0, activeUsers: 0, newUsersToday: 0, newUsersThisWeek: 0, newUsersThisMonth: 0, usersByRole: {} },
  sessions: { totalSessions: 0, completedSessions: 0, cancelledSessions: 0, averageSessionDuration: 0, sessionsToday: 0, sessionsByStatus: {} },
  engagement: { averageRating: 0, totalReviews: 0, totalPosts: 0, totalComments: 0, mentorResponseRate: 0 },
};

export const seedUsers: AdminUser[] = [];
export const seedMentorApprovals: MentorApproval[] = [];
export const seedMentors: AdminMentor[] = [];
export const seedSessions: AdminSession[] = [];
export const seedPayments: AdminPayment[] = [];
export const seedRefunds: AdminRefund[] = [];
export const seedSubscriptions: AdminSubscription[] = [];
export const seedCoupons: AdminCoupon[] = [];
export const seedWalletStats: WalletStats = {
  totalCreditsIssued: 0,
  creditsOutstanding: 0,
  creditsUsed: 0,
  rewardsDistributed: 0,
  bonusesDistributed: 0,
  refundsProcessed: 0,
  averageBalance: 0,
};
export const seedWalletTransactions: AdminWalletTransaction[] = [];
export const seedModerationReviews: ModerationReview[] = [];
export const seedReviewAnalytics: ReviewModerationAnalytics = {
  totalReviews: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  reported: 0,
  averageRating: 0,
  helpfulVotes: 0,
  ratingsDistribution: {},
};
export const seedTickets: SupportTicket[] = [];
export const seedAnnouncements: SystemAnnouncement[] = [];
export const seedAnnouncementTemplates: AnnouncementTemplate[] = [];
export const seedReportDefinitions: ReportDefinition[] = [];
export const seedSettings: PlatformSetting[] = [];
export const seedFeatureFlags: FeatureFlag[] = [];
export const seedAuditLogs: AuditLog[] = [];
export const seedSystemMetrics: SystemMetrics = {
  apiStatus: 'UP',
  database: 'UP',
  redis: 'UP',
  rabbitmq: 'UP',
  minio: 'UP',
  cpuUsage: 0,
  memoryUsage: 0,
  storageUsage: 0,
  responseTimeMs: 0,
  errorRate: 0,
  requestsPerMinute: 0,
  activeSockets: 0,
  latencySeries: [],
  requestVolume: [],
  errorRateSeries: [],
};
export const seedServices: MonitoredService[] = [];
