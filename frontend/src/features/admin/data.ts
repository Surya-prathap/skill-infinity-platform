import type {
  AdminAnalytics,
  AdminCommunity,
  AdminCommunityPost,
  AdminCoupon,
  AdminDashboard,
  AdminMentor,
  AdminPayment,
  AdminPoll,
  AdminRefund,
  AdminSession,
  AdminSubscription,
  AdminUser,
  AdminWalletTransaction,
  AnnouncementTemplate,
  AuditLog,
  FeatureFlag,
  MentorApproval,
  ModerationQueueItem,
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

/** Returns an ISO timestamp `hours` before now. */
const hoursAgo = (hours: number): string => new Date(Date.now() - hours * 3600_000).toISOString();
const daysAgo = (days: number): string => hoursAgo(days * 24);

/* ============================================================
   Executive dashboard
   ============================================================ */

export const seedDashboard: AdminDashboard = {
  userStats: {
    totalUsers: 48203,
    totalMentors: 2541,
    totalLearners: 45289,
    activeUsersToday: 3182,
    dailyRegistrations: 214,
  },
  mentorStats: {
    totalMentors: 2541,
    approvedMentors: 2389,
    pendingApprovals: 47,
    suspendedMentors: 105,
  },
  sessionStats: {
    totalSessions: 61230,
    completedSessions: 48912,
    activeSessions: 186,
    cancelledSessions: 8432,
  },
  revenueStats: {
    totalRevenue: 482300,
    totalPayments: 39210,
    pendingPayouts: 12480,
    monthlyRevenue: 86400,
  },
  communityStats: {
    totalCommunities: 128,
    totalPosts: 18240,
    totalComments: 96410,
    reportedContents: 23,
  },
  reviewStats: {
    totalReviews: 31420,
    pendingReviews: 96,
    approvedReviews: 30820,
    reportedReviews: 17,
  },
  recentActivities: [
    { action: 'MENTOR_APPROVED', description: 'Alex Rivera approved as Cloud Architecture mentor', timestamp: hoursAgo(0.4) },
    { action: 'USER_SUSPENDED', description: 'Account for spamming community posts suspended', timestamp: hoursAgo(1.2) },
    { action: 'PAYMENT_REFUNDED', description: 'Refund of $120.00 issued for session S-88412', timestamp: hoursAgo(2.6) },
    { action: 'ANNOUNCEMENT', description: 'Maintenance window scheduled for Saturday 02:00 UTC', timestamp: hoursAgo(4.1) },
    { action: 'FLAG_UPDATED', description: 'Feature flag ai_review_moderation enabled at 25%', timestamp: hoursAgo(5.8) },
    { action: 'REVIEW_APPROVED', description: '12 pending reviews approved in bulk moderation', timestamp: hoursAgo(7.3) },
    { action: 'SETTING_UPDATED', description: 'Registration policy updated to OPEN_WITH_REVIEW', timestamp: hoursAgo(9) },
    { action: 'TICKET_RESOLVED', description: 'Support ticket #10293 resolved (payment delay)', timestamp: hoursAgo(11.5) },
  ],
  systemHealth: {
    status: 'UP',
    activeServices: 12,
    totalServices: 12,
    averageResponseTime: 84,
    uptime: 99.99,
  },
};

/* ============================================================
   Analytics
   ============================================================ */

const revenueByMonth: Record<string, number> = {
  'Aug 25': 41200,
  'Sep 25': 46800,
  'Oct 25': 52100,
  'Nov 25': 49800,
  'Dec 25': 61200,
  'Jan 26': 58700,
  'Feb 26': 64300,
  'Mar 26': 71200,
  'Apr 26': 75800,
  'May 26': 80100,
  'Jun 26': 83600,
  'Jul 26': 86400,
};

const registrationsByDay: Record<string, number> = {
  Mon: 168,
  Tue: 192,
  Wed: 214,
  Thu: 205,
  Fri: 231,
  Sat: 146,
  Sun: 121,
};

export const seedAnalytics: AdminAnalytics = {
  revenue: {
    totalRevenue: 482300,
    monthlyRevenue: 86400,
    weeklyRevenue: 20480,
    averageTransactionValue: 12.3,
    revenueByMonth,
  },
  growth: {
    userGrowthRate: 14.2,
    mentorGrowthRate: 9.6,
    sessionGrowthRate: 22.4,
    revenueGrowthRate: 18.9,
    registrationsByDay,
  },
  users: {
    totalUsers: 48203,
    activeUsers: 31240,
    newUsersToday: 214,
    newUsersThisWeek: 1420,
    newUsersThisMonth: 5810,
    usersByRole: { ROLE_LEARNER: 45289, ROLE_MENTOR: 2541, ROLE_ADMIN: 42, ROLE_USER: 331 },
  },
  sessions: {
    totalSessions: 61230,
    completedSessions: 48912,
    cancelledSessions: 8432,
    averageSessionDuration: 52,
    sessionsToday: 186,
    sessionsByStatus: { SCHEDULED: 940, LIVE: 186, COMPLETED: 48912, CANCELLED: 8432, RESCHEDULED: 2760 },
  },
  engagement: {
    averageRating: 4.7,
    totalReviews: 31420,
    totalPosts: 18240,
    totalComments: 96410,
    mentorResponseRate: 91,
  },
};

/* ============================================================
   Users
   ============================================================ */

export const seedUsers: AdminUser[] = [
  { id: 'u-1001', name: 'Sarah Chen', email: 'sarah.chen@example.com', role: 'ROLE_LEARNER', status: 'ACTIVE', joinedAt: daysAgo(412), lastActiveAt: hoursAgo(0.3), sessionsCompleted: 34, totalSpend: 1420, walletBalance: 240, country: 'US' },
  { id: 'u-1002', name: 'Alex Rivera', email: 'alex.rivera@example.com', role: 'ROLE_MENTOR', status: 'ACTIVE', joinedAt: daysAgo(380), lastActiveAt: hoursAgo(1), sessionsCompleted: 128, totalSpend: 0, walletBalance: 4820, country: 'MX' },
  { id: 'u-1003', name: 'Marcus Reid', email: 'marcus.reid@example.com', role: 'ROLE_LEARNER', status: 'PENDING', joinedAt: daysAgo(2), lastActiveAt: hoursAgo(5), sessionsCompleted: 0, totalSpend: 0, walletBalance: 120, country: 'GB' },
  { id: 'u-1004', name: 'Priya Sharma', email: 'priya.sharma@example.com', role: 'ROLE_MENTOR', status: 'SUSPENDED', joinedAt: daysAgo(300), lastActiveAt: daysAgo(12), sessionsCompleted: 76, totalSpend: 0, walletBalance: 2100, country: 'IN' },
  { id: 'u-1005', name: 'Diego Fernández', email: 'diego.f@example.com', role: 'ROLE_LEARNER', status: 'ACTIVE', joinedAt: daysAgo(220), lastActiveAt: hoursAgo(2), sessionsCompleted: 18, totalSpend: 640, walletBalance: 80, country: 'ES' },
  { id: 'u-1006', name: 'Emma Wilson', email: 'emma.wilson@example.com', role: 'ROLE_MENTOR', status: 'ACTIVE', joinedAt: daysAgo(260), lastActiveAt: hoursAgo(0.8), sessionsCompleted: 94, totalSpend: 0, walletBalance: 3650, country: 'AU' },
  { id: 'u-1007', name: 'Hiroshi Tanaka', email: 'hiroshi.t@example.com', role: 'ROLE_LEARNER', status: 'ACTIVE', joinedAt: daysAgo(140), lastActiveAt: hoursAgo(3), sessionsCompleted: 9, totalSpend: 380, walletBalance: 60, country: 'JP' },
  { id: 'u-1008', name: 'Fatima Al-Sayed', email: 'fatima.as@example.com', role: 'ROLE_LEARNER', status: 'BANNED', joinedAt: daysAgo(90), lastActiveAt: daysAgo(20), sessionsCompleted: 3, totalSpend: 90, walletBalance: 0, country: 'AE' },
  { id: 'u-1009', name: 'Liam O’Connor', email: 'liam.oc@example.com', role: 'ROLE_MENTOR', status: 'ACTIVE', joinedAt: daysAgo(340), lastActiveAt: hoursAgo(4), sessionsCompleted: 152, totalSpend: 0, walletBalance: 7900, country: 'IE' },
  { id: 'u-1010', name: 'Sofia Rossi', email: 'sofia.rossi@example.com', role: 'ROLE_LEARNER', status: 'ACTIVE', joinedAt: daysAgo(75), lastActiveAt: hoursAgo(1.5), sessionsCompleted: 12, totalSpend: 460, walletBalance: 190, country: 'IT' },
  { id: 'u-1011', name: 'Kenji Nakamura', email: 'kenji.n@example.com', role: 'ROLE_ADMIN', status: 'ACTIVE', joinedAt: daysAgo(600), lastActiveAt: hoursAgo(0.2), sessionsCompleted: 0, totalSpend: 0, walletBalance: 0, country: 'JP' },
  { id: 'u-1012', name: 'Amara Okafor', email: 'amara.okafor@example.com', role: 'ROLE_LEARNER', status: 'ACTIVE', joinedAt: daysAgo(48), lastActiveAt: hoursAgo(6), sessionsCompleted: 6, totalSpend: 210, walletBalance: 420, country: 'NG' },
  { id: 'u-1013', name: 'Oliver Berg', email: 'oliver.berg@example.com', role: 'ROLE_MENTOR', status: 'PENDING', joinedAt: daysAgo(4), lastActiveAt: hoursAgo(8), sessionsCompleted: 0, totalSpend: 0, walletBalance: 0, country: 'DE' },
  { id: 'u-1014', name: 'Chloe Martin', email: 'chloe.martin@example.com', role: 'ROLE_LEARNER', status: 'ACTIVE', joinedAt: daysAgo(190), lastActiveAt: hoursAgo(9), sessionsCompleted: 21, totalSpend: 820, walletBalance: 300, country: 'FR' },
  { id: 'u-1015', name: 'Ravi Patel', email: 'ravi.patel@example.com', role: 'ROLE_MENTOR', status: 'ACTIVE', joinedAt: daysAgo(280), lastActiveAt: hoursAgo(2.2), sessionsCompleted: 110, totalSpend: 0, walletBalance: 5400, country: 'IN' },
  { id: 'u-1016', name: 'Nina Kowalski', email: 'nina.k@example.com', role: 'ROLE_LEARNER', status: 'ACTIVE', joinedAt: daysAgo(30), lastActiveAt: hoursAgo(12), sessionsCompleted: 4, totalSpend: 150, walletBalance: 90, country: 'PL' },
  { id: 'u-1017', name: 'Tomas Silva', email: 'tomas.silva@example.com', role: 'ROLE_MENTOR', status: 'SUSPENDED', joinedAt: daysAgo(150), lastActiveAt: daysAgo(8), sessionsCompleted: 42, totalSpend: 0, walletBalance: 980, country: 'BR' },
  { id: 'u-1018', name: 'Hannah Kim', email: 'hannah.kim@example.com', role: 'ROLE_LEARNER', status: 'ACTIVE', joinedAt: daysAgo(520), lastActiveAt: hoursAgo(0.9), sessionsCompleted: 58, totalSpend: 2450, walletBalance: 640, country: 'KR' },
  { id: 'u-1019', name: 'Yusuf Demir', email: 'yusuf.demir@example.com', role: 'ROLE_LEARNER', status: 'PENDING', joinedAt: daysAgo(1), lastActiveAt: hoursAgo(3), sessionsCompleted: 0, totalSpend: 0, walletBalance: 30, country: 'TR' },
  { id: 'u-1020', name: 'Isabella Costa', email: 'isabella.costa@example.com', role: 'ROLE_MENTOR', status: 'ACTIVE', joinedAt: daysAgo(310), lastActiveAt: hoursAgo(5), sessionsCompleted: 88, totalSpend: 0, walletBalance: 4100, country: 'PT' },
  { id: 'u-1021', name: 'Noah Fischer', email: 'noah.fischer@example.com', role: 'ROLE_LEARNER', status: 'ACTIVE', joinedAt: daysAgo(65), lastActiveAt: hoursAgo(7), sessionsCompleted: 7, totalSpend: 260, walletBalance: 110, country: 'CH' },
  { id: 'u-1022', name: 'Mei Lin', email: 'mei.lin@example.com', role: 'ROLE_LEARNER', status: 'ACTIVE', joinedAt: daysAgo(250), lastActiveAt: hoursAgo(0.5), sessionsCompleted: 29, totalSpend: 1180, walletBalance: 250, country: 'SG' },
  { id: 'u-1023', name: 'Gabriel Costa', email: 'gabriel.costa@example.com', role: 'ROLE_ADMIN', status: 'ACTIVE', joinedAt: daysAgo(550), lastActiveAt: hoursAgo(1.8), sessionsCompleted: 0, totalSpend: 0, walletBalance: 0, country: 'BR' },
  { id: 'u-1024', name: 'Aisha Bello', email: 'aisha.bello@example.com', role: 'ROLE_LEARNER', status: 'ACTIVE', joinedAt: daysAgo(12), lastActiveAt: hoursAgo(2.5), sessionsCompleted: 2, totalSpend: 80, walletBalance: 200, country: 'NG' },
];

/* ============================================================
   Mentor approvals & mentors
   ============================================================ */

export const seedMentorApprovals: MentorApproval[] = [
  { id: 'm-a1', name: 'Oliver Berg', email: 'oliver.berg@example.com', expertise: ['Kubernetes', 'DevOps', 'CI/CD'], yearsExperience: 9, requestedAt: daysAgo(4), verificationScore: 92, certificates: ['CKA', 'AWS DevOps Pro'], bio: 'Platform engineer helping teams ship faster with cloud-native tooling.', hourlyRate: 95, status: 'PENDING' },
  { id: 'm-a2', name: 'Ava Thompson', email: 'ava.thompson@example.com', expertise: ['Product Design', 'Figma', 'Design Systems'], yearsExperience: 7, requestedAt: daysAgo(3), verificationScore: 88, certificates: ['Google UX', 'Interaction Design'], bio: 'Product designer focused on enterprise SaaS design systems.', hourlyRate: 110, status: 'PENDING' },
  { id: 'm-a3', name: 'Lucas Meyer', email: 'lucas.meyer@example.com', expertise: ['Machine Learning', 'Python', 'MLOps'], yearsExperience: 11, requestedAt: daysAgo(2), verificationScore: 95, certificates: ['TensorFlow', 'AWS ML Specialty'], bio: 'ML engineer and educator with production experience at scale.', hourlyRate: 140, status: 'PENDING' },
  { id: 'm-a4', name: 'Yuki Sato', email: 'yuki.sato@example.com', expertise: ['System Design', 'Microservices', 'Java'], yearsExperience: 13, requestedAt: daysAgo(1), verificationScore: 90, certificates: ['Oracle Java', 'Spring Professional'], bio: 'Principal engineer mentoring architects for FAANG interviews.', hourlyRate: 160, status: 'PENDING' },
  { id: 'm-a5', name: 'Zoe Anderson', email: 'zoe.anderson@example.com', expertise: ['Data Engineering', 'SQL', 'Airflow'], yearsExperience: 6, requestedAt: hoursAgo(14), verificationScore: 81, certificates: ['GCP Data Engineer'], bio: 'Data engineer passionate about analytics pipelines.', hourlyRate: 85, status: 'PENDING' },
];

export const seedMentors: AdminMentor[] = [
  { id: 'm-201', name: 'Alex Rivera', email: 'alex.rivera@example.com', status: 'ACTIVE', verified: true, rating: 4.9, reviewCount: 412, sessionsCompleted: 128, revenue: 18240, hourlyRate: 120, expertise: ['Cloud Architecture', 'AWS', 'System Design'], responseRate: 98, joinedAt: daysAgo(380), lastActiveAt: hoursAgo(1), certificates: 6 },
  { id: 'm-202', name: 'Emma Wilson', email: 'emma.wilson@example.com', status: 'ACTIVE', verified: true, rating: 4.8, reviewCount: 268, sessionsCompleted: 94, revenue: 12980, hourlyRate: 100, expertise: ['Frontend', 'React', 'TypeScript'], responseRate: 95, joinedAt: daysAgo(260), lastActiveAt: hoursAgo(0.8), certificates: 4 },
  { id: 'm-203', name: 'Liam O’Connor', email: 'liam.oc@example.com', status: 'ACTIVE', verified: true, rating: 4.9, reviewCount: 540, sessionsCompleted: 152, revenue: 21450, hourlyRate: 135, expertise: ['Backend', 'Go', 'Distributed Systems'], responseRate: 99, joinedAt: daysAgo(340), lastActiveAt: hoursAgo(4), certificates: 7 },
  { id: 'm-204', name: 'Ravi Patel', email: 'ravi.patel@example.com', status: 'ACTIVE', verified: true, rating: 4.7, reviewCount: 198, sessionsCompleted: 110, revenue: 11200, hourlyRate: 90, expertise: ['Data Science', 'Python', 'SQL'], responseRate: 93, joinedAt: daysAgo(280), lastActiveAt: hoursAgo(2.2), certificates: 5 },
  { id: 'm-205', name: 'Isabella Costa', email: 'isabella.costa@example.com', status: 'ACTIVE', verified: false, rating: 4.6, reviewCount: 84, sessionsCompleted: 88, revenue: 6400, hourlyRate: 75, expertise: ['Marketing', 'Growth', 'Analytics'], responseRate: 89, joinedAt: daysAgo(310), lastActiveAt: hoursAgo(5), certificates: 2 },
  { id: 'm-206', name: 'Priya Sharma', email: 'priya.sharma@example.com', status: 'SUSPENDED', verified: true, rating: 4.4, reviewCount: 76, sessionsCompleted: 76, revenue: 8900, hourlyRate: 85, expertise: ['Product Management', 'Strategy'], responseRate: 82, joinedAt: daysAgo(300), lastActiveAt: daysAgo(12), certificates: 3 },
  { id: 'm-207', name: 'Tomas Silva', email: 'tomas.silva@example.com', status: 'SUSPENDED', verified: false, rating: 4.2, reviewCount: 41, sessionsCompleted: 42, revenue: 3600, hourlyRate: 60, expertise: ['Mobile', 'Flutter'], responseRate: 71, joinedAt: daysAgo(150), lastActiveAt: daysAgo(8), certificates: 1 },
  { id: 'm-208', name: 'Hannah Park', email: 'hannah.park@example.com', status: 'ACTIVE', verified: true, rating: 5.0, reviewCount: 312, sessionsCompleted: 98, revenue: 15400, hourlyRate: 130, expertise: ['Career Coaching', 'Interviews', 'Resume'], responseRate: 100, joinedAt: daysAgo(200), lastActiveAt: hoursAgo(1.2), certificates: 4 },
  { id: 'm-209', name: 'Daniel Mensah', email: 'daniel.mensah@example.com', status: 'PENDING', verified: false, rating: 0, reviewCount: 0, sessionsCompleted: 0, revenue: 0, hourlyRate: 70, expertise: ['Security', 'Pen Testing'], responseRate: 0, joinedAt: daysAgo(5), lastActiveAt: daysAgo(5), certificates: 0 },
  { id: 'm-210', name: 'Grace Lee', email: 'grace.lee@example.com', status: 'ACTIVE', verified: true, rating: 4.8, reviewCount: 156, sessionsCompleted: 84, revenue: 10100, hourlyRate: 105, expertise: ['UI Engineering', 'Accessibility'], responseRate: 96, joinedAt: daysAgo(170), lastActiveAt: hoursAgo(3), certificates: 5 },
];

/* ============================================================
   Sessions
   ============================================================ */

export const seedSessions: AdminSession[] = [
  { id: 's-88401', title: 'System Design — Scalable APIs', mentorName: 'Alex Rivera', learnerName: 'Sarah Chen', status: 'LIVE', startAt: hoursAgo(0.2), durationMinutes: 60, revenue: 120, type: '1:1' },
  { id: 's-88402', title: 'React Performance Deep Dive', mentorName: 'Emma Wilson', learnerName: 'Chloe Martin', status: 'LIVE', startAt: hoursAgo(0.1), durationMinutes: 45, revenue: 100, type: '1:1' },
  { id: 's-88403', title: 'Go Microservices Workshop', mentorName: 'Liam O’Connor', learnerName: 'Group (8)', status: 'LIVE', startAt: hoursAgo(0.5), durationMinutes: 120, revenue: 640, type: 'WORKSHOP' },
  { id: 's-88404', title: 'AWS Solutions Architect Prep', mentorName: 'Alex Rivera', learnerName: 'Mei Lin', status: 'SCHEDULED', startAt: hoursAgo(-6), durationMinutes: 90, revenue: 180, type: '1:1' },
  { id: 's-88405', title: 'Data Science Career Path', mentorName: 'Ravi Patel', learnerName: 'Hiroshi Tanaka', status: 'SCHEDULED', startAt: hoursAgo(-8), durationMinutes: 60, revenue: 90, type: '1:1' },
  { id: 's-88406', title: 'Interview Coaching — Behavioral', mentorName: 'Hannah Park', learnerName: 'Aisha Bello', status: 'SCHEDULED', startAt: hoursAgo(-24), durationMinutes: 60, revenue: 130, type: '1:1' },
  { id: 's-88407', title: 'Kubernetes Bootcamp (Week 3)', mentorName: 'Oliver Berg', learnerName: 'Group (12)', status: 'SCHEDULED', startAt: hoursAgo(-30), durationMinutes: 180, revenue: 960, type: 'GROUP' },
  { id: 's-88408', title: 'TypeScript Advanced Patterns', mentorName: 'Emma Wilson', learnerName: 'Nina Kowalski', status: 'COMPLETED', startAt: daysAgo(1), durationMinutes: 60, revenue: 100, type: '1:1' },
  { id: 's-88409', title: 'Design Systems for SaaS', mentorName: 'Isabella Costa', learnerName: 'Sofia Rossi', status: 'COMPLETED', startAt: daysAgo(1), durationMinutes: 75, revenue: 75, type: '1:1' },
  { id: 's-88410', title: 'Machine Learning Foundations', mentorName: 'Lucas Meyer', learnerName: 'Amara Okafor', status: 'COMPLETED', startAt: daysAgo(2), durationMinutes: 90, revenue: 140, type: '1:1' },
  { id: 's-88411', title: 'Distributed Systems Reading Group', mentorName: 'Liam O’Connor', learnerName: 'Group (6)', status: 'COMPLETED', startAt: daysAgo(2), durationMinutes: 120, revenue: 420, type: 'GROUP' },
  { id: 's-88412', title: 'Resume & LinkedIn Review', mentorName: 'Hannah Park', learnerName: 'Oliver Berg', status: 'CANCELLED', startAt: daysAgo(3), durationMinutes: 45, revenue: 0, type: '1:1' },
  { id: 's-88413', title: 'SQL for Analytics', mentorName: 'Ravi Patel', learnerName: 'Hannah Kim', status: 'CANCELLED', startAt: daysAgo(3), durationMinutes: 60, revenue: 0, type: '1:1' },
  { id: 's-88414', title: 'Flutter Mobile App', mentorName: 'Tomas Silva', learnerName: 'Noah Fischer', status: 'CANCELLED', startAt: daysAgo(4), durationMinutes: 60, revenue: 0, type: '1:1' },
  { id: 's-88415', title: 'Cloud Cost Optimization', mentorName: 'Alex Rivera', learnerName: 'Diego Fernández', status: 'RESCHEDULED', startAt: daysAgo(5), durationMinutes: 60, revenue: 120, type: '1:1' },
  { id: 's-88416', title: 'Frontend System Design', mentorName: 'Emma Wilson', learnerName: 'Sarah Chen', status: 'RESCHEDULED', startAt: daysAgo(6), durationMinutes: 90, revenue: 150, type: '1:1' },
  { id: 's-88417', title: 'Python for Data Engineering', mentorName: 'Ravi Patel', learnerName: 'Aisha Bello', status: 'COMPLETED', startAt: daysAgo(6), durationMinutes: 60, revenue: 90, type: '1:1' },
  { id: 's-88418', title: 'Mock Interview — System Design', mentorName: 'Alex Rivera', learnerName: 'Mei Lin', status: 'COMPLETED', startAt: daysAgo(7), durationMinutes: 90, revenue: 180, type: '1:1' },
  { id: 's-88419', title: 'Career Pivot Strategy', mentorName: 'Hannah Park', learnerName: 'Yusuf Demir', status: 'COMPLETED', startAt: daysAgo(8), durationMinutes: 60, revenue: 130, type: '1:1' },
  { id: 's-88420', title: 'Accessibility Audits 101', mentorName: 'Grace Lee', learnerName: 'Sofia Rossi', status: 'SCHEDULED', startAt: hoursAgo(-48), durationMinutes: 60, revenue: 105, type: '1:1' },
];

/* ============================================================
   Payments, refunds, subscriptions, coupons
   ============================================================ */

export const seedPayments: AdminPayment[] = [
  { id: 'p-9001', userId: 'u-1001', userName: 'Sarah Chen', amount: 120, status: 'SUCCEEDED', method: 'CARD', description: 'Session — System Design (Alex Rivera)', createdAt: hoursAgo(1), fee: 3.6 },
  { id: 'p-9002', userId: 'u-1003', userName: 'Marcus Reid', amount: 60, status: 'PENDING', method: 'PAYPAL', description: 'Credit pack — Starter 60', createdAt: hoursAgo(3), fee: 1.8 },
  { id: 'p-9003', userId: 'u-1004', userName: 'Priya Sharma', amount: 640, status: 'SUCCEEDED', method: 'WALLET', description: 'Workshop payout — Kubernetes', createdAt: hoursAgo(5), fee: 19.2 },
  { id: 'p-9004', userId: 'u-1006', userName: 'Emma Wilson', amount: 100, status: 'SUCCEEDED', method: 'BANK', description: 'Session — React Deep Dive', createdAt: hoursAgo(8), fee: 3 },
  { id: 'p-9005', userId: 'u-1007', userName: 'Hiroshi Tanaka', amount: 90, status: 'FAILED', method: 'CARD', description: 'Session — Data Science Path', createdAt: hoursAgo(12), fee: 0 },
  { id: 'p-9006', userId: 'u-1009', userName: 'Liam O’Connor', amount: 420, status: 'SUCCEEDED', method: 'WALLET', description: 'Group session — Distributed Systems', createdAt: hoursAgo(20), fee: 12.6 },
  { id: 'p-9007', userId: 'u-1010', userName: 'Sofia Rossi', amount: 75, status: 'SUCCEEDED', method: 'CARD', description: 'Session — Design Systems', createdAt: daysAgo(1), fee: 2.25 },
  { id: 'p-9008', userId: 'u-1012', userName: 'Amara Okafor', amount: 140, status: 'SUCCEEDED', method: 'PAYPAL', description: 'Session — ML Foundations', createdAt: daysAgo(2), fee: 4.2 },
  { id: 'p-9009', userId: 'u-1014', userName: 'Chloe Martin', amount: 100, status: 'REFUNDED', method: 'CARD', description: 'Session — React Deep Dive', createdAt: daysAgo(3), fee: 3 },
  { id: 'p-9010', userId: 'u-1018', userName: 'Hannah Kim', amount: 90, status: 'SUCCEEDED', method: 'CARD', description: 'Session — SQL for Analytics', createdAt: daysAgo(4), fee: 2.7 },
  { id: 'p-9011', userId: 'u-1022', userName: 'Mei Lin', amount: 180, status: 'SUCCEEDED', method: 'WALLET', description: 'Mock Interview — System Design', createdAt: daysAgo(5), fee: 5.4 },
  { id: 'p-9012', userId: 'u-1019', userName: 'Yusuf Demir', amount: 130, status: 'CANCELLED', method: 'CARD', description: 'Session — Career Pivot', createdAt: daysAgo(6), fee: 0 },
  { id: 'p-9013', userId: 'u-1024', userName: 'Aisha Bello', amount: 90, status: 'SUCCEEDED', method: 'CARD', description: 'Session — Python for Data', createdAt: daysAgo(7), fee: 2.7 },
  { id: 'p-9014', userId: 'u-1001', userName: 'Sarah Chen', amount: 300, status: 'SUCCEEDED', method: 'CARD', description: 'Credit pack — Pro 300', createdAt: daysAgo(8), fee: 9 },
  { id: 'p-9015', userId: 'u-1016', userName: 'Nina Kowalski', amount: 60, status: 'SUCCEEDED', method: 'PAYPAL', description: 'Credit pack — Starter 60', createdAt: daysAgo(9), fee: 1.8 },
  { id: 'p-9016', userId: 'u-1021', userName: 'Noah Fischer', amount: 105, status: 'FAILED', method: 'CARD', description: 'Session — Accessibility Audit', createdAt: daysAgo(10), fee: 0 },
  { id: 'p-9017', userId: 'u-1005', userName: 'Diego Fernández', amount: 120, status: 'SUCCEEDED', method: 'CARD', description: 'Session — Cloud Cost Optimization', createdAt: daysAgo(11), fee: 3.6 },
  { id: 'p-9018', userId: 'u-1008', userName: 'Fatima Al-Sayed', amount: 90, status: 'REFUNDED', method: 'WALLET', description: 'Session — cancelled by learner', createdAt: daysAgo(12), fee: 2.7 },
];

export const seedRefunds: AdminRefund[] = [
  { id: 'r-5001', paymentId: 'p-9009', userName: 'Chloe Martin', amount: 100, reason: 'Mentor was unavailable at start time', status: 'PROCESSED', requestedAt: daysAgo(3) },
  { id: 'r-5002', paymentId: 'p-9018', userName: 'Fatima Al-Sayed', amount: 90, reason: 'Duplicate charge', status: 'PROCESSED', requestedAt: daysAgo(4) },
  { id: 'r-5003', paymentId: 'p-9012', userName: 'Yusuf Demir', amount: 130, reason: 'Booking mistake', status: 'REQUESTED', requestedAt: daysAgo(2) },
  { id: 'r-5004', paymentId: 'p-9016', userName: 'Noah Fischer', amount: 105, reason: 'Payment failed, wants alternative method', status: 'REQUESTED', requestedAt: hoursAgo(18) },
  { id: 'r-5005', paymentId: 'p-9002', userName: 'Marcus Reid', amount: 60, reason: 'Did not receive credits after 24h', status: 'REJECTED', requestedAt: daysAgo(6) },
];

export const seedSubscriptions: AdminSubscription[] = [
  { id: 'sub-01', userName: 'Acme Learning Inc', plan: 'Team', amount: 499, status: 'ACTIVE', renewsAt: daysAgo(-12), seats: 25 },
  { id: 'sub-02', userName: 'Brightpath Academy', plan: 'Business', amount: 1299, status: 'ACTIVE', renewsAt: daysAgo(-20), seats: 80 },
  { id: 'sub-03', userName: 'DevForge Studios', plan: 'Team', amount: 499, status: 'PAST_DUE', renewsAt: daysAgo(-3), seats: 18 },
  { id: 'sub-04', userName: 'Nimbus Corp', plan: 'Enterprise', amount: 3999, status: 'ACTIVE', renewsAt: daysAgo(-28), seats: 250 },
  { id: 'sub-05', userName: 'Solstice Labs', plan: 'Team', amount: 499, status: 'TRIAL', renewsAt: daysAgo(-5), seats: 10 },
  { id: 'sub-06', userName: 'Quill & Code', plan: 'Starter', amount: 149, status: 'CANCELLED', renewsAt: daysAgo(-40), seats: 5 },
];

export const seedCoupons: AdminCoupon[] = [
  { id: 'c-01', code: 'WELCOME20', type: 'PERCENT', value: 20, usageCount: 1842, usageLimit: 5000, expiresAt: daysAgo(-45), active: true },
  { id: 'c-02', code: 'SUMMER25', type: 'PERCENT', value: 25, usageCount: 940, usageLimit: 2000, expiresAt: daysAgo(-30), active: true },
  { id: 'c-03', code: 'TEAM50', type: 'FIXED', value: 50, usageCount: 212, usageLimit: 500, expiresAt: daysAgo(-60), active: true },
  { id: 'c-04', code: 'LAUNCH10', type: 'PERCENT', value: 10, usageCount: 3201, usageLimit: 10000, expiresAt: daysAgo(-90), active: false },
  { id: 'c-05', code: 'MENTOR100', type: 'FIXED', value: 100, usageCount: 88, usageLimit: 250, expiresAt: daysAgo(-15), active: true },
];

/* ============================================================
   Wallet
   ============================================================ */

export const seedWalletStats: WalletStats = {
  totalCreditsIssued: 1284000,
  creditsOutstanding: 384200,
  creditsUsed: 899800,
  rewardsDistributed: 184000,
  bonusesDistributed: 76000,
  refundsProcessed: 12480,
  averageBalance: 96,
};

export const seedWalletTransactions: AdminWalletTransaction[] = [
  { id: 'w-01', userName: 'Sarah Chen', type: 'CREDIT', category: 'PURCHASE', amount: 300, balance: 540, description: 'Credit pack — Pro 300', createdAt: daysAgo(8) },
  { id: 'w-02', userName: 'Liam O’Connor', type: 'CREDIT', category: 'SESSION', amount: 420, balance: 7900, description: 'Payout — Distributed Systems group', createdAt: hoursAgo(20) },
  { id: 'w-03', userName: 'Emma Wilson', type: 'DEBIT', category: 'WITHDRAWAL', amount: 2000, balance: 1650, description: 'Bank withdrawal', createdAt: daysAgo(2) },
  { id: 'w-04', userName: 'Amara Okafor', type: 'CREDIT', category: 'BONUS', amount: 50, balance: 470, description: 'Referral bonus — invite accepted', createdAt: daysAgo(3) },
  { id: 'w-05', userName: 'Ravi Patel', type: 'CREDIT', category: 'REWARD', amount: 25, balance: 5425, description: 'Mentor excellence reward', createdAt: daysAgo(4) },
  { id: 'w-06', userName: 'Mei Lin', type: 'DEBIT', category: 'SESSION', amount: 180, balance: 250, description: 'Session — Mock Interview', createdAt: daysAgo(5) },
  { id: 'w-07', userName: 'Chloe Martin', type: 'CREDIT', category: 'REFUND', amount: 100, balance: 400, description: 'Refund — session cancelled', createdAt: daysAgo(3) },
  { id: 'w-08', userName: 'Hiroshi Tanaka', type: 'CREDIT', category: 'PURCHASE', amount: 120, balance: 180, description: 'Credit pack — Starter 120', createdAt: daysAgo(6) },
  { id: 'w-09', userName: 'Hannah Kim', type: 'DEBIT', category: 'SESSION', amount: 90, balance: 640, description: 'Session — SQL for Analytics', createdAt: daysAgo(4) },
  { id: 'w-10', userName: 'Aisha Bello', type: 'CREDIT', category: 'REWARD', amount: 40, balance: 240, description: 'Learning streak reward', createdAt: daysAgo(7) },
  { id: 'w-11', userName: 'Isabella Costa', type: 'CREDIT', category: 'SESSION', amount: 105, balance: 4100, description: 'Payout — design systems session', createdAt: daysAgo(1) },
  { id: 'w-12', userName: 'Diego Fernández', type: 'DEBIT', category: 'SESSION', amount: 120, balance: 80, description: 'Session — Cloud Cost Optimization', createdAt: daysAgo(11) },
];

/* ============================================================
   Community moderation
   ============================================================ */

export const seedModerationQueue: ModerationQueueItem[] = [
  { id: 'mod-01', targetType: 'POST', content: 'Buy cheap followers now!!! link in bio', author: 'Fatima Al-Sayed', reason: 'SPAM', status: 'PENDING', reportedAt: hoursAgo(1), reports: 12, risk: 'HIGH' },
  { id: 'mod-02', targetType: 'COMMENT', content: 'You are completely wrong and your advice is terrible.', author: 'Marcus Reid', reason: 'HARASSMENT', status: 'PENDING', reportedAt: hoursAgo(3), reports: 4, risk: 'MEDIUM' },
  { id: 'mod-03', targetType: 'POST', content: 'Free money giveaway — send your wallet address to claim', author: 'Unknown User', reason: 'SCAM', status: 'PENDING', reportedAt: hoursAgo(6), reports: 21, risk: 'HIGH' },
  { id: 'mod-04', targetType: 'REVIEW', content: 'Terrible mentor, do not book. Scam.', author: 'Anonymous', reason: 'ABUSE', status: 'PENDING', reportedAt: hoursAgo(9), reports: 2, risk: 'LOW' },
  { id: 'mod-05', targetType: 'COMMUNITY', content: 'Community named with offensive term', author: 'Unknown User', reason: 'INAPPROPRIATE', status: 'PENDING', reportedAt: hoursAgo(14), reports: 7, risk: 'HIGH' },
  { id: 'mod-06', targetType: 'POLL', content: 'Which is better: platform A or platform B? (referral links)', author: 'Noah Fischer', reason: 'PROMOTION', status: 'PENDING', reportedAt: hoursAgo(20), reports: 1, risk: 'LOW' },
  { id: 'mod-07', targetType: 'COMMENT', content: 'Sharing copyrighted course material, DM for access', author: 'Yusuf Demir', reason: 'COPYRIGHT', status: 'PENDING', reportedAt: daysAgo(1), reports: 9, risk: 'MEDIUM' },
];

export const seedCommunityPosts: AdminCommunityPost[] = [
  { id: 'cp-01', title: 'Just finished my system design journey — AMA', community: 'System Design', author: 'Sarah Chen', status: 'PINNED', likes: 482, comments: 96, shares: 41, createdAt: daysAgo(2) },
  { id: 'cp-02', title: 'Weekly AWS study group — week 12', community: 'Cloud Engineering', author: 'Alex Rivera', status: 'PUBLISHED', likes: 310, comments: 74, shares: 22, createdAt: daysAgo(1) },
  { id: 'cp-03', title: 'How I landed 3 offers after 4 months', community: 'Career Growth', author: 'Mei Lin', status: 'PUBLISHED', likes: 1240, comments: 210, shares: 180, createdAt: daysAgo(1) },
  { id: 'cp-04', title: 'React 19 patterns worth adopting', community: 'Frontend', author: 'Emma Wilson', status: 'PUBLISHED', likes: 890, comments: 143, shares: 96, createdAt: hoursAgo(10) },
  { id: 'cp-05', title: 'Buy cheap followers now!!!', community: 'General', author: 'Fatima Al-Sayed', status: 'REPORTED', likes: 0, comments: 4, shares: 0, createdAt: hoursAgo(2) },
  { id: 'cp-06', title: 'System design mock interviews — free slots', community: 'System Design', author: 'Hannah Park', status: 'HIDDEN', likes: 56, comments: 12, shares: 8, createdAt: daysAgo(4) },
  { id: 'cp-07', title: 'Book recommendations for distributed systems', community: 'Backend', author: 'Liam O’Connor', status: 'PUBLISHED', likes: 415, comments: 88, shares: 30, createdAt: daysAgo(3) },
  { id: 'cp-08', title: 'Data engineering roadmap v2', community: 'Data & AI', author: 'Ravi Patel', status: 'PUBLISHED', likes: 720, comments: 132, shares: 110, createdAt: daysAgo(5) },
  { id: 'cp-09', title: 'Community guidelines update — please read', community: 'Announcements', author: 'Kenji Nakamura', status: 'PINNED', likes: 204, comments: 38, shares: 12, createdAt: daysAgo(7) },
];

export const seedCommunities: AdminCommunity[] = [
  { id: 'c-01', name: 'System Design', category: 'Engineering', members: 12840, posts: 3420, moderators: 6, status: 'ACTIVE', createdAt: daysAgo(400) },
  { id: 'c-02', name: 'Cloud Engineering', category: 'Engineering', members: 9840, posts: 2640, moderators: 4, status: 'ACTIVE', createdAt: daysAgo(360) },
  { id: 'c-03', name: 'Frontend', category: 'Engineering', members: 14210, posts: 4120, moderators: 5, status: 'ACTIVE', createdAt: daysAgo(380) },
  { id: 'c-04', name: 'Data & AI', category: 'Engineering', members: 7620, posts: 1980, moderators: 3, status: 'ACTIVE', createdAt: daysAgo(300) },
  { id: 'c-05', name: 'Career Growth', category: 'Career', members: 18840, posts: 5230, moderators: 7, status: 'ACTIVE', createdAt: daysAgo(420) },
  { id: 'c-06', name: 'Interview Prep', category: 'Career', members: 15220, posts: 4610, moderators: 5, status: 'ACTIVE', createdAt: daysAgo(390) },
  { id: 'c-07', name: 'Side Hustles', category: 'General', members: 6420, posts: 1840, moderators: 2, status: 'RESTRICTED', createdAt: daysAgo(200) },
];

export const seedPolls: AdminPoll[] = [
  { id: 'poll-01', question: 'Which topic should we cover next week?', community: 'System Design', votes: 842, options: 4, status: 'OPEN', endsAt: daysAgo(-2) },
  { id: 'poll-02', question: 'Preferred session length?', community: 'Career Growth', votes: 1204, options: 3, status: 'OPEN', endsAt: daysAgo(-4) },
  { id: 'poll-03', question: 'Should we add a project review track?', community: 'Frontend', votes: 634, options: 2, status: 'CLOSED', endsAt: daysAgo(-8) },
  { id: 'poll-04', question: 'Best time for live workshops?', community: 'Data & AI', votes: 410, options: 5, status: 'CLOSED', endsAt: daysAgo(-12) },
];

/* ============================================================
   Review moderation
   ============================================================ */

export const seedModerationReviews: ModerationReview[] = [
  { id: 'rv-01', mentorName: 'Alex Rivera', learnerName: 'Sarah Chen', rating: 5, content: 'Incredible depth on scaling APIs. The trade-off analysis walkthrough was the highlight of my prep.', status: 'APPROVED', helpfulVotes: 42, reported: false, createdAt: hoursAgo(6) },
  { id: 'rv-02', mentorName: 'Emma Wilson', learnerName: 'Chloe Martin', rating: 4, content: 'Very knowledgeable, pacing was slightly fast for beginners but packed with value.', status: 'PENDING', helpfulVotes: 12, reported: false, createdAt: hoursAgo(8) },
  { id: 'rv-03', mentorName: 'Liam O’Connor', learnerName: 'Mei Lin', rating: 1, content: 'Terrible mentor, do not book. Scam.', status: 'PENDING', helpfulVotes: 0, reported: true, reportReason: 'ABUSE', createdAt: hoursAgo(10) },
  { id: 'rv-04', mentorName: 'Ravi Patel', learnerName: 'Hiroshi Tanaka', rating: 5, content: 'Clear explanations, great resources shared for practice.', status: 'PENDING', helpfulVotes: 8, reported: false, createdAt: hoursAgo(14) },
  { id: 'rv-05', mentorName: 'Hannah Park', learnerName: 'Aisha Bello', rating: 5, content: 'Life-changing career advice. Landed my first offer 6 weeks later!', status: 'APPROVED', helpfulVotes: 76, reported: false, createdAt: daysAgo(1) },
  { id: 'rv-06', mentorName: 'Alex Rivera', learnerName: 'Oliver Berg', rating: 2, content: 'Late to both sessions, rescheduled twice. Communication was poor.', status: 'PENDING', helpfulVotes: 3, reported: false, createdAt: daysAgo(1) },
  { id: 'rv-07', mentorName: 'Tomas Silva', learnerName: 'Noah Fischer', rating: 4, content: 'Good Flutter fundamentals course.', status: 'PENDING', helpfulVotes: 2, reported: true, reportReason: 'SUSPICIOUS', createdAt: daysAgo(2) },
  { id: 'rv-08', mentorName: 'Grace Lee', learnerName: 'Sofia Rossi', rating: 5, content: 'Best accessibility guidance I have received. Extremely thorough.', status: 'APPROVED', helpfulVotes: 31, reported: false, createdAt: daysAgo(2) },
];

export const seedReviewAnalytics: ReviewModerationAnalytics = {
  totalReviews: 31420,
  pending: 96,
  approved: 30820,
  rejected: 504,
  reported: 17,
  averageRating: 4.7,
  helpfulVotes: 128400,
  ratingsDistribution: { '1': 412, '2': 938, '3': 2840, '4': 9180, '5': 18050 },
};

/* ============================================================
   Support center
   ============================================================ */

export const seedTickets: SupportTicket[] = [
  {
    id: 't-10291', userId: 'u-1003', userName: 'Marcus Reid', subject: 'Unable to book session with mentor',
    description: 'I keep getting an error when trying to book a session. The payment screen shows "card declined" but my bank confirmed the charge went through.',
    category: 'technical', priority: 'HIGH', status: 'OPEN', createdAt: hoursAgo(2), updatedAt: hoursAgo(1), replies: [
      { id: 'r1', senderName: 'Marcus Reid', senderType: 'USER', message: 'Any update on this? I have a session in 2 hours.', internal: false, createdAt: hoursAgo(1) },
    ],
  },
  {
    id: 't-10292', userId: 'u-1016', userName: 'Nina Kowalski', subject: 'Request refund for cancelled session',
    description: 'My mentor cancelled the session 10 minutes before start. I would like a refund to my original payment method.',
    category: 'billing', priority: 'MEDIUM', status: 'IN_PROGRESS', assignedTo: 'Kenji Nakamura', assignedAt: hoursAgo(3), createdAt: hoursAgo(6), updatedAt: hoursAgo(3), replies: [
      { id: 'r1', senderName: 'Kenji Nakamura', senderType: 'ADMIN', message: 'Hi Nina, sorry for the inconvenience. I have flagged the session for automatic refund — expect it within 48 hours.', internal: false, createdAt: hoursAgo(3) },
      { id: 'r2', senderName: 'System', senderType: 'SYSTEM', message: 'Refund request created (r-5003).', internal: true, createdAt: hoursAgo(3) },
    ],
  },
  {
    id: 't-10293', userId: 'u-1018', userName: 'Hannah Kim', subject: 'Credits not added after payment',
    description: 'Paid for the Pro pack an hour ago but my wallet balance has not changed.',
    category: 'wallet', priority: 'CRITICAL', status: 'RESOLVED', assignedTo: 'Gabriel Costa', assignedAt: hoursAgo(8), resolvedAt: hoursAgo(4), resolutionNotes: 'Manual credit applied, transaction replayed.', createdAt: hoursAgo(10), updatedAt: hoursAgo(4), replies: [
      { id: 'r1', senderName: 'Gabriel Costa', senderType: 'ADMIN', message: 'We found the payment webhook was delayed. Your 300 credits have been added manually. Sorry for the delay!', internal: false, createdAt: hoursAgo(4) },
    ],
  },
  {
    id: 't-10294', userId: 'u-1012', userName: 'Amara Okafor', subject: 'Mentor profile verification status',
    description: 'I applied to become a mentor 3 weeks ago and my application is still pending. When will it be reviewed?',
    category: 'mentor', priority: 'LOW', status: 'OPEN', createdAt: daysAgo(1), updatedAt: hoursAgo(12), replies: [],
  },
  {
    id: 't-10295', userId: 'u-1021', userName: 'Noah Fischer', subject: 'Cannot join meeting room',
    description: 'The join button is greyed out. My browser shows a camera permission warning.',
    category: 'meeting', priority: 'MEDIUM', status: 'IN_PROGRESS', assignedTo: 'Kenji Nakamura', assignedAt: hoursAgo(6), createdAt: hoursAgo(9), updatedAt: hoursAgo(6), replies: [
      { id: 'r1', senderName: 'Kenji Nakamura', senderType: 'ADMIN', message: 'Please check your browser settings — allow camera access for skillinfinity.com and retry. Let me know if it persists.', internal: false, createdAt: hoursAgo(6) },
    ],
  },
  {
    id: 't-10296', userId: 'u-1008', userName: 'Fatima Al-Sayed', subject: 'Account wrongly suspended',
    description: 'My account was suspended without any warning email. I believe this is a mistake.',
    category: 'account', priority: 'HIGH', status: 'CLOSED', resolvedAt: daysAgo(2), resolutionNotes: 'Suspension upheld after review (spam activity detected).', createdAt: daysAgo(3), updatedAt: daysAgo(2), replies: [
      { id: 'r1', senderName: 'Gabriel Costa', senderType: 'ADMIN', message: 'After review we confirmed multiple spam reports. The suspension stands. You may appeal via this ticket.', internal: false, createdAt: daysAgo(2) },
    ],
  },
];

/* ============================================================
   Announcements
   ============================================================ */

export const seedAnnouncements: SystemAnnouncement[] = [
  { id: 'a-01', title: 'Scheduled Maintenance — Saturday 02:00 UTC', content: 'The platform will be briefly unavailable on Saturday from 02:00–02:30 UTC for infrastructure upgrades. Bookings and meetings will be paused during this window.', announcementType: 'MAINTENANCE', targetRole: 'ALL', priority: 'HIGH', status: 'SCHEDULED', scheduledAt: hoursAgo(-28), createdAt: daysAgo(2), author: 'Kenji Nakamura' },
  { id: 'a-02', title: 'New AI-powered review summaries are live', content: 'Mentors can now see AI-generated summaries of their reviews. Rollout is gradual — 25% of mentors this week.', announcementType: 'FEATURE', targetRole: 'ROLE_MENTOR', priority: 'MEDIUM', status: 'PUBLISHED', publishedAt: daysAgo(1), expiresAt: daysAgo(-14), createdAt: daysAgo(1), author: 'Gabriel Costa' },
  { id: 'a-03', title: 'Updated community guidelines', content: 'Please review the refreshed community guidelines covering AI-generated content, promotions and respectful conduct.', announcementType: 'POLICY', targetRole: 'ALL', priority: 'MEDIUM', status: 'PUBLISHED', publishedAt: daysAgo(3), createdAt: daysAgo(3), author: 'Kenji Nakamura' },
  { id: 'a-04', title: 'Q3 Pricing Update Draft', content: 'Draft announcement for the Q3 pricing update — review before publishing.', announcementType: 'PRODUCT', targetRole: 'ALL', priority: 'LOW', status: 'DRAFT', createdAt: daysAgo(5), author: 'Gabriel Costa' },
];

export const seedAnnouncementTemplates: AnnouncementTemplate[] = [
  { id: 'tmp-01', name: 'Maintenance Window', description: 'Notify users about scheduled downtime', type: 'MAINTENANCE', title: 'Scheduled Maintenance', content: 'We will be performing scheduled maintenance on {date} from {start}–{end} UTC. The platform may be briefly unavailable.', priority: 'HIGH', targetRole: 'ALL' },
  { id: 'tmp-02', name: 'New Feature Launch', description: 'Announce a newly shipped feature', type: 'FEATURE', title: 'Introducing {feature}', content: 'We are excited to announce {feature}. {description}. Available now for {audience}.', priority: 'MEDIUM', targetRole: 'ALL' },
  { id: 'tmp-03', name: 'Policy Update', description: 'Communicate guideline changes', type: 'POLICY', title: 'Updated {policy}', content: 'Our {policy} has been updated. Key changes: {changes}. These take effect on {effectiveDate}.', priority: 'MEDIUM', targetRole: 'ALL' },
  { id: 'tmp-04', name: 'Incident Report', description: 'Post-incident transparency note', type: 'INCIDENT', title: 'Incident Report: {incident}', content: 'We experienced {impact} between {start} and {end}. Root cause: {cause}. Fix: {fix}.', priority: 'URGENT', targetRole: 'ALL' },
];

/* ============================================================
   Reports
   ============================================================ */

export const seedReportDefinitions: ReportDefinition[] = [
  { id: 'REVENUE', title: 'Revenue Report', description: 'Monthly, quarterly and annual revenue with payment method and refund breakdowns.', category: 'Finance', lastGeneratedAt: daysAgo(1), downloadCount: 142, icon: '💰' },
  { id: 'USERS', title: 'User Report', description: 'Sign-ups, activation, retention cohorts and role distribution.', category: 'Growth', lastGeneratedAt: daysAgo(2), downloadCount: 98, icon: '👥' },
  { id: 'MENTORS', title: 'Mentor Report', description: 'Approval funnel, performance, ratings, revenue and availability.', category: 'Marketplace', lastGeneratedAt: daysAgo(1), downloadCount: 76, icon: '🎓' },
  { id: 'SESSIONS', title: 'Session Report', description: 'Completion rates, durations, cancellations and reschedules.', category: 'Operations', lastGeneratedAt: daysAgo(3), downloadCount: 64, icon: '📅' },
  { id: 'COMMUNITY', title: 'Community Report', description: 'Communities, posts, engagement and moderation outcomes.', category: 'Engagement', lastGeneratedAt: daysAgo(4), downloadCount: 41, icon: '💬' },
  { id: 'REVIEWS', title: 'Review Report', description: 'Review volume, ratings distribution and moderation funnel.', category: 'Quality', lastGeneratedAt: daysAgo(2), downloadCount: 53, icon: '⭐' },
  { id: 'WALLET', title: 'Wallet Report', description: 'Credits issued, outstanding balances, rewards and payouts.', category: 'Finance', lastGeneratedAt: daysAgo(5), downloadCount: 38, icon: '👛' },
  { id: 'SUPPORT', title: 'Support Report', description: 'Ticket volume, first response time, resolution time and CSAT.', category: 'Operations', lastGeneratedAt: daysAgo(1), downloadCount: 59, icon: '🎧' },
];

/* ============================================================
   Platform settings
   ============================================================ */

export const seedSettings: PlatformSetting[] = [
  { id: 'set-01', settingKey: 'platform.name', settingValue: 'Skill Infinity', dataType: 'STRING', description: 'Public platform name', category: 'platform', encrypted: false, active: true, updatedAt: daysAgo(30) },
  { id: 'set-02', settingKey: 'platform.maintenance_mode', settingValue: 'false', dataType: 'BOOLEAN', description: 'Put the platform into maintenance mode (read-only banner)', category: 'platform', encrypted: false, active: true, updatedAt: hoursAgo(6) },
  { id: 'set-03', settingKey: 'auth.jwt_expiry_minutes', settingValue: '30', dataType: 'NUMBER', description: 'Access token lifetime in minutes', category: 'authentication', encrypted: false, active: true, updatedAt: daysAgo(10) },
  { id: 'set-04', settingKey: 'auth.refresh_token_expiry_days', settingValue: '14', dataType: 'NUMBER', description: 'Refresh token lifetime in days', category: 'authentication', encrypted: false, active: true, updatedAt: daysAgo(10) },
  { id: 'set-05', settingKey: 'auth.max_login_attempts', settingValue: '5', dataType: 'NUMBER', description: 'Lockout threshold before temporary ban', category: 'authentication', encrypted: false, active: true, updatedAt: daysAgo(20) },
  { id: 'set-06', settingKey: 'registration.policy', settingValue: 'OPEN_WITH_REVIEW', dataType: 'SELECT', description: 'Registration policy: OPEN, OPEN_WITH_REVIEW, INVITE_ONLY', category: 'registration', encrypted: false, active: true, updatedAt: daysAgo(1) },
  { id: 'set-07', settingKey: 'registration.email_verification_required', settingValue: 'true', dataType: 'BOOLEAN', description: 'Require email verification before login', category: 'registration', encrypted: false, active: true, updatedAt: daysAgo(20) },
  { id: 'set-08', settingKey: 'payments.currency', settingValue: 'USD', dataType: 'STRING', description: 'Default currency for all transactions', category: 'payments', encrypted: false, active: true, updatedAt: daysAgo(60) },
  { id: 'set-09', settingKey: 'payments.platform_fee_percent', settingValue: '10', dataType: 'NUMBER', description: 'Platform commission on mentor payouts', category: 'payments', encrypted: false, active: true, updatedAt: daysAgo(45) },
  { id: 'set-10', settingKey: 'payments.min_withdrawal', settingValue: '20', dataType: 'NUMBER', description: 'Minimum wallet withdrawal amount', category: 'payments', encrypted: false, active: true, updatedAt: daysAgo(45) },
  { id: 'set-11', settingKey: 'payments.stripe_webhook_secret', settingValue: '••••••••••••••••', dataType: 'STRING', description: 'Stripe webhook signing secret', category: 'payments', encrypted: true, active: true, updatedAt: daysAgo(2) },
  { id: 'set-12', settingKey: 'wallet.bonus_percentage', settingValue: '10', dataType: 'NUMBER', description: 'Bonus credits granted on purchases above $50', category: 'wallet', encrypted: false, active: true, updatedAt: daysAgo(30) },
  { id: 'set-13', settingKey: 'wallet.referral_reward', settingValue: '50', dataType: 'NUMBER', description: 'Credits awarded for successful referrals', category: 'wallet', encrypted: false, active: true, updatedAt: daysAgo(30) },
  { id: 'set-14', settingKey: 'notifications.email_enabled', settingValue: 'true', dataType: 'BOOLEAN', description: 'Send transactional email notifications', category: 'notifications', encrypted: false, active: true, updatedAt: daysAgo(15) },
  { id: 'set-15', settingKey: 'community.auto_moderation', settingValue: 'true', dataType: 'BOOLEAN', description: 'AI-assisted moderation of posts and comments', category: 'community', encrypted: false, active: true, updatedAt: daysAgo(3) },
  { id: 'set-16', settingKey: 'community.post_approval', settingValue: 'false', dataType: 'BOOLEAN', description: 'Require moderation approval before posts publish', category: 'community', encrypted: false, active: true, updatedAt: daysAgo(8) },
  { id: 'set-17', settingKey: 'mentors.min_hourly_rate', settingValue: '20', dataType: 'NUMBER', description: 'Minimum hourly rate for mentors', category: 'mentors', encrypted: false, active: true, updatedAt: daysAgo(40) },
  { id: 'set-18', settingKey: 'mentors.verification_required', settingValue: 'true', dataType: 'BOOLEAN', description: 'Require certificate verification for new mentors', category: 'mentors', encrypted: false, active: true, updatedAt: daysAgo(40) },
  { id: 'set-19', settingKey: 'sessions.max_duration_minutes', settingValue: '240', dataType: 'NUMBER', description: 'Maximum bookable session duration', category: 'sessions', encrypted: false, active: true, updatedAt: daysAgo(50) },
  { id: 'set-20', settingKey: 'sessions.cancellation_window_hours', settingValue: '24', dataType: 'NUMBER', description: 'Hours before session for free cancellation', category: 'sessions', encrypted: false, active: true, updatedAt: daysAgo(50) },
];

/* ============================================================
   Feature flags
   ============================================================ */

export const seedFeatureFlags: FeatureFlag[] = [
  { id: 'ff-01', featureKey: 'ai_review_moderation', featureName: 'AI Review Moderation', description: 'AI-powered triage and summarization of mentor reviews', enabled: true, rolloutPercentage: 25, environment: 'production', active: true, updatedAt: hoursAgo(5) },
  { id: 'ff-02', featureKey: 'meeting_recording', featureName: 'Meeting Recording', description: 'Cloud recording for 1:1 and group sessions', enabled: true, rolloutPercentage: 100, environment: 'production', active: true, updatedAt: daysAgo(4) },
  { id: 'ff-03', featureKey: 'wallet_rewards', featureName: 'Wallet Rewards & Streaks', description: 'Learning streak rewards and referral bonuses', enabled: true, rolloutPercentage: 60, environment: 'production', active: true, updatedAt: daysAgo(6) },
  { id: 'ff-04', featureKey: 'group_mentorship', featureName: 'Group Mentorship', description: 'Multi-learner group sessions and workshops', enabled: true, rolloutPercentage: 100, environment: 'production', active: true, updatedAt: daysAgo(12) },
  { id: 'ff-05', featureKey: 'new_onboarding', featureName: 'New Onboarding Flow', description: 'Redesigned first-run experience with guided tour', enabled: false, rolloutPercentage: 0, environment: 'staging', active: true, updatedAt: daysAgo(2) },
  { id: 'ff-06', featureKey: 'subscriptions', featureName: 'Subscription Plans', description: 'Recurring team & business subscription billing', enabled: true, rolloutPercentage: 40, environment: 'production', active: true, updatedAt: daysAgo(3) },
  { id: 'ff-07', featureKey: 'command_palette', featureName: 'Command Palette', description: 'Global Ctrl+K quick navigation', enabled: true, rolloutPercentage: 100, environment: 'production', active: true, updatedAt: daysAgo(8) },
  { id: 'ff-08', featureKey: 'dark_mode', featureName: 'Dark Mode', description: 'Theme toggle with system detection', enabled: true, rolloutPercentage: 100, environment: 'production', active: true, updatedAt: daysAgo(30) },
];

/* ============================================================
   Audit logs
   ============================================================ */

export const seedAuditLogs: AuditLog[] = [
  { id: 'log-01', adminName: 'Kenji Nakamura', action: 'MENTOR_APPROVED', entityType: 'MENTOR', entityId: 'm-a1', description: 'Approved mentor application for Oliver Berg', category: 'ADMIN', ipAddress: '103.21.44.10', createdAt: hoursAgo(1), newValue: 'APPROVED', previousValue: 'PENDING' },
  { id: 'log-02', adminName: 'Gabriel Costa', action: 'USER_SUSPENDED', entityType: 'USER', entityId: 'u-1004', description: 'Suspended user for repeated policy violations', category: 'MODERATION', ipAddress: '103.21.44.11', createdAt: hoursAgo(3), newValue: 'SUSPENDED', previousValue: 'ACTIVE' },
  { id: 'log-03', adminName: 'Kenji Nakamura', action: 'REFUND_APPROVED', entityType: 'PAYMENT', entityId: 'p-9012', description: 'Approved refund request of $130.00', category: 'PAYMENT', ipAddress: '103.21.44.10', createdAt: hoursAgo(5), newValue: 'PROCESSED', previousValue: 'REQUESTED' },
  { id: 'log-04', adminName: 'System', action: 'LOGIN', entityType: 'AUTH', entityId: 'u-1011', description: 'Admin console login from new device', category: 'AUTH', ipAddress: '103.21.44.10', createdAt: hoursAgo(7) },
  { id: 'log-05', adminName: 'Gabriel Costa', action: 'SETTING_UPDATED', entityType: 'SETTING', entityId: 'set-06', description: 'Registration policy changed to OPEN_WITH_REVIEW', category: 'SETTINGS', ipAddress: '103.21.44.11', createdAt: hoursAgo(9), newValue: 'OPEN_WITH_REVIEW', previousValue: 'OPEN' },
  { id: 'log-06', adminName: 'Kenji Nakamura', action: 'FLAG_UPDATED', entityType: 'FEATURE_FLAG', entityId: 'ff-01', description: 'AI review moderation rollout increased to 25%', category: 'ADMIN', ipAddress: '103.21.44.10', createdAt: hoursAgo(12), newValue: '25%', previousValue: '10%' },
  { id: 'log-07', adminName: 'Gabriel Costa', action: 'ROLE_CHANGED', entityType: 'USER', entityId: 'u-1013', description: 'Promoted user to moderator role', category: 'ROLE', ipAddress: '103.21.44.11', createdAt: daysAgo(1), newValue: 'MODERATOR', previousValue: 'LEARNER' },
  { id: 'log-08', adminName: 'Kenji Nakamura', action: 'CONTENT_REMOVED', entityType: 'POST', entityId: 'cp-05', description: 'Removed spam post from General community', category: 'MODERATION', ipAddress: '103.21.44.10', createdAt: daysAgo(1) },
  { id: 'log-09', adminName: 'System', action: 'BACKUP_COMPLETED', entityType: 'SYSTEM', entityId: 'db-prod-01', description: 'Automated database backup completed successfully', category: 'SYSTEM', ipAddress: '10.0.4.2', createdAt: daysAgo(1) },
  { id: 'log-10', adminName: 'Gabriel Costa', action: 'ANNOUNCEMENT_PUBLISHED', entityType: 'ANNOUNCEMENT', entityId: 'a-02', description: 'Published feature announcement for AI summaries', category: 'ADMIN', ipAddress: '103.21.44.11', createdAt: daysAgo(2) },
  { id: 'log-11', adminName: 'Kenji Nakamura', action: 'TICKET_RESOLVED', entityType: 'SUPPORT_TICKET', entityId: 't-10293', description: 'Resolved critical credits-not-credited ticket', category: 'ADMIN', ipAddress: '103.21.44.10', createdAt: daysAgo(2) },
  { id: 'log-12', adminName: 'Gabriel Costa', action: 'USER_REACTIVATED', entityType: 'USER', entityId: 'u-1021', description: 'Reactivated account after successful appeal', category: 'MODERATION', ipAddress: '103.21.44.11', createdAt: daysAgo(3), newValue: 'ACTIVE', previousValue: 'SUSPENDED' },
];

/* ============================================================
   System monitoring
   ============================================================ */

const latencySeries = [
  { label: '00:00', value: 72 }, { label: '02:00', value: 65 }, { label: '04:00', value: 61 },
  { label: '06:00', value: 78 }, { label: '08:00', value: 118 }, { label: '10:00', value: 134 },
  { label: '12:00', value: 142 }, { label: '14:00', value: 128 }, { label: '16:00', value: 121 },
  { label: '18:00', value: 138 }, { label: '20:00', value: 112 }, { label: '22:00', value: 84 },
];

const requestVolume = [
  { label: '00:00', value: 420 }, { label: '02:00', value: 310 }, { label: '04:00', value: 280 },
  { label: '06:00', value: 520 }, { label: '08:00', value: 1420 }, { label: '10:00', value: 1890 },
  { label: '12:00', value: 2040 }, { label: '14:00', value: 1760 }, { label: '16:00', value: 1930 },
  { label: '18:00', value: 1650 }, { label: '20:00', value: 1120 }, { label: '22:00', value: 640 },
];

const errorRateSeries = [
  { label: '00:00', value: 0.4 }, { label: '02:00', value: 0.2 }, { label: '04:00', value: 0.3 },
  { label: '06:00', value: 0.5 }, { label: '08:00', value: 1.1 }, { label: '10:00', value: 0.9 },
  { label: '12:00', value: 1.4 }, { label: '14:00', value: 1.2 }, { label: '16:00', value: 1.0 },
  { label: '18:00', value: 1.3 }, { label: '20:00', value: 0.8 }, { label: '22:00', value: 0.5 },
];

export const seedSystemMetrics: SystemMetrics = {
  apiStatus: 'UP',
  database: 'UP',
  redis: 'UP',
  rabbitmq: 'DEGRADED',
  minio: 'UP',
  cpuUsage: 42,
  memoryUsage: 68,
  storageUsage: 57,
  responseTimeMs: 84,
  errorRate: 0.9,
  requestsPerMinute: 1890,
  activeSockets: 342,
  latencySeries,
  requestVolume,
  errorRateSeries,
};

export const seedServices: MonitoredService[] = [
  { name: 'api-gateway', description: 'Edge routing & auth', status: 'UP', latencyMs: 28, errorRate: 0.2, uptime: 99.99, cpu: 22, memory: 38 },
  { name: 'identity-service', description: 'Auth, roles & tokens', status: 'UP', latencyMs: 42, errorRate: 0.3, uptime: 99.99, cpu: 18, memory: 34 },
  { name: 'user-service', description: 'Profiles & portfolios', status: 'UP', latencyMs: 51, errorRate: 0.4, uptime: 99.98, cpu: 25, memory: 41 },
  { name: 'mentor-service', description: 'Marketplace & pricing', status: 'UP', latencyMs: 64, errorRate: 0.5, uptime: 99.97, cpu: 31, memory: 46 },
  { name: 'session-service', description: 'Bookings & timelines', status: 'UP', latencyMs: 58, errorRate: 0.6, uptime: 99.96, cpu: 27, memory: 43 },
  { name: 'payment-service', description: 'Payments & invoices', status: 'UP', latencyMs: 132, errorRate: 1.1, uptime: 99.92, cpu: 38, memory: 52 },
  { name: 'wallet-service', description: 'Credits & ledger', status: 'UP', latencyMs: 71, errorRate: 0.7, uptime: 99.95, cpu: 29, memory: 44 },
  { name: 'community-service', description: 'Posts, comments, polls', status: 'DEGRADED', latencyMs: 214, errorRate: 3.2, uptime: 99.71, cpu: 74, memory: 81 },
  { name: 'review-service', description: 'Ratings & moderation', status: 'UP', latencyMs: 66, errorRate: 0.8, uptime: 99.94, cpu: 26, memory: 40 },
  { name: 'communication-service', description: 'Chat & presence', status: 'UP', latencyMs: 48, errorRate: 0.4, uptime: 99.98, cpu: 21, memory: 37 },
  { name: 'admin-service', description: 'Console & analytics', status: 'UP', latencyMs: 54, errorRate: 0.5, uptime: 99.97, cpu: 24, memory: 39 },
  { name: 'meeting-service', description: 'WebRTC & signaling', status: 'UP', latencyMs: 44, errorRate: 0.9, uptime: 99.95, cpu: 33, memory: 58 },
];
