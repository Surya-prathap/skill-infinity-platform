/* ============================================================
   Simulated meeting driver.

   When the signaling backend is unreachable the Meeting Platform
   falls back to a lifelike simulation: demo participants join
   over time, take turns speaking, fire reactions, post chat
   messages, and a stats ticker reports realistic call metrics.
   This keeps the experience fully explorable offline while the
   real WebRTC path stays wired and ready.
   ============================================================ */

import type { AppDispatch } from '@/store';
import {
  addMessage,
  addReaction,
  clearReaction,
  participantJoined,
  patchParticipant,
  setConnectionQuality,
  setConnectionStatus,
  setStats,
  updateLocal,
} from '@/store/slices/meetingSlice';
import type { ConnectionQuality, MeetingMessage, MeetingParticipant, MeetingReaction } from '@/types';

export interface SimulatedParticipantSpec {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  role: MeetingParticipant['role'];
  joinDelayMs: number;
}

const DEMO_PARTICIPANTS: SimulatedParticipantSpec[] = [
  { id: 'meet-sarah', name: 'Sarah Chen', firstName: 'Sarah', lastName: 'Chen', role: 'MENTOR', joinDelayMs: 1400 },
  { id: 'meet-james', name: 'James Carter', firstName: 'James', lastName: 'Carter', role: 'MENTOR', joinDelayMs: 3200 },
  { id: 'meet-maya', name: 'Maya Patel', firstName: 'Maya', lastName: 'Patel', role: 'LEARNER', joinDelayMs: 5000 },
  { id: 'meet-david', name: 'David Kim', firstName: 'David', lastName: 'Kim', role: 'LEARNER', joinDelayMs: 6800 },
  { id: 'meet-priya', name: 'Priya Sharma', firstName: 'Priya', lastName: 'Sharma', role: 'MENTOR', joinDelayMs: 8400 },
];

const REACTION_EMOJIS = ['👍', '👏', '❤️', '🎉', '🔥', '😂', '👋'];

const CHAT_LINES = [
  'Thanks for joining, everyone! 🙌',
  'Can you share your screen for the architecture part?',
  'Great question — let me pull up the diagram.',
  'The material for this session is in the chat thread.',
  'Perfect, that covers the latency trade-off.',
  'Quick recap before we move on: scale, latency, availability.',
  'I’m sharing the recording link after the call 🎬',
  'Let’s do a quick poll — who prefers the pull model?',
];

const SYSTEM_LINES = [
  '🔒 Meeting is being recorded',
  '📣 Announcement: session notes will be shared after the call',
];

interface StatsSample {
  latencyMs: number;
  packetLoss: number;
  bitrateKbps: number;
  fps: number;
  resolution: string;
}

export class SimulatedMeetingDriver {
  readonly timers: number[] = [];
  readonly dispatch: AppDispatch;
  readonly participantIds: string[] = [];
  tickCount = 0;
  running = false;

  constructor(dispatch: AppDispatch, _meetingId: string) {
    this.dispatch = dispatch;
  }

  later(fn: () => void, delayMs: number): void {
    const id = window.setTimeout(() => {
      const index = this.timers.indexOf(id);
      if (index >= 0) this.timers.splice(index, 1);
      if (this.running) fn();
    }, delayMs);
    this.timers.push(id);
  }

  join(spec: SimulatedParticipantSpec, index: number): void {
    const participant: MeetingParticipant = {
      id: spec.id,
      name: spec.name,
      firstName: spec.firstName,
      lastName: spec.lastName,
      role: spec.role,
      isLocal: false,
      audioEnabled: index !== 0,
      videoEnabled: index !== 1,
      screenSharing: false,
      isSpeaking: false,
      handRaised: false,
      connectionQuality: index % 3 === 0 ? 'fair' : 'good',
      joinedAt: new Date().toISOString(),
    };
    this.participantIds.push(spec.id);
    this.dispatch(participantJoined(participant));
    this.dispatch(
      addMessage({
        id: `meet-sys-${spec.id}-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        content: `${spec.name} joined the meeting`,
        kind: 'system',
        createdAt: new Date().toISOString(),
      }),
    );
    this.later(() => {
      this.dispatch(patchParticipant({ id: spec.id, patch: { videoEnabled: true, audioEnabled: true, connectionQuality: 'excellent' } }));
    }, 2400);
  }

  scheduleSpeaking(): void {
    const active = this.participantIds;
    if (active.length === 0) return;
    const speaker = active[Math.floor(Math.random() * active.length)] ?? active[0]!;

    this.dispatch(patchParticipant({ id: speaker, patch: { isSpeaking: true } }));

    // Keep the local audio meter bumping too, so the UI feels alive.
    const localSpeaking = Math.random() < 0.35;
    if (localSpeaking) {
      this.dispatch(updateLocal({ isSpeaking: true }));
    }

    this.later(() => {
      this.dispatch(patchParticipant({ id: speaker, patch: { isSpeaking: false } }));
      this.dispatch(updateLocal({ isSpeaking: false }));
      this.scheduleSpeaking();
    }, 2600 + Math.random() * 3200);
  }

  scheduleReaction(): void {
    const id = `meet-reaction-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const author = this.participantIds.length > 0
      ? this.participantIds[Math.floor(Math.random() * this.participantIds.length)] ?? 'meet-sarah'
      : 'meet-sarah';
    const reaction: MeetingReaction = {
      id,
      emoji: REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)] ?? '👍',
      userName: author,
      userId: author,
      createdAt: new Date().toISOString(),
    };
    this.dispatch(addReaction(reaction));
    this.later(() => this.dispatch(clearReaction(id)), 2600);
    this.later(() => this.scheduleReaction(), 9000 + Math.random() * 8000);
  }

  scheduleChat(): void {
    const author = this.participantIds[Math.floor(Math.random() * this.participantIds.length)] ?? 'meet-sarah';
    const name =
      DEMO_PARTICIPANTS.find((participant) => participant.id === author)?.name ??
      'Sarah Chen';
    const content = CHAT_LINES[Math.floor(Math.random() * CHAT_LINES.length)] ?? CHAT_LINES[0]!;
    const message: MeetingMessage = {
      id: `meet-msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      senderId: author,
      senderName: name,
      content,
      kind: 'text',
      createdAt: new Date().toISOString(),
    };
    this.dispatch(addMessage(message));
    this.later(() => this.scheduleChat(), 16000 + Math.random() * 14000);
  }

  sampleStats(): StatsSample {
    this.tickCount += 1;
    const jitter = (spread: number): number => Math.round(Math.random() * spread);
    // Occasionally simulate a degraded network.
    const degraded = this.tickCount % 9 === 0;
    return {
      latencyMs: degraded ? 140 + jitter(120) : 24 + jitter(60),
      packetLoss: degraded ? 2.4 + Math.random() * 3 : Math.random() * 0.8,
      bitrateKbps: degraded ? 420 + jitter(300) : 1100 + jitter(1400),
      fps: degraded ? 14 + Math.floor(Math.random() * 8) : 24 + Math.floor(Math.random() * 7),
      resolution: '1280×720',
    };
  }

  tickStats(): void {
    const sample = this.sampleStats();
    const quality: ConnectionQuality =
      sample.latencyMs > 150 || sample.packetLoss > 3
        ? 'poor'
        : sample.latencyMs > 90 || sample.packetLoss > 1.2
          ? 'fair'
          : sample.latencyMs > 55
            ? 'good'
            : 'excellent';

    this.dispatch(
      setStats({
        latencyMs: sample.latencyMs,
        packetLoss: Math.round(sample.packetLoss * 10) / 10,
        bitrateKbps: sample.bitrateKbps,
        fps: sample.fps,
        resolution: sample.resolution,
        connectionType: navigator.onLine ? 'wifi' : 'offline',
        quality,
      }),
    );
    this.dispatch(setConnectionQuality(quality));
  }

  /** Starts the simulation. Safe to call once. */
  start(): void {
    if (this.running) return;
    this.running = true;

    DEMO_PARTICIPANTS.forEach((spec, index) => {
      this.later(() => this.join(spec, index), spec.joinDelayMs);
    });

    this.later(() => this.scheduleSpeaking(), 6000);
    this.later(() => this.scheduleReaction(), 5000);
    this.later(() => this.scheduleChat(), 10000);

    const systemLine = SYSTEM_LINES[0]!;
    this.later(() => {
      this.dispatch(
        addMessage({
          id: `meet-sys-rec-${Date.now()}`,
          senderId: 'system',
          senderName: 'System',
          content: systemLine,
          kind: 'system',
          createdAt: new Date().toISOString(),
        }),
      );
    }, 3000);

    const statsId = window.setInterval(() => this.tickStats(), 2200);
    this.timers.push(statsId);
  }

  /** Stops all timers and marks the simulation dead. */
  stop(): void {
    this.running = false;
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.timers.length = 0;
    this.participantIds.length = 0;
  }

  /** Toggles connection flapping used to demo reconnection UI. */
  simulateDisconnect(durationMs = 3500): void {
    if (!this.running) return;
    this.dispatch(setConnectionStatus('reconnecting'));
    this.later(() => this.dispatch(setConnectionStatus('connected')), durationMs);
  }
}

