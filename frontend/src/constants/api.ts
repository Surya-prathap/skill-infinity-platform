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
