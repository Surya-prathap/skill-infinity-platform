/**
 * Admin Portal domain types.
 *
 * These mirror the admin-service DTOs (DashboardResponse, AdminUserResponse,
 * PlatformSetting) and add richer frontend shapes used by the admin console.
 */

/* ============================================================
   Dashboard
   ============================================================ */

export interface AdminActivityItem {
  action: string;
  description: string;
  timestamp: string;
}

export interface SystemHealth {
  status: 'UP' | 'DEGRADED' | 'DOWN';
  uptime: number;
}

export interface AdminDashboard {
  totalUsers: number;
  totalMentors: number;
  totalLearners: number;
  recentActivities: AdminActivityItem[];
  systemHealth: SystemHealth;
}

/* ============================================================
   Users & mentors
   ============================================================ */

export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'BANNED';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ROLE_LEARNER' | 'ROLE_MENTOR' | 'ROLE_ADMIN' | 'ROLE_USER';
  status: AdminUserStatus;
  joinedAt: string;
  lastActiveAt: string;
  sessionsCompleted: number;
  totalSpend: number;
  walletBalance: number;
  country?: string;
}

export interface MentorApproval {
  id: string;
  name: string;
  email: string;
  expertise: string[];
  yearsExperience: number;
  requestedAt: string;
  verificationScore: number;
  certificates: string[];
  bio: string;
  hourlyRate: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface AdminMentor {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  verified: boolean;
  rating: number;
  reviewCount: number;
  sessionsCompleted: number;
  revenue: number;
  hourlyRate: number;
  expertise: string[];
  responseRate: number;
  joinedAt: string;
  lastActiveAt: string;
  certificates: number;
}

/* ============================================================
   Platform settings
   ============================================================ */

export type SettingDataType = 'BOOLEAN' | 'NUMBER' | 'STRING' | 'SELECT' | 'JSON';

export interface PlatformSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  dataType: SettingDataType;
  description: string;
  category: string;
  encrypted: boolean;
  active: boolean;
  updatedAt: string;
}

export interface UpdateSettingRequest {
  settingKey: string;
  settingValue: string;
  dataType: SettingDataType;
  description: string;
  category: string;
}

/* ============================================================
   Admin UI state
   ============================================================ */

export type FlagEnvironment = 'development' | 'staging' | 'production';
