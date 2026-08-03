export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  EMAIL_VERIFICATION: '/verify-email',
  MENTORS: '/mentors',

  // Authenticated
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  PROFILE_EDUCATION: '/profile/education',
  PROFILE_EXPERIENCE: '/profile/experience',
  PROFILE_SKILLS: '/profile/skills',
  PROFILE_LANGUAGES: '/profile/languages',
  PROFILE_SOCIAL: '/profile/social',
  PROFILE_RESUME: '/profile/resume',
  COMMUNITY: '/community',
  SESSIONS: '/sessions',
  WALLET: '/wallet',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',

  // Mentor
  BECOME_MENTOR: '/become-mentor',
  MENTOR_REGISTRATION: '/mentor/register',
  MENTOR_DASHBOARD: '/mentor/dashboard',
  MENTOR_AVAILABILITY: '/mentor/availability',
  MENTOR_PRICING: '/mentor/pricing',
  MENTOR_ANALYTICS: '/mentor/analytics',
  MENTOR_CERTIFICATES: '/mentor/certificates',
  MENTOR_ACHIEVEMENTS: '/mentor/achievements',
  MENTOR_SETTINGS: '/mentor/settings',

  // Admin
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',

  // Errors
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
