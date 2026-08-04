import { describe, expect, it } from 'vitest';
import meetingReducer, {
  addMessage,
  addReaction,
  clearReaction,
  endMeeting,
  joinMeeting,
  leaveMeeting,
  participantJoined,
  participantLeft,
  participantUpdated,
  resetMeeting,
  setControl,
  setDevices,
  setDevicesList,
  setLayout,
  setMeeting,
  setMeetingStatus,
  setPinned,
  setSpotlight,
  toggleFullscreen,
  toggleMessagePin,
  updateLocal,
} from '@/store/slices/meetingSlice';
import type { Meeting, MeetingParticipant, MeetingDevice } from '@/types';

const baseMeeting: Meeting = {
  id: 'm-test',
  title: 'Test Meeting',
  kind: 'one-to-one',
  hostId: 'host-1',
  hostName: 'Host User',
  status: 'scheduled',
  createdAt: new Date().toISOString(),
};

const baseParticipant: MeetingParticipant = {
  id: 'user-1',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  role: 'LEARNER',
  isLocal: true,
  audioEnabled: true,
  videoEnabled: true,
  screenSharing: false,
  isSpeaking: false,
  handRaised: false,
  connectionQuality: 'good',
  joinedAt: new Date().toISOString(),
};

describe('meetingSlice', () => {
  const initialState = meetingReducer(undefined, { type: '@@init' });

  it('should return the initial state', () => {
    expect(initialState.meetingId).toBeNull();
    expect(initialState.status).toBe('scheduled');
    expect(initialState.participants).toEqual([]);
  });

  it('should handle setMeeting', () => {
    const state = meetingReducer(initialState, setMeeting(baseMeeting));
    expect(state.meeting).toEqual(baseMeeting);
    expect(state.meetingId).toBe('m-test');
  });

  it('should handle setMeetingStatus', () => {
    const state = meetingReducer(initialState, setMeetingStatus('in-progress'));
    expect(state.status).toBe('in-progress');
    expect(state.startedAt).toBeTruthy();
  });

  it('should handle joinMeeting', () => {
    const state = meetingReducer(initialState, joinMeeting({ meeting: baseMeeting, participant: baseParticipant }));
    expect(state.meetingId).toBe('m-test');
    expect(state.status).toBe('in-progress');
    expect(state.participants).toHaveLength(1);
    expect(state.participants[0]!.isLocal).toBe(true);
    expect(state.connection.status).toBe('connected');
  });

  it('should handle leaveMeeting', () => {
    const joined = meetingReducer(initialState, joinMeeting({ meeting: baseMeeting, participant: baseParticipant }));
    const state = meetingReducer(joined, leaveMeeting());
    expect(state.status).toBe('ended');
    expect(state.controls.micOn).toBe(false);
    expect(state.controls.camOn).toBe(false);
  });

  it('should handle endMeeting', () => {
    const joined = meetingReducer(initialState, joinMeeting({ meeting: baseMeeting, participant: baseParticipant }));
    const state = meetingReducer(joined, endMeeting());
    expect(state.meetingId).toBeNull();
    expect(state.participants).toEqual([]);
    expect(state.messages).toEqual([]);
  });

  it('should handle participantJoined', () => {
    const joined = meetingReducer(initialState, joinMeeting({ meeting: baseMeeting, participant: baseParticipant }));
    const remote: MeetingParticipant = { ...baseParticipant, id: 'remote-1', name: 'Remote', isLocal: false };
    const state = meetingReducer(joined, participantJoined(remote));
    expect(state.participants).toHaveLength(2);
    expect(state.participants[1]!.name).toBe('Remote');
  });

  it('should handle participantLeft', () => {
    const joined = meetingReducer(initialState, joinMeeting({ meeting: baseMeeting, participant: baseParticipant }));
    const state = meetingReducer(joined, participantLeft('user-1'));
    expect(state.participants).toHaveLength(0);
  });

  it('should handle participantUpdated', () => {
    const joined = meetingReducer(initialState, joinMeeting({ meeting: baseMeeting, participant: baseParticipant }));
    const updated: MeetingParticipant = { ...baseParticipant, audioEnabled: false, handRaised: true };
    const state = meetingReducer(joined, participantUpdated(updated));
    expect(state.participants[0]!.audioEnabled).toBe(false);
    expect(state.participants[0]!.handRaised).toBe(true);
  });

  it('should handle updateLocal', () => {
    const joined = meetingReducer(initialState, joinMeeting({ meeting: baseMeeting, participant: baseParticipant }));
    const state = meetingReducer(joined, updateLocal({ isSpeaking: true }));
    expect(state.participants[0]!.isSpeaking).toBe(true);
  });

  it('should handle setLayout', () => {
    const state = meetingReducer(initialState, setLayout('speaker'));
    expect(state.layout).toBe('speaker');
  });

  it('should handle toggleFullscreen', () => {
    const state = meetingReducer(initialState, toggleFullscreen());
    expect(state.fullscreen).toBe(true);
    const toggled = meetingReducer(state, toggleFullscreen());
    expect(toggled.fullscreen).toBe(false);
  });

  it('should handle setControl', () => {
    const state = meetingReducer(initialState, setControl({ key: 'micOn', value: false }));
    expect(state.controls.micOn).toBe(false);
    expect(state.controls.camOn).toBe(true);
  });

  it('should handle setDevices', () => {
    const state = meetingReducer(initialState, setDevices({ audioInput: 'mic-1', videoInput: 'cam-1', audioOutput: 'spk-1' }));
    expect(state.devices.audioInput).toBe('mic-1');
    expect(state.devices.videoInput).toBe('cam-1');
  });

  it('should handle setDevicesList', () => {
    const devices: MeetingDevice[] = [
      { deviceId: 'cam-1', label: 'HD Cam', kind: 'videoinput' },
      { deviceId: 'mic-1', label: 'Built-in Mic', kind: 'audioinput' },
    ];
    const state = meetingReducer(initialState, setDevicesList(devices));
    expect(state.devicesList).toHaveLength(2);
  });

  it('should handle addMessage', () => {
    const state = meetingReducer(initialState, addMessage({
      id: 'msg-1', senderId: 'user-1', senderName: 'User', content: 'Hello', kind: 'text', createdAt: new Date().toISOString(),
    }));
    expect(state.messages).toHaveLength(1);
    expect(state.messages[0]!.content).toBe('Hello');
  });

  it('should increment unreadChat when chat is closed', () => {
    const state = meetingReducer(initialState, addMessage({
      id: 'msg-1', senderId: 'user-1', senderName: 'User', content: 'Hey', kind: 'text', createdAt: new Date().toISOString(),
    }));
    expect(state.unreadChat).toBe(1);
  });

  it('should handle toggleMessagePin', () => {
    const withMsg = meetingReducer(initialState, addMessage({
      id: 'msg-1', senderId: 'user-1', senderName: 'User', content: 'Pin me', kind: 'text', createdAt: new Date().toISOString(),
    }));
    const state = meetingReducer(withMsg, toggleMessagePin('msg-1'));
    expect(state.messages[0]!.pinned).toBe(true);
    const unpinned = meetingReducer(state, toggleMessagePin('msg-1'));
    expect(unpinned.messages[0]!.pinned).toBe(false);
  });

  it('should handle addReaction and clearReaction', () => {
    const state = meetingReducer(initialState, addReaction({
      id: 'r-1', emoji: '👍', userName: 'User', userId: 'user-1', createdAt: new Date().toISOString(),
    }));
    expect(state.reactions).toHaveLength(1);
    const cleared = meetingReducer(state, clearReaction('r-1'));
    expect(cleared.reactions).toHaveLength(0);
  });

  it('should handle setPinned and setSpotlight', () => {
    const state = meetingReducer(initialState, setPinned('user-1'));
    expect(state.pinnedId).toBe('user-1');
    const spotlight = meetingReducer(state, setSpotlight('user-2'));
    expect(spotlight.spotlightId).toBe('user-2');
  });

  it('should handle resetMeeting', () => {
    const joined = meetingReducer(initialState, joinMeeting({ meeting: baseMeeting, participant: baseParticipant }));
    const state = meetingReducer(joined, resetMeeting());
    expect(state.meetingId).toBeNull();
    expect(state.participants).toEqual([]);
    expect(state.messages).toEqual([]);
  });
});