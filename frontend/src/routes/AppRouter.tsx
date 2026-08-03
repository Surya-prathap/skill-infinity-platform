import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
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
const MentorsPage = lazyPage(async () => {
  const module = await import('@/pages/MentorsPage');
  return { default: module.MentorsPage };
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
const ProfilePage = lazyPage(async () => {
  const module = await import('@/pages/ProfilePage');
  return { default: module.ProfilePage };
});
const MentorDashboardPage = lazyPage(async () => {
  const module = await import('@/pages/MentorDashboardPage');
  return { default: module.MentorDashboardPage };
});
const CommunityPage = lazyPage(async () => {
  const module = await import('@/pages/CommunityPage');
  return { default: module.CommunityPage };
});
const WalletPage = lazyPage(async () => {
  const module = await import('@/pages/WalletPage');
  return { default: module.WalletPage };
});
const SessionsPage = lazyPage(async () => {
  const module = await import('@/pages/SessionsPage');
  return { default: module.SessionsPage };
});
const NotificationsPage = lazyPage(async () => {
  const module = await import('@/pages/NotificationsPage');
  return { default: module.NotificationsPage };
});
const SettingsPage = lazyPage(async () => {
  const module = await import('@/pages/SettingsPage');
  return { default: module.SettingsPage };
});
const AdminDashboardPage = lazyPage(async () => {
  const module = await import('@/pages/AdminDashboardPage');
  return { default: module.AdminDashboardPage };
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
  <Box sx={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CircularProgress thickness={4} />
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
                <ProfilePage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.COMMUNITY}
            element={
              <Suspense fallback={<RouteFallback />}>
                <CommunityPage />
              </Suspense>
            }
          />
          <Route
            path={ROUTES.SESSIONS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <SessionsPage />
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
            path={ROUTES.NOTIFICATIONS}
            element={
              <Suspense fallback={<RouteFallback />}>
                <NotificationsPage />
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
            path={ROUTES.MENTOR_DASHBOARD}
            element={
              <RoleGuard roles={[ROLES.MENTOR]}>
                <Suspense fallback={<RouteFallback />}>
                  <MentorDashboardPage />
                </Suspense>
              </RoleGuard>
            }
          />
        </Route>

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
