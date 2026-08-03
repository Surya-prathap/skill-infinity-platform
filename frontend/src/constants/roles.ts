import type { Role } from '@/types';

/**
 * Role constants — match the identity-service SecurityConstants (ROLE_ prefix).
 */
export const ROLES = {
  USER: 'ROLE_USER',
  LEARNER: 'ROLE_LEARNER',
  MENTOR: 'ROLE_MENTOR',
  ADMIN: 'ROLE_ADMIN',
} as const satisfies Record<string, Role>;

/** Human-readable labels for UI display. */
export const ROLE_LABELS: Record<Role, string> = {
  ROLE_USER: 'Member',
  ROLE_LEARNER: 'Learner',
  ROLE_MENTOR: 'Mentor',
  ROLE_ADMIN: 'Administrator',
};

export const hasRole = (roles: Role[] | undefined, required: Role[]): boolean => {
  if (!roles || roles.length === 0) return false;
  return required.some((role) => roles.includes(role));
};
