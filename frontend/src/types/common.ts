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
