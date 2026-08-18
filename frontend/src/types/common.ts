import type { ReactNode } from 'react';
import type { Role } from './auth';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
  /** Domain category used for grouping in the notification center. */
  category?: string;
  /** Icon emoji used by the premium notification center. */
  emoji?: string;
  /** Optional action label rendered as a button on the notification card. */
  actionLabel?: string;
  readAt?: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: ReactNode;
  end?: boolean;
  children?: NavItem[];
  roles?: Role[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}
