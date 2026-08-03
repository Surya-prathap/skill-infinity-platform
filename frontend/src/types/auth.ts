/**
 * Roles are mirrored from backend SecurityConstants / UserRole enum.
 * They carry the ROLE_ prefix exactly as issued by the identity-service.
 */
export type Role = 'ROLE_LEARNER' | 'ROLE_MENTOR' | 'ROLE_ADMIN' | 'ROLE_USER';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  roles: Role[];
}

/** Response DTO from identity-service AuthController (AuthResponse). */
export interface AuthResponse extends AuthTokens {
  userId: string;
  email: string;
  username: string;
  roles: Role[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
