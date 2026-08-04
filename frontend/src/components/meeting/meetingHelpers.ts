import type { ConnectionQuality, ParticipantRole } from '@/types';

/* ============================================================
   Shared meeting UI helpers — colors, labels, initials, avatars.
   ============================================================ */

export const qualityColor: Record<ConnectionQuality, string> = {
  excellent: '#34D399',
  good: '#2DD4BF',
  fair: '#FBBF24',
  poor: '#F87171',
};

export const qualityLabel: Record<ConnectionQuality, string> = {
  excellent: 'Excellent',
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
};

export const roleColor: Record<ParticipantRole, string> = {
  HOST: '#8E80FF',
  CO_HOST: '#2DD4BF',
  MENTOR: '#60A5FA',
  LEARNER: '#FBBF24',
  GUEST: '#9AA3B8',
};

export const roleLabel: Record<ParticipantRole, string> = {
  HOST: 'Host',
  CO_HOST: 'Co-host',
  MENTOR: 'Mentor',
  LEARNER: 'Learner',
  GUEST: 'Guest',
};

export const initialsOf = (firstName?: string, lastName?: string, fallback = '?'): string => {
  const first = firstName?.trim()?.[0] ?? '';
  const last = lastName?.trim()?.[0] ?? '';
  if (first || last) return `${first}${last}`.toUpperCase();
  const words = fallback.trim().split(/\s+/);
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return `${words[0]?.[0] ?? ''}${words[1]?.[0] ?? ''}`.toUpperCase();
};

const AVATAR_POOL = [
  'https://i.pravatar.cc/160?img=47',
  'https://i.pravatar.cc/160?img=12',
  'https://i.pravatar.cc/160?img=32',
  'https://i.pravatar.cc/160?img=15',
  'https://i.pravatar.cc/160?img=56',
  'https://i.pravatar.cc/160?img=68',
];

/** Deterministic avatar URL for a participant id (stable across renders). */
export const avatarFor = (participantId: string): string => {
  let hash = 0;
  for (let index = 0; index < participantId.length; index += 1) {
    hash = (hash * 31 + participantId.charCodeAt(index)) >>> 0;
  }
  return AVATAR_POOL[hash % AVATAR_POOL.length] ?? AVATAR_POOL[0]!;
};

export const formatMeetingDuration = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number): string => value.toString().padStart(2, '0');
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
};
