/**
 * Route-chunk prefetcher.
 *
 * Every page is code-split (see AppRouter). On the first visit to a page the
 * browser downloads that chunk, which shows the Suspense fallback and feels
 * slow. After the app has painted, we warm the browser cache with the chunks
 * the CURRENT user will realistically visit so subsequent navigations are
 * instant — no spinner, no delay.
 *
 * The warm set is scoped to the signed-in role: an anonymous visitor only
 * prefetches public pages, a mentor prefetches the studio + learner pages,
 * and an admin prefetches the console. This keeps the initial load light
 * (especially in dev, where every import() triggers a module compile) while
 * still making navigation instant.
 */

import { ROLES } from '@/constants';
import { store } from '@/store';

/* ---------- Public pages (everyone) ---------- */
const PUBLIC_LOADERS = [
  () => import('@/pages/LandingPage'),
  () => import('@/pages/MentorsPage'),
  () => import('@/pages/MentorProfilePage'),
  () => import('@/pages/LoginPage'),
  () => import('@/pages/RegisterPage'),
  () => import('@/pages/mentor/BecomeMentorPage'),
];

/* ---------- Learner dashboard pages ---------- */
const LEARNER_LOADERS = [
  () => import('@/pages/DashboardPage'),
  () => import('@/pages/SessionsPage'),
  () => import('@/pages/SessionDetailsPage'),
  () => import('@/pages/MeetingsPage'),
  () => import('@/pages/MeetingPage'),
  () => import('@/pages/CalendarPage'),
  () => import('@/pages/WalletPage'),
  () => import('@/pages/CreditPurchasePage'),
  () => import('@/pages/TransactionHistoryPage'),
  () => import('@/pages/SubscriptionPage'),
  () => import('@/pages/SettingsPage'),
  () => import('@/pages/profile/ProfileLayout'),
  () => import('@/pages/profile/ProfileOverviewPage'),
  () => import('@/pages/profile/EditProfilePage'),
  () => import('@/pages/BookingPage'),
  () => import('@/pages/reviews/MentorReviewsPage'),
];

/* ---------- Mentor studio pages ---------- */
const MENTOR_LOADERS = [
  () => import('@/pages/mentor/MentorDashboardPage'),
  () => import('@/pages/mentor/MentorAvailabilityPage'),
  () => import('@/pages/mentor/MentorPricingPage'),
  () => import('@/pages/mentor/MentorAnalyticsPage'),
  () => import('@/pages/mentor/MentorCertificatesPage'),
  () => import('@/pages/mentor/MentorAchievementsPage'),
  () => import('@/pages/mentor/MentorSettingsPage'),
  () => import('@/pages/mentor/BecomeMentorPage'),
  () => import('@/pages/mentor/MentorRegistrationPage'),
  () => import('@/pages/mentor/MentorApplicationSubmittedPage'),
];

/* ---------- Admin console pages ---------- */
const ADMIN_LOADERS = [
  () => import('@/pages/admin/AdminDashboardPage'),
  () => import('@/pages/admin/AnalyticsPage'),
  () => import('@/pages/admin/UsersPage'),
  () => import('@/pages/admin/MentorsPage'),
  () => import('@/pages/admin/SessionsPage'),
  () => import('@/pages/admin/PaymentsPage'),
  () => import('@/pages/admin/WalletPage'),
  () => import('@/pages/admin/ReviewsModerationPage'),
  () => import('@/pages/admin/SettingsPage'),
];

/* ---------- Error pages ---------- */
const ERROR_LOADERS = [
  () => import('@/pages/NotFoundPage'),
  () => import('@/pages/UnauthorizedPage'),
];

let prefetched = false;

/** Builds the chunk set for the current auth/role state. */
const loadersForState = (): Array<() => Promise<unknown>> => {
  const loaders: Array<() => Promise<unknown>> = [...PUBLIC_LOADERS];

  const auth = store.getState().auth;
  const roles = auth.user?.roles ?? [];

  if (auth.status !== 'authenticated' || !auth.accessToken) {
    return [...loaders, ...ERROR_LOADERS];
  }

  loaders.push(...LEARNER_LOADERS);
  if (roles.includes(ROLES.MENTOR)) loaders.push(...MENTOR_LOADERS);
  if (roles.includes(ROLES.ADMIN)) loaders.push(...ADMIN_LOADERS);
  loaders.push(...ERROR_LOADERS);
  return loaders;
};

/**
 * Downloads the relevant route chunks so navigation never blocks on a network
 * fetch. Safe to call multiple times — the work only runs once. Any failure
 * is ignored (the lazy import retries on actual navigation).
 *
 * The queue is concurrency-limited: in dev every dynamic import() triggers an
 * on-demand Vite transform, and firing the whole warm set at once right after
 * first paint froze the main thread and made the UI feel seconds slow on
 * constrained machines (especially while the backend containers are booting
 * on the same CPUs). Spreading the work keeps the page responsive while still
 * warming the full warm set.
 */
export const prefetchRoutes = (): void => {
  if (prefetched || typeof window === 'undefined') return;
  prefetched = true;

  const loaders = loadersForState();
  const CONCURRENCY = 4;
  const STAGGER_MS = 150;

  let cursor = 0;
  let active = 0;

  const pump = (): void => {
    while (active < CONCURRENCY && cursor < loaders.length) {
      const loader = loaders[cursor];
      cursor += 1;
      if (!loader) continue;
      active += 1;
      window.setTimeout(() => {
        Promise.resolve()
          .then(loader)
          .catch(() => undefined)
          .finally(() => {
            active -= 1;
            pump();
          });
      }, STAGGER_MS);
    }
  };

  pump();
};

/** Schedules the prefetch for when the browser is idle (or shortly after paint). */
export const scheduleRoutePrefetch = (): void => {
  const run = () => prefetchRoutes();
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  };
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(run, { timeout: 2500 });
  } else {
    setTimeout(run, 600);
  }
};
