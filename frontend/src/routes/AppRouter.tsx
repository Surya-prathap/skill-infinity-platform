import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Box, LinearProgress } from '@mui/material';
import { AdminLayout, AuthLayout, DashboardLayout, ErrorLayout, MainLayout } from '@/layouts';
import { AuthGuard, GuestGuard, RoleGuard } from '@/guards';
import { ROLES, ROUTES } from '@/constants';

/* Route-level code splitting — each page is its own chunk. */
const lazyPage = (loader: () => Promise<{ default: React.ComponentType }>) =>
  lazy(() => loader().then((module) => ({ default: module.default })));

const LandingPage = lazyPage(async () => {
  const module = await import('@/pages/LandingPage');
  return { default: module.LandingPage };
});
const BecomeMentorPage = lazyPage(async () => {
  const module = await import('@/pages/mentor/BecomeMentorPage');
  return { default: module.BecomeMentorPage };
});
const MentorsPage = lazyPage(async () => {
  const module = await import('@/pages/MentorsPage');
  return { default: module.MentorsPage };
});
const MentorProfilePage = lazyPage(async () => {
  const module = await import('@/pages/MentorProfilePage');
  return { default: module.MentorProfilePage };
});
const BookingPage = lazyPage(async () => {
  const module = await import('@/pages/BookingPage');
  return { default: module.BookingPage };
});
const LoginPage = lazyPage(async () => {
  const module = await import('@/pages/LoginPage');
  return { default: module.LoginPage };
});
const RegisterPage = lazyPage(async () => {
  const module = await import('@/pages/RegisterPage');
  return { default: module.RegisterPage };
});
const ForgotPasswordPage = lazyPage(async () => {
  const module = await import('@/pages/ForgotPasswordPage');
  return { default: module.ForgotPasswordPage };
});
const ResetPasswordPage = lazyPage(async () => {
  const module = await import('@/pages/ResetPasswordPage');
  return { default: module.ResetPasswordPage };
});
const EmailVerificationPage = lazyPage(async () => {
  const module = await import('@/pages/EmailVerificationPage');
  return { default: module.EmailVerificationPage };
});
const DashboardPage = lazyPage(async () => {
  const module = await import('@/pages/DashboardPage');
  return { default: module.DashboardPage };
});
const ProfileLayout = lazyPage(async () => {
  const module = await import('@/pages/profile/ProfileLayout');
  return { default: module.ProfileLayout };
});
const ProfileOverviewPage = lazyPage(async () => {
  const module = await import('@/pages/profile/ProfileOverviewPage');
  return { default: module.ProfileOverviewPage };
});
const EditProfilePage = lazyPage(async () => {
  const module = await import('@/pages/profile/EditProfilePage');
  return { default: module.EditProfilePage };
});
const EducationPage = lazyPage(async () => {
  const module = await import('@/pages/profile/EducationPage');
  return { default: module.EducationPage };
});
const ExperiencePage = lazyPage(async () => {
  const module = await import('@/pages/profile/ExperiencePage');
  return { default: module.ExperiencePage };
});
const SkillsPage = lazyPage(async () => {
  const module = await import('@/pages/profile/SkillsPage');
  return { default: module.SkillsPage };
});
const LanguagesPage = lazyPage(async () => {
  const module = await import('@/pages/profile/LanguagesPage');
  return { default: module.LanguagesPage };
});
const SocialLinksPage = lazyPage(async () => {
  const module = await import('@/pages/profile/SocialLinksPage');
  return { default: module.SocialLinksPage };
});
const ResumePage = lazyPage(async () => {
  const module = await import('@/pages/profile/ResumePage');
  return { default: module.ResumePage };
});
const MentorDashboardPage = lazyPage(async () => {
  const module = await import('@/pages/mentor/MentorDashboardPage');
  return { default: module.MentorDashboardPage };
});
const MentorRegistrationPage = lazyPage(async () => {
  const module = await import('@/pages/mentor/MentorRegistrationPage');
  return { default: module.MentorRegistrationPage };
});
const MentorApplicationSubmittedPage = lazyPage(async () => {
  const module = await import('@/pages/mentor/MentorApplicationSubmittedPage');
  return { default: module.MentorApplicationSubmittedPage };
});
const MentorAvailabilityPage = lazyPage(async () => {
  const module = await import('@/pages/mentor/MentorAvailabilityPage');
  return { default: module.MentorAvailabilityPage };
});
const MentorPricingPage = lazyPage(async () => {
  const module = await import('@/pages/mentor/MentorPricingPage');
  return { default: module.MentorPricingPage };
});
const MentorAnalyticsPage = lazyPage(async () => {
  const module = await import('@/pages/mentor/MentorAnalyticsPage');
  return { default: module.MentorAnalyticsPage };
});
const MentorCertificatesPage = lazyPage(async () => {
  const module = await import('@/pages/mentor/MentorCertificatesPage');
  return { default: module.MentorCertificatesPage };
});
const MentorAchievementsPage = lazyPage(async () => {
  const module = await import('@/pages/mentor/MentorAchievementsPage');
  return { default: module.MentorAchievementsPage };
});
const MentorSettingsPage = lazyPage(async () => {
  const module = await import('@/pages/mentor/MentorSettingsPage');
  return { default: module.MentorSettingsPage };
});
const MentorReviewsPage = lazyPage(async () => {
  const module = await import('@/pages/reviews/MentorReviewsPage');
  return { default: module.MentorReviewsPage };
});
const CalendarPage = lazyPage(async () => {
  const module = await import('@/pages/CalendarPage');
  return { default: module.CalendarPage };
});
const CreditPurchasePage = lazyPage(async () => {
  const module = await import('@/pages/CreditPurchasePage');
  return { default: module.CreditPurchasePage };
});
const TransactionHistoryPage = lazyPage(async () => {
  const module = await import('@/pages/TransactionHistoryPage');
  return { default: module.TransactionHistoryPage };
});
const SessionDetailsPage = lazyPage(async () => {
  const module = await import('@/pages/SessionDetailsPage');
  return { default: module.SessionDetailsPage };
});
const WalletPage = lazyPage(async () => {
  const module = await import('@/pages/WalletPage');
  return { default: module.WalletPage };
});
const LearnerSubscriptionPage = lazyPage(async () => {
  const module = await import('@/pages/SubscriptionPage');
  return { default: module.LearnerSubscriptionPage };
});
const MentorSubscriptionPage = lazyPage(async () => {
  const module = await import('@/pages/SubscriptionPage');
  return { default: module.MentorSubscriptionPage };
});
const SessionsPage = lazyPage(async () => {
  const module = await import('@/pages/SessionsPage');
  return { default: module.SessionsPage };
});
const MeetingsPage = lazyPage(async () => {
  const module = await import('@/pages/MeetingsPage');
  return { default: module.MeetingsPage };
});
const MeetingPage = lazyPage(async () => {
  const module = await import('@/pages/MeetingPage');
  return { default: module.MeetingPage };
});
const SettingsPage = lazyPage(async () => {
  const module = await import('@/pages/SettingsPage');
  return { default: module.SettingsPage };
});
const AdminDashboardPage = lazyPage(async () => {
  const module = await import('@/pages/admin/AdminDashboardPage');
  return { default: module.AdminDashboardPage };
});
const AdminAnalyticsPage = lazyPage(async () => {
  const module = await import('@/pages/admin/AnalyticsPage');
  return { default: module.AnalyticsPage };
});
const AdminUsersPage = lazyPage(async () => {
  const module = await import('@/pages/admin/UsersPage');
  return { default: module.UsersPage };
});
const AdminMentorsPage = lazyPage(async () => {
  const module = await import('@/pages/admin/MentorsPage');
  return { default: module.MentorsPage };
});
const AdminSessionsPage = lazyPage(async () => {
  const module = await import('@/pages/admin/SessionsPage');
  return { default: module.SessionsPage };
});
const AdminPaymentsPage = lazyPage(async () => {
  const module = await import('@/pages/admin/PaymentsPage');
  return { default: module.PaymentsPage };
});
const AdminWalletPage = lazyPage(async () => {
  const module = await import('@/pages/admin/WalletPage');
  return { default: module.WalletPage };
});
const AdminReviewsPage = lazyPage(async () => {
  const module = await import('@/pages/admin/ReviewsModerationPage');
  return { default: module.ReviewsModerationPage };
});
const AdminSettingsPage = lazyPage(async () => {
  const module = await import('@/pages/admin/SettingsPage');
  return { default: module.SettingsPage };
});
const NotFoundPage = lazyPage(async () => {
  const module = await import('@/pages/NotFoundPage');
  return { default: module.NotFoundPage };
});
const UnauthorizedPage = lazyPage(async () => {
  const module = await import('@/pages/UnauthorizedPage');
  return { default: module.UnauthorizedPage };
});

const RouteFallback: React.FC = () => (
  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1400 }}>
    <LinearProgress
      variant="indeterminate"
      sx={{
        height: 3,
        backgroundColor: 'transparent',
        '& .MuiLinearProgress-bar': { borderRadius: 999 },
      }}
    />
  </Box>
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- Public ---------- */}
        <Route element={<MainLayout />}>
          <Route
            path={ROUTES.HOME}
            element={
              <Suspense fallback={<RouteFallback />}>
                <LandingPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.MENTORS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <MentorsPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.MENTOR_DETAILS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <MentorProfilePage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.MENTOR_REVIEWS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <MentorReviewsPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.BECOME_MENTOR}
            element={
              <Suspense fallback={<RouteFallback />}>
                <BecomeMentorPage />
              </Suspense>
            }
          />
        </Route>

        {/* ---------- Guest-only (auth) ---------- */}
        <Route element={<AuthLayout />}>
          <Route
            path={ROUTES.LOGIN}
            element={
              <GuestGuard>
                <Suspense fallback={<RouteFallback />}>
                  <LoginPage />
                </Suspense>
              </GuestGuard>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <GuestGuard>
                <Suspense fallback={<RouteFallback />}>
                  <RegisterPage />
                </Suspense>
              </GuestGuard>
            }
          />
          <Route
            path={ROUTES.FORGOT_PASSWORD}
            element={
              <GuestGuard>
                <Suspense fallback={<RouteFallback />}>
                  <ForgotPasswordPage />
                </Suspense>
              </GuestGuard>
            }
          />
          <Route
            path={ROUTES.RESET_PASSWORD}
            element={
              <GuestGuard>
                <Suspense fallback={<RouteFallback />}>
                  <ResetPasswordPage />
                </Suspense>
              </GuestGuard>
            }
          />
          <Route
            path={ROUTES.EMAIL_VERIFICATION}
            element={
              <GuestGuard>
                <Suspense fallback={<RouteFallback />}>
                  <EmailVerificationPage />
                </Suspense>
              </GuestGuard>
            }
          />
        </Route>

        {/* ---------- Authenticated ---------- */}
        <Route
          element={
              <AuthGuard>
              <DashboardLayout />
               </AuthGuard>
          }
        >
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <Suspense fallback={<RouteFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <Suspense fallback={<RouteFallback />}>
                <ProfileLayout />
              </Suspense>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<RouteFallback />}>
                  <ProfileOverviewPage />
                </Suspense>
              }
            />
            <Route
              path="edit"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <EditProfilePage />
                </Suspense>
              }
            />
            <Route
              path="education"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <EducationPage />
                </Suspense>
              }
            />
            <Route
              path="experience"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <ExperiencePage />
                </Suspense>
              }
            />
            <Route
              path="skills"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <SkillsPage />
                </Suspense>
              }
            />
            <Route
              path="languages"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <LanguagesPage />
                </Suspense>
              }
            />
            <Route
              path="social"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <SocialLinksPage />
                </Suspense>
              }
            />
            <Route
              path="resume"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <ResumePage />
                </Suspense>
              }
            />
          </Route>
          <Route
            path={ROUTES.SESSIONS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <SessionsPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.SESSION_DETAILS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <SessionDetailsPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.CALENDAR}
            element={
              <Suspense fallback={<RouteFallback />}>
                <CalendarPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.WALLET}
            element={
              <Suspense fallback={<RouteFallback />}>
                <WalletPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.CREDITS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <CreditPurchasePage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.SUBSCRIPTION}
            element={
              <Suspense fallback={<RouteFallback />}>
                <LearnerSubscriptionPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.TRANSACTIONS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <TransactionHistoryPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.BOOK_SESSION}
            element={
              <Suspense fallback={<RouteFallback />}>
                <BookingPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.MEETINGS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <MeetingsPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.SETTINGS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <SettingsPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.MENTOR_REGISTRATION}
            element={
              <Suspense fallback={<RouteFallback />}>
                <MentorRegistrationPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.MENTOR_APPLICATION_SUBMITTED}
            element={
              <Suspense fallback={<RouteFallback />}>
                <MentorApplicationSubmittedPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.MENTOR_DASHBOARD}
            element={
              <RoleGuard roles={[ROLES.MENTOR]}>
                <Suspense fallback={<RouteFallback />}>
                  <MentorDashboardPage />
                </Suspense>
              </RoleGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR_AVAILABILITY}
            element={
              <RoleGuard roles={[ROLES.MENTOR]}>
                <Suspense fallback={<RouteFallback />}>
                  <MentorAvailabilityPage />
                </Suspense>
              </RoleGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR_PRICING}
            element={
              <RoleGuard roles={[ROLES.MENTOR]}>
                <Suspense fallback={<RouteFallback />}>
                  <MentorPricingPage />
                </Suspense>
              </RoleGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR_ANALYTICS}
            element={
              <RoleGuard roles={[ROLES.MENTOR]}>
                <Suspense fallback={<RouteFallback />}>
                  <MentorAnalyticsPage />
                </Suspense>
              </RoleGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR_CERTIFICATES}
            element={
              <RoleGuard roles={[ROLES.MENTOR]}>
                <Suspense fallback={<RouteFallback />}>
                  <MentorCertificatesPage />
                </Suspense>
              </RoleGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR_ACHIEVEMENTS}
            element={
              <RoleGuard roles={[ROLES.MENTOR]}>
                <Suspense fallback={<RouteFallback />}>
                  <MentorAchievementsPage />
                </Suspense>
              </RoleGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR_SETTINGS}
            element={
              <RoleGuard roles={[ROLES.MENTOR]}>
                <Suspense fallback={<RouteFallback />}>
                  <MentorSettingsPage />
                </Suspense>
              </RoleGuard>
            }
          />
          <Route
            path={ROUTES.MENTOR_SUBSCRIPTION}
            element={
              <RoleGuard roles={[ROLES.MENTOR]}>
                <Suspense fallback={<RouteFallback />}>
                  <MentorSubscriptionPage />
                </Suspense>
              </RoleGuard>
            }
          />
        </Route>

        {/* ---------- Full-screen meeting (outside the dashboard chrome) ---------- */}
        <Route
          path={ROUTES.MEETING}
          element={
              <AuthGuard>
              <Suspense fallback={<RouteFallback />}>
                <MeetingPage />
              </Suspense>
              </AuthGuard>

          }
        />

        {/* ---------- Admin ---------- */}
        <Route
          element={
             <AuthGuard>
               <RoleGuard roles={[ROLES.ADMIN]}>
                <AdminLayout />
               </RoleGuard>
             </AuthGuard>
          }
        >
          <Route
            path={ROUTES.ADMIN}
            element={
              <Suspense fallback={<RouteFallback />}>
                <AdminDashboardPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <Navigate to={ROUTES.ADMIN} replace />
            }
          />
          <Route
            path={ROUTES.ADMIN_ANALYTICS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <AdminAnalyticsPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.ADMIN_USERS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <AdminUsersPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.ADMIN_MENTORS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <AdminMentorsPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.ADMIN_SESSIONS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <AdminSessionsPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.ADMIN_PAYMENTS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <AdminPaymentsPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.ADMIN_WALLET}
            element={
              <Suspense fallback={<RouteFallback />}>
                <AdminWalletPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.ADMIN_REVIEWS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <AdminReviewsPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.ADMIN_SETTINGS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <AdminSettingsPage />
              </Suspense>
            }
          />
        </Route>

        {/* ---------- Errors ---------- */}
        <Route element={<ErrorLayout />}>
          <Route
            path={ROUTES.UNAUTHORIZED}
            element={
              <Suspense fallback={<RouteFallback />}>
                <UnauthorizedPage />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<RouteFallback />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
