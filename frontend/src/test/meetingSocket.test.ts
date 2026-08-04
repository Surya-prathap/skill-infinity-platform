import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MEETING_EVENTS,
  emitMeetingJoin,
  emitMeetingLeave,
  emitMeetingState,
  emitMeetingSignal,
} from '@/socket/meetingSocket';
import { socketService } from '@/socket/socket';

vi.mock('@/socket/socket', () => ({
  socketService: {
    emit: vi.fn(),
    off: vi.fn(),
    connect: vi.fn(() => ({
      on: vi.fn(),
      off: vi.fn(),
    })),
    isConnected: vi.fn(() => false),
  },
}));

describe('meetingSocket', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('exports MEETING_EVENTS constants', () => {
    expect(MEETING_EVENTS.JOIN).toBe('meeting:join');
    expect(MEETING_EVENTS.LEAVE).toBe('meeting:leave');
    expect(MEETING_EVENTS.STATE).toBe('meeting:state');
    expect(MEETING_EVENTS.SIGNAL).toBe('meeting:signal');
    expect(MEETING_EVENTS.REACTION).toBe('meeting:reaction');
  });

  it('emitMeetingJoin calls socketService.emit with correct payload', () => {
    const participant = {
      id: 'user-1', name: 'Alex', role: 'LEARNER' as const, isLocal: true,
      audioEnabled: true, videoEnabled: true, screenSharing: false,
      isSpeaking: false, handRaised: false, connectionQuality: 'good' as const,
    };
    emitMeetingJoin('meeting-1', participant);
    expect(socketService.emit).toHaveBeenCalledWith('meeting:join', {
      meetingId: 'meeting-1',
      participant,
    });
  });

  it('emitMeetingLeave calls socketService.emit with meetingId and participantId', () => {
    emitMeetingLeave('meeting-1', 'user-1');
    expect(socketService.emit).toHaveBeenCalledWith('meeting:leave', {
      meetingId: 'meeting-1',
      participantId: 'user-1',
    });
  });

  it('emitMeetingState calls socketService.emit with state payload', () => {
    emitMeetingState('meeting-1', 'user-1', { audioEnabled: false });
    expect(socketService.emit).toHaveBeenCalledWith('meeting:state', {
      meetingId: 'meeting-1',
      participantId: 'user-1',
      audioEnabled: false,
    });
  });

  it('emitMeetingSignal calls socketService.emit with signal payload', () => {
    emitMeetingSignal('meeting-1', 'from-1', { toId: 'to-1', type: 'offer', data: { sdp: 'test' } });
    expect(socketService.emit).toHaveBeenCalledWith('meeting:signal', {
      meetingId: 'meeting-1',
      fromId: 'from-1',
      toId: 'to-1',
      type: 'offer',
      data: { sdp: 'test' },
    });
  });
});