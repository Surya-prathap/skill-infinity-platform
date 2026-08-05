export { LandingPage } from './LandingPage';
export { MentorsPage } from './MentorsPage';
export { MentorProfilePage } from './MentorProfilePage';
export { BookingPage } from './BookingPage';
export { LoginPage } from './LoginPage';
export { RegisterPage } from './RegisterPage';
export { ForgotPasswordPage } from './ForgotPasswordPage';
export { ResetPasswordPage } from './ResetPasswordPage';
export { EmailVerificationPage } from './EmailVerificationPage';
export { DashboardPage } from './DashboardPage';
export { MentorDashboardPage } from './MentorDashboardPage';
export { CalendarPage } from './CalendarPage';
export { WalletPage } from './WalletPage';
export { CreditPurchasePage } from './CreditPurchasePage';
export { TransactionHistoryPage } from './TransactionHistoryPage';
export { SessionsPage } from './SessionsPage';
export { SessionDetailsPage } from './SessionDetailsPage';
export { NotificationsPage } from './NotificationsPage';
export { CommunicationPage } from './CommunicationPage';
export { AnnouncementsPage } from './AnnouncementsPage';
export { MeetingsPage } from './MeetingsPage';
export { MeetingPage } from './MeetingPage';
export { SettingsPage } from './SettingsPage';
export { NotFoundPage } from './NotFoundPage';
export { UnauthorizedPage } from './UnauthorizedPage';

/* Community platform */
export {
  CommunityHubPage,
  CommunitiesPage,
  CommunityDetailsPage,
  PostDetailsPage,
  LeaderboardPage,
  ActivityPage,
  AchievementsPage,
  MentorReviewsPage,
  SearchPage,
} from './community';

/* Enterprise Admin Portal (aliased to avoid collisions with user-facing pages). */
export {
  AdminDashboardPage,
  AnalyticsPage as AdminAnalyticsPage,
  UsersPage as AdminUsersPage,
  MentorsPage as AdminMentorsPage,
  SessionsPage as AdminSessionsPage,
  PaymentsPage as AdminPaymentsPage,
  WalletPage as AdminWalletPage,
  CommunityModerationPage as AdminCommunityPage,
  ReviewsModerationPage as AdminReviewsPage,
  SupportCenterPage as AdminSupportPage,
  AnnouncementsPage as AdminAnnouncementsPage,
  ReportsPage as AdminReportsPage,
  SettingsPage as AdminSettingsPage,
  FeatureFlagsPage as AdminFeatureFlagsPage,
  AuditLogsPage as AdminAuditLogsPage,
  MonitoringPage as AdminMonitoringPage,
} from './admin';

/* Mentor portal */
export { BecomeMentorPage } from './mentor/BecomeMentorPage';
export { MentorRegistrationPage } from './mentor/MentorRegistrationPage';
export { MentorAvailabilityPage } from './mentor/MentorAvailabilityPage';
export { MentorPricingPage } from './mentor/MentorPricingPage';
export { MentorAnalyticsPage } from './mentor/MentorAnalyticsPage';
export { MentorCertificatesPage } from './mentor/MentorCertificatesPage';
export { MentorAchievementsPage } from './mentor/MentorAchievementsPage';
export { MentorSettingsPage } from './mentor/MentorSettingsPage';
