import type { CalendarEvent, Session } from '@/types';

/* ============================================================
   Empty typed defaults — sessions, calendar and history render
   honest empty states until the session-service returns real data.
   ============================================================ */

export const seedSessions: Session[] = [];
export const seedCalendarEvents: CalendarEvent[] = [];

export const sessionStatusLabel = (status: string): string =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
