/**
 * Admin Portal domain types.
 *
 * These mirror the admin-service DTOs (DashboardResponse, AnalyticsResponse,
 * AdminUserResponse, AuditLogResponse, PlatformSetting, FeatureFlag,
 * SystemAnnouncement, SupportTicket, ReportedContent) and add richer frontend
 * shapes used by the admin console and premium widgets.
 */

/* ============================================================
   Dashboard
   ============================================================ */

export interface DashboardUserStats {
  totalUsers: number;
  totalMentors: number;
  totalLearners: number;
  activeUsersToday: number;
  dailyRegistrations: number;
}

export interface DashboardMentorStats {
  totalMentors: number;
  approvedMentors: number;
  pendingApprovals: number;
  suspendedMentors: number;
}

export interface DashboardSessionStats {
  totalSessions: number;
  completedSessions: number;
  activeSessions: number;
  cancelledSessions: number;
}

export interface DashboardRevenueStats {
  totalRevenue: number;
  totalPayments: number;
  pendingPayouts: number;
  monthlyRevenue: number;
}

export interface DashboardCommunityStats {
  totalCommunities: number;
  totalPosts: number;
  totalComments: number;
  reportedContents: number;
}

export interface DashboardReviewStats {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  reportedReviews: number;
}

export interface AdminActivityItem {
  action: string;
  description: string;
  timestamp: string;
}

export interface SystemHealth {
  status: 'UP' | 'DEGRADED' | 'DOWN';
  activeServices: number;
  totalServices: number;
  averageResponseTime: number;
  uptime: number;
}

export interface AdminDashboard {
  userStats: DashboardUserStats;
  mentorStats: DashboardMentorStats;
  sessionStats: DashboardSessionStats;
  revenueStats: DashboardRevenueStats;
  communityStats: DashboardCommunityStats;
  reviewStats: DashboardReviewStats;
  recentActivities: AdminActivityItem[];
  systemHealth: SystemHealth;
}

/* ============================================================
   Analytics
   ============================================================ */

export interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  averageTransactionValue: number;
  revenueByMonth: Record<string, number>;
}

export interface GrowthAnalytics {
  userGrowthRate: number;
  mentorGrowthRate: number;
  sessionGrowthRate: number;
  revenueGrowthRate: number;
  registrationsByDay: Record<string, number>;
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
}

export interface SessionAnalytics {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  averageSessionDuration: number;
  sessionsToday: number;
  sessionsByStatus: Record<string, number>;
}

export interface EngagementAnalytics {
  averageRating: number;
  totalReviews: number;
  totalPosts: number;
  totalComments: number;
  mentorResponseRate: number;
}

export interface AdminAnalytics {
  revenue: RevenueAnalytics;
  growth: GrowthAnalytics;
  users: UserAnalytics;
  sessions: SessionAnalytics;
  engagement: EngagementAnalytics;
}

/* ============================================================
   Users & mentors
   ============================================================ */

export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'BANNED';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ROLE_LEARNER' | 'ROLE_MENTOR' | 'ROLE_ADMIN' | 'ROLE_USER';
  status: AdminUserStatus;
  joinedAt: string;
  lastActiveAt: string;
  sessionsCompleted: number;
  totalSpend: number;
  walletBalance: number;
  country?: string;
}

export interface MentorApproval {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  yearsExperience: number;
  requestedAt: string;
  verificationScore: number;
  certificates: string[];
  bio: string;
  hourlyRate: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface AdminMentor {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  verified: boolean;
  rating: number;
  reviewCount: number;
  sessionsCompleted: number;
  revenue: number;
  hourlyRate: number;
  expertise: string[];
  responseRate: number;
  joinedAt: string;
  lastActiveAt: string;
  certificates: number;
}

/* ============================================================
   Sessions
   ============================================================ */

export type AdminSessionStatus =
  | 'SCHEDULED'
  | 'LIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'RESCHEDULED';

export interface AdminSession {
  id: string;
  title: string;
  mentorName: string;
  learnerName: string;
  status: AdminSessionStatus;
  startAt: string;
  durationMinutes: number;
  revenue: number;
  type: '1:1' | 'GROUP' | 'WORKSHOP';
  timezone?: string;
}

/* ============================================================
   Payments & wallet
   ============================================================ */

export type AdminPaymentStatus = 'SUCCEEDED' | 'PENDING' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type AdminPaymentMethod = 'CARD' | 'PAYPAL' | 'WALLET' | 'BANK';

export interface AdminPayment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  status: AdminPaymentStatus;
  method: AdminPaymentMethod;
  description: string;
  createdAt: string;
  fee: number;
}

export interface AdminRefund {
  id: string;
  paymentId: string;
  userName: string;
  amount: number;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  requestedAt: string;
}

export interface AdminSubscription {
  id: string;
  userName: string;
  plan: string;
  amount: number;
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIAL';
  renewsAt: string;
  seats: number;
}

export interface AdminCoupon {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  usageCount: number;
  usageLimit: number;
  expiresAt: string;
  active: boolean;
}

export interface AdminWalletTransaction {
  id: string;
  userName: string;
  type: 'CREDIT' | 'DEBIT';
  category: 'PURCHASE' | 'REWARD' | 'BONUS' | 'REFUND' | 'WITHDRAWAL' | 'SESSION';
  amount: number;
  balance: number;
  description: string;
  createdAt: string;
}

export interface WalletStats {
  totalCreditsIssued: number;
  creditsOutstanding: number;
  creditsUsed: number;
  rewardsDistributed: number;
  bonusesDistributed: number;
  refundsProcessed: number;
  averageBalance: number;
}

/* ============================================================
   Community moderation
   ============================================================ */

export interface ModerationQueueItem {
  id: string;
  targetType: 'POST' | 'COMMENT' | 'REVIEW' | 'COMMUNITY' | 'POLL';
  content: string;
  author: string;
  reason: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  reportedAt: string;
  reports: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface AdminCommunityPost {
  id: string;
  title: string;
  community: string;
  author: string;
  status: 'PUBLISHED' | 'PINNED' | 'HIDDEN' | 'REPORTED';
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
}

export interface AdminCommunity {
  id: string;
  name: string;
  category: string;
  members: number;
  posts: number;
  moderators: number;
  status: 'ACTIVE' | 'RESTRICTED' | 'ARCHIVED';
  createdAt: string;
}

export interface AdminPoll {
  id: string;
  question: string;
  community: string;
  votes: number;
  options: number;
  status: 'OPEN' | 'CLOSED';
  endsAt: string;
}

/* ============================================================
   Review moderation
   ============================================================ */

export interface ModerationReview {
  id: string;
  mentorName: string;
  learnerName: string;
  rating: number;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  helpfulVotes: number;
  reported: boolean;
  reportReason?: string;
  createdAt: string;
  anonymous?: boolean;
}

export interface ReviewModerationAnalytics {
  totalReviews: number;
  pending: number;
  approved: number;
  rejected: number;
  reported: number;
  averageRating: number;
  helpfulVotes: number;
  ratingsDistribution: Record<string, number>;
}

/* ============================================================
   Support center
   ============================================================ */

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface SupportReply {
  id: string;
  senderName: string;
  senderType: 'USER' | 'ADMIN' | 'SYSTEM';
  message: string;
  internal: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  assignedAt?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  replies: SupportReply[];
}

/* ============================================================
   Announcements
   ============================================================ */

export type AnnouncementStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'EXPIRED';
export type AnnouncementPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface SystemAnnouncement {
  id: string;
  title: string;
  content: string;
  announcementType: string;
  targetRole: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  scheduledAt?: string;
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
  author: string;
}

export interface AnnouncementTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  targetRole: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  announcementType: string;
  targetRole: string;
  priority: AnnouncementPriority;
  scheduledAt?: string;
  expiresAt?: string;
}

/* ============================================================
   Platform settings
   ============================================================ */

export type SettingDataType = 'BOOLEAN' | 'NUMBER' | 'STRING' | 'SELECT' | 'JSON';

export interface PlatformSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  dataType: SettingDataType;
  description: string;
  category: string;
  encrypted: boolean;
  active: boolean;
  updatedAt: string;
}

export interface UpdateSettingRequest {
  settingKey: string;
  settingValue: string;
  dataType: SettingDataType;
  description: string;
  category: string;
}

/* ============================================================
   Feature flags
   ============================================================ */

export type FlagEnvironment = 'development' | 'staging' | 'production';

export interface FeatureFlag {
  id: string;
  featureKey: string;
  featureName: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  environment: FlagEnvironment;
  active: boolean;
  updatedAt: string;
}

export interface UpdateFeatureFlagRequest {
  featureKey: string;
  featureName: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  environment: FlagEnvironment;
}

/* ============================================================
   Audit logs
   ============================================================ */

export type AuditActionCategory =
  | 'AUTH'
  | 'ADMIN'
  | 'PAYMENT'
  | 'MODERATION'
  | 'SETTINGS'
  | 'ROLE'
  | 'SYSTEM';

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  category: AuditActionCategory;
  ipAddress: string;
  createdAt: string;
  previousValue?: string;
  newValue?: string;
}

/* ============================================================
   System monitoring
   ============================================================ */

export type ServiceStatus = 'UP' | 'DEGRADED' | 'DOWN' | 'MAINTENANCE';

export interface MonitoredService {
  name: string;
  description: string;
  status: ServiceStatus;
  latencyMs: number;
  errorRate: number;
  uptime: number;
  cpu: number;
  memory: number;
}

export interface SystemMetrics {
  apiStatus: ServiceStatus;
  database: ServiceStatus;
  redis: ServiceStatus;
  rabbitmq: ServiceStatus;
  minio: ServiceStatus;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  responseTimeMs: number;
  errorRate: number;
  requestsPerMinute: number;
  activeSockets: number;
  latencySeries: { label: string; value: number }[];
  requestVolume: { label: string; value: number }[];
  errorRateSeries: { label: string; value: number }[];
}

/* ============================================================
   Reports
   ============================================================ */

export type ReportType =
  | 'REVENUE'
  | 'USERS'
  | 'MENTORS'
  | 'SESSIONS'
  | 'COMMUNITY'
  | 'REVIEWS'
  | 'WALLET'
  | 'SUPPORT';

export type ReportFormat = 'CSV' | 'EXCEL' | 'PDF';

export interface ReportDefinition {
  id: ReportType;
  title: string;
  description: string;
  category: string;
  lastGeneratedAt?: string;
  downloadCount: number;
  icon: string;
}

export interface ReportSummaryRow {
  label: string;
  value: number;
  change: number;
}
