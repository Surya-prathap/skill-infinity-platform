/**
 * Feature-first modules. Each feature owns its components, hooks and schemas:
 *
 * - features/auth  — authentication forms and validation schemas
 * - features/mentor — mentor workspace (Day 12+)
 * - features/learner — learner portal (Day 12+)
 * - features/admin — admin console (later)
 *
 * Cross-cutting concerns live in src/components, src/hooks, src/services etc.
 */
export * from './auth';
export * from './marketplace';
export * from './sessions';
export * from './wallet';
export * from './payments';
export * from './communication';
export * from './meeting';
/* Admin feature hooks are imported from '@/features/admin' directly to avoid
   name collisions with other domains (seedMentors, seedPayments, etc.).
   Community feature hooks are imported from '@/features/community' directly
   to avoid name collisions (CURRENT_USER_ID, seedCategories, etc.). */
