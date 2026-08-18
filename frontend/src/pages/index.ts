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
export { WalletPage } from './WalletPage';
export { SessionsPage } from './SessionsPage';
export { SessionDetailsPage } from './SessionDetailsPage';
export { SettingsPage } from './SettingsPage';
export { NotFoundPage } from './NotFoundPage';
export { UnauthorizedPage } from './UnauthorizedPage';

/* Mentor reviews (backed by session-service review API) */
export { MentorReviewsPage } from './reviews';

/* Admin Portal (aliased to avoid collisions with user-facing pages). */
export {
  AdminDashboardPage,
  UsersPage as AdminUsersPage,
  MentorsPage as AdminMentorsPage,
  SettingsPage as AdminSettingsPage,
} from './admin';

/* Mentor portal */
export { BecomeMentorPage } from './mentor/BecomeMentorPage';
export { MentorRegistrationPage } from './mentor/MentorRegistrationPage';
export { MentorAvailabilityPage } from './mentor/MentorAvailabilityPage';
export { MentorPricingPage } from './mentor/MentorPricingPage';
export { MentorSettingsPage } from './mentor/MentorSettingsPage';
