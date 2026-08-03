/**
 * Backward-compatible re-export so existing imports of
 * `@/pages/MentorDashboardPage` keep working after the premium
 * mentor dashboard moved to `pages/mentor/MentorDashboardPage`.
 */
export { MentorDashboardPage } from './mentor/MentorDashboardPage';
export { default } from './mentor/MentorDashboardPage';
