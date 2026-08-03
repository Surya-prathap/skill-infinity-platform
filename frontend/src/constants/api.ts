/** API endpoint constants mirroring the microservice controllers. */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    VALIDATE: '/auth/validate',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    SEARCH: '/users/search',
    EDUCATION: '/users/{userId}/education',
    EDUCATION_ITEM: '/users/{userId}/education/{itemId}',
    EXPERIENCE: '/users/{userId}/experience',
    EXPERIENCE_ITEM: '/users/{userId}/experience/{itemId}',
    SKILLS: '/users/{userId}/skills',
    SKILLS_ITEM: '/users/{userId}/skills/{itemId}',
    LANGUAGES: '/users/{userId}/languages',
    LANGUAGES_ITEM: '/users/{userId}/languages/{itemId}',
  },
  MENTORS: {
    BASE: '/mentors',
    PROFILE: '/mentors/profile',
    ME: '/mentors/me',
  },
  SESSIONS: {
    BASE: '/sessions',
    MY: '/sessions/my',
    MENTOR: '/sessions/mentor',
  },
  WALLET: {
    BASE: '/wallet',
    BALANCE: '/wallet/balance',
    TRANSACTIONS: '/wallet/transactions',
  },
  COMMUNITY: {
    POSTS: '/community/posts',
    COMMENTS: '/community/comments',
  },
  REVIEWS: {
    BASE: '/reviews',
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: '/notifications/read',
  },
  ADMIN: {
    BASE: '/admin',
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    MENTORS: '/admin/mentors',
  },
} as const;
