export const APP_NAME = 'Skill Infinity';

export const APP_TAGLINE = 'Where Knowledge Creates Value';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  MENTORS: '/mentors',
  SESSIONS: '/sessions',
  WALLET: '/wallet',
  COMMUNITY: '/community',
  PROFILE: '/profile',
  ADMIN: '/admin',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
  },
  MENTORS: {
    BASE: '/mentors',
  },
  SESSIONS: {
    BASE: '/sessions',
  },
  WALLET: {
    BASE: '/wallet',
    TRANSACTIONS: '/wallet/transactions',
  },
  COMMUNITY: {
    POSTS: '/community/posts',
    COMMENTS: '/community/comments',
  },
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'currentUser',
  THEME: 'themeMode',
} as const;
