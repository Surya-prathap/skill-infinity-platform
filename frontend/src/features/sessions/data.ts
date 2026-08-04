import type { CalendarEvent, Session } from '@/types';

/* ============================================================
   Seed session data — powers Sessions, Calendar and Session
   Details offline, and upgrades seamlessly to live data.
   ============================================================ */

const iso = (daysFromNow: number, hour: number, minute = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const past = (daysAgo: number, hour: number): string => iso(-daysAgo, hour);

export const seedSessions: Session[] = [
  {
    id: 's-001',
    title: 'System Design Deep Dive',
    topic: 'System Design Deep Dive',
    description: 'Whiteboard a scalable URL shortener end-to-end with feedback.',
    mentorId: 'm-001',
    learnerId: 'u-me',
    mentorName: 'Alex Rivera',
    learnerName: 'You',
    startTime: iso(1, 16),
    endTime: iso(1, 17),
    durationMinutes: 60,
    timezone: 'America/Los_Angeles',
    status: 'CONFIRMED',
    price: 75,
    currency: 'USD',
    meetingLink: {
      id: 'mtg-001',
      provider: 'ZOOM',
      meetingUrl: 'https://meet.skillinfinity.io/system-design-deep-dive',
      joinUrl: 'https://meet.skillinfinity.io/system-design-deep-dive',
      password: 'SD2026',
      active: true,
    },
  },
  {
    id: 's-002',
    title: 'React Performance Patterns',
    topic: 'React Performance Patterns',
    description: 'Profiling, memoization strategy and render optimization.',
    mentorId: 'm-002',
    learnerId: 'u-me',
    mentorName: 'Emily Watson',
    learnerName: 'You',
    startTime: iso(3, 18),
    endTime: iso(3, 19),
    durationMinutes: 60,
    timezone: 'America/New_York',
    status: 'PENDING',
    price: 65,
    currency: 'USD',
  },
  {
    id: 's-003',
    title: 'Behavioral Interview Prep',
    topic: 'Behavioral Interview Prep',
    description: 'STAR storytelling and leadership principles practice.',
    mentorId: 'm-004',
    learnerId: 'u-me',
    mentorName: 'David Kim',
    learnerName: 'You',
    startTime: iso(5, 11),
    endTime: iso(5, 12),
    durationMinutes: 60,
    timezone: 'Europe/London',
    status: 'CONFIRMED',
    price: 90,
    currency: 'USD',
  },
  {
    id: 's-004',
    title: 'Cloud Fundamentals',
    topic: 'Cloud Fundamentals',
    description: 'Core AWS concepts, networking and cost optimization.',
    mentorId: 'm-001',
    learnerId: 'u-me',
    mentorName: 'Alex Rivera',
    learnerName: 'You',
    startTime: past(3, 15),
    endTime: past(3, 16),
    durationMinutes: 60,
    timezone: 'America/Los_Angeles',
    status: 'COMPLETED',
    price: 75,
    currency: 'USD',
    rating: 5,
    feedback: 'Incredible clarity. The whiteboard walkthrough was transformative.',
    completedAt: past(3, 16),
    recordingUrl: 'https://meet.skillinfinity.io/recordings/cloud-fundamentals',
  },
  {
    id: 's-005',
    title: 'Backend Architecture Review',
    topic: 'Backend Architecture Review',
    description: 'Review of my microservices design with actionable notes.',
    mentorId: 'm-005',
    learnerId: 'u-me',
    mentorName: 'Sarah Chen',
    learnerName: 'You',
    startTime: past(9, 17),
    endTime: past(9, 18),
    durationMinutes: 60,
    timezone: 'America/Toronto',
    status: 'COMPLETED',
    price: 55,
    currency: 'USD',
    rating: 4,
    feedback: 'Great practical tips on service boundaries.',
    completedAt: past(9, 18),
  },
  {
    id: 's-006',
    title: 'ML Career Strategy',
    topic: 'ML Career Strategy',
    description: 'Roadmap and portfolio strategy for ML roles.',
    mentorId: 'm-003',
    learnerId: 'u-me',
    mentorName: 'Priya Sharma',
    learnerName: 'You',
    startTime: past(16, 14),
    endTime: past(16, 15),
    durationMinutes: 60,
    timezone: 'Asia/Kolkata',
    status: 'CANCELLED',
    price: 85,
    currency: 'USD',
    cancellationReason: 'Learner rescheduled due to a conflict.',
    rescheduleCount: 1,
  },
];

export const seedCalendarEvents: CalendarEvent[] = seedSessions.map((session) => ({
  id: `evt-${session.id}`,
  sessionId: session.id,
  title: session.topic ?? session.title ?? 'Session',
  description: session.description,
  startTime: session.startTime ?? session.createdAt ?? '',
  endTime: session.endTime ?? '',
  timezone: session.timezone,
  location: session.meetingLink?.meetingUrl,
  provider: session.meetingLink?.provider,
}));

export const sessionStatusLabel = (status: string): string =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
