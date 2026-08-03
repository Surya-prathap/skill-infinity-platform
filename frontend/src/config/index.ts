/**
 * Centralized environment configuration.
 * All values are read from .env files (see .env.development / .env.production).
 */
export const APP_CONFIG = {
  env: import.meta.env.VITE_APP_ENV ?? 'development',
  name: import.meta.env.VITE_APP_NAME ?? 'Skill Infinity',
  version: import.meta.env.VITE_APP_VERSION ?? '0.1.0',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  wsUrl: import.meta.env.VITE_WS_URL ?? 'ws://localhost:8090',
  socketUrl: import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:8090',
  apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 30000),
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
} as const;
