export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'skill_access_token',
  REFRESH_TOKEN: 'skill_refresh_token',
  USER: 'skill_current_user',
  THEME: 'skill_theme_mode',
  LANGUAGE: 'skill_language',
  REMEMBER_ME: 'skill_remember_me',
} as const;

export const PERSIST_KEYS = {
  ROOT: 'skill-root',
  AUTH: 'skill-auth',
  THEME: 'skill-theme',
  SETTINGS: 'skill-settings',
  NOTIFICATIONS: 'skill-notifications',
} as const;
