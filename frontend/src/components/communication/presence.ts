import type { PresenceStatus } from '@/types';

export interface PresenceMeta {
  label: string;
  color: string;
  dotColor: string;
}

export const PRESENCE_META: Record<PresenceStatus, PresenceMeta> = {
  online: { label: 'Online', color: '#22C55E', dotColor: '#22C55E' },
  away: { label: 'Away', color: '#F59E0B', dotColor: '#F59E0B' },
  busy: { label: 'Busy', color: '#EF4444', dotColor: '#EF4444' },
  'in-session': { label: 'In a session', color: '#8B5CF6', dotColor: '#8B5CF6' },
  offline: { label: 'Offline', color: 'text.disabled', dotColor: '#94A3B8' },
  invisible: { label: 'Invisible', color: 'text.disabled', dotColor: '#64748B' },
};

export const PRESENCE_ORDER: PresenceStatus[] = ['online', 'away', 'busy', 'in-session', 'offline', 'invisible'];

export const isPresenceOnline = (status: PresenceStatus): boolean =>
  status === 'online' || status === 'in-session';
