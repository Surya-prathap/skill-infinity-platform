import type { Meeting, MeetingParticipant } from '@/types';

/* ============================================================
   Seed data — mirrors meeting-service payloads so the Meeting
   Platform is fully explorable offline.
   ============================================================ */

const now = Date.now();
const minutesFromNow = (m: number): string => new Date(now + m * 60_000).toISOString();
const hoursAgo = (h: number): string => new Date(now - h * 3_600_000).toISOString();

export const MEETING_CURRENT_USER_ID = 'user-me';
export const MEETING_CURRENT_USER_NAME = 'Alex Morgan';

/* ---------------- Seed meetings ---------------- */

export const seedMeetings: Meeting[] = [
  {
    id: 'm-001',
    title: 'System Design Deep Dive',
    kind: 'session',
    hostId: 'user-sarah',
    hostName: 'Sarah Chen',
    hostRole: 'MENTOR',
    sessionId: 's-001',
    conversationId: 'c-sysdesign',
    scheduledAt: minutesFromNow(25),
    durationMinutes: 60,
    joinUrl: '/meet/m-001',
    maxParticipants: 12,
    status: 'scheduled',
    createdAt: hoursAgo(24),
  },
  {
    id: 'm-002',
    title: 'Backend Architecture Review',
    kind: 'mentor-learner',
    hostId: 'user-james',
    hostName: 'James Carter',
    hostRole: 'MENTOR',
    sessionId: 's-003',
    conversationId: 'c-james',
    scheduledAt: minutesFromNow(180),
    durationMinutes: 45,
    joinUrl: '/meet/m-002',
    maxParticipants: 4,
    status: 'scheduled',
    createdAt: hoursAgo(48),
  },
  {
    id: 'm-003',
    title: 'Cloud Fundamentals — VPC Deep Dive',
    kind: 'session',
    hostId: 'user-priya',
    hostName: 'Priya Sharma',
    hostRole: 'MENTOR',
    sessionId: 's-004',
    conversationId: 'c-cloud',
    scheduledAt: minutesFromNow(50),
    durationMinutes: 90,
    joinUrl: '/meet/m-003',
    maxParticipants: 20,
    status: 'scheduled',
    createdAt: hoursAgo(30),
  },
  {
    id: 'm-004',
    title: 'DevOps Study Group — Friday Sync',
    kind: 'group',
    hostId: 'user-elena',
    hostName: 'Elena Rodriguez',
    hostRole: 'MENTOR',
    conversationId: 'c-devops',
    scheduledAt: minutesFromNow(150),
    durationMinutes: 60,
    joinUrl: '/meet/m-004',
    maxParticipants: 25,
    status: 'scheduled',
    createdAt: hoursAgo(12),
  },
];

/* ---------------- Demo meeting participants ---------------- */

export const demoMeetingParticipants: MeetingParticipant[] = [
  {
    id: 'meet-sarah',
    name: 'Sarah Chen',
    firstName: 'Sarah',
    lastName: 'Chen',
    role: 'MENTOR',
    isLocal: false,
    audioEnabled: true,
    videoEnabled: true,
    screenSharing: false,
    isSpeaking: false,
    handRaised: false,
    connectionQuality: 'excellent',
    joinedAt: hoursAgo(0),
  },
  {
    id: 'meet-james',
    name: 'James Carter',
    firstName: 'James',
    lastName: 'Carter',
    role: 'MENTOR',
    isLocal: false,
    audioEnabled: true,
    videoEnabled: true,
    screenSharing: false,
    isSpeaking: false,
    handRaised: false,
    connectionQuality: 'good',
    joinedAt: hoursAgo(0),
  },
  {
    id: 'meet-maya',
    name: 'Maya Patel',
    firstName: 'Maya',
    lastName: 'Patel',
    role: 'LEARNER',
    isLocal: false,
    audioEnabled: true,
    videoEnabled: true,
    screenSharing: false,
    isSpeaking: false,
    handRaised: false,
    connectionQuality: 'good',
    joinedAt: hoursAgo(0),
  },
  {
    id: 'meet-david',
    name: 'David Kim',
    firstName: 'David',
    lastName: 'Kim',
    role: 'LEARNER',
    isLocal: false,
    audioEnabled: true,
    videoEnabled: true,
    screenSharing: false,
    isSpeaking: false,
    handRaised: false,
    connectionQuality: 'fair',
    joinedAt: hoursAgo(0),
  },
  {
    id: 'meet-priya',
    name: 'Priya Sharma',
    firstName: 'Priya',
    lastName: 'Sharma',
    role: 'MENTOR',
    isLocal: false,
    audioEnabled: true,
    videoEnabled: true,
    screenSharing: false,
    isSpeaking: false,
    handRaised: false,
    connectionQuality: 'good',
    joinedAt: hoursAgo(0),
  },
];

/* ---------------- Device seed (no permissions granted yet) ---------------- */

export const fallbackDevices = {
  audioInputs: [
    { deviceId: 'default', label: 'Default — Microphone (Realtek Audio)' },
    { deviceId: 'builtin-mic', label: 'Built-in Microphone' },
  ],
  videoInputs: [
    { deviceId: 'default', label: 'Default — HD Webcam' },
    { deviceId: 'external-cam', label: 'External Camera 4K' },
  ],
  audioOutputs: [
    { deviceId: 'default', label: 'Default — Speakers' },
    { deviceId: 'headphones', label: 'Headphones (Bluetooth)' },
  ],
};
