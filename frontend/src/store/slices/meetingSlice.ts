import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  CallStats,
  ConnectionQuality,
  Meeting,
  MeetingDevice,
  MeetingDeviceSelection,
  MeetingError,
  MeetingLayout,
  MeetingMessage,
  MeetingParticipant,
  MeetingReaction,
  MeetingStatus,
} from '@/types';

export interface MeetingControls {
  micOn: boolean;
  camOn: boolean;
  screenSharing: boolean;
  handRaised: boolean;
  recording: boolean;
  captionsOn: boolean;
  pip: boolean;
  statsOpen: boolean;
  chatOpen: boolean;
  participantsOpen: boolean;
  reactionsOpen: boolean;
  settingsOpen: boolean;
}

export interface MeetingState {
  meetingId: string | null;
  meeting: Meeting | null;
  status: MeetingStatus;
  participants: MeetingParticipant[];
  layout: MeetingLayout;
  fullscreen: boolean;
  controls: MeetingControls;
  devices: MeetingDeviceSelection;
  devicesList: MeetingDevice[];
  connection: { status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting'; quality: ConnectionQuality };
  stats: CallStats;
  messages: MeetingMessage[];
  reactions: MeetingReaction[];
  pinnedId: string | null;
  spotlightId: string | null;
  startedAt: string | null;
  unreadChat: number;
  error: MeetingError | null;
}

const initialStats: CallStats = {
  latencyMs: 0,
  packetLoss: 0,
  bitrateKbps: 0,
  fps: 0,
  resolution: '—',
  connectionType: 'wifi',
  quality: 'good',
};

const initialState: MeetingState = {
  meetingId: null,
  meeting: null,
  status: 'scheduled',
  participants: [],
  layout: 'gallery',
  fullscreen: false,
  controls: {
    micOn: true,
    camOn: true,
    screenSharing: false,
    handRaised: false,
    recording: false,
    captionsOn: false,
    pip: false,
    statsOpen: false,
    chatOpen: false,
    participantsOpen: false,
    reactionsOpen: false,
    settingsOpen: false,
  },
  devices: { audioInput: 'default', audioOutput: 'default', videoInput: 'default' },
  devicesList: [],
  connection: { status: 'disconnected', quality: 'good' },
  stats: initialStats,
  messages: [],
  reactions: [],
  pinnedId: null,
  spotlightId: null,
  startedAt: null,
  unreadChat: 0,
  error: null,
};

const patchLocal = (state: MeetingState, patch: Partial<MeetingParticipant>): void => {
  state.participants = state.participants.map((participant) =>
    participant.isLocal ? { ...participant, ...patch } : participant,
  );
};

const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    setMeeting(state, action: PayloadAction<Meeting>) {
      state.meeting = action.payload;
      state.meetingId = action.payload.id;
      state.error = null;
    },

    setMeetingStatus(state, action: PayloadAction<MeetingStatus>) {
      state.status = action.payload;
      if (action.payload === 'in-progress' && !state.startedAt) {
        state.startedAt = new Date().toISOString();
      }
    },

    joinMeeting(state, action: PayloadAction<{ meeting: Meeting; participant: MeetingParticipant }>) {
      const { meeting, participant } = action.payload;
      state.meeting = meeting;
      state.meetingId = meeting.id;
      state.participants = [participant];
      state.status = 'in-progress';
      state.startedAt = new Date().toISOString();
      state.connection.status = 'connected';
      state.error = null;
    },

    leaveMeeting(state) {
      state.status = 'ended';
      state.connection.status = 'disconnected';
      state.controls = { ...state.controls, micOn: false, camOn: false, screenSharing: false, handRaised: false, recording: false, statsOpen: false, settingsOpen: false, participantsOpen: false, chatOpen: false };
    },

    endMeeting(state) {
      state.meeting = null;
      state.meetingId = null;
      state.status = 'ended';
      state.participants = [];
      state.messages = [];
      state.reactions = [];
      state.unreadChat = 0;
      state.startedAt = null;
      state.connection.status = 'disconnected';
      state.error = null;
    },

    participantJoined(state, action: PayloadAction<MeetingParticipant>) {
      if (state.participants.some((participant) => participant.id === action.payload.id)) return;
      state.participants = [...state.participants, action.payload];
    },

    participantLeft(state, action: PayloadAction<string>) {
      state.participants = state.participants.filter((participant) => participant.id !== action.payload);
      if (state.pinnedId === action.payload) state.pinnedId = null;
      if (state.spotlightId === action.payload) state.spotlightId = null;
    },

    participantUpdated(state, action: PayloadAction<MeetingParticipant>) {
      const incoming = action.payload;
      state.participants = state.participants.map((participant) =>
        participant.id === incoming.id
          ? { ...participant, ...incoming, isLocal: participant.isLocal }
          : participant,
      );
    },

    patchParticipant(state, action: PayloadAction<{ id: string; patch: Partial<MeetingParticipant> }>) {
      const { id, patch } = action.payload;
      // Drop undefined fields so partial signaling payloads never clobber live state.
      const cleanPatch = Object.fromEntries(
        Object.entries(patch).filter(([, value]) => value !== undefined),
      ) as Partial<MeetingParticipant>;
      state.participants = state.participants.map((participant) =>
        participant.id === id ? { ...participant, ...cleanPatch, isLocal: participant.isLocal } : participant,
      );
    },

    updateLocal(state, action: PayloadAction<Partial<MeetingParticipant>>) {
      patchLocal(state, action.payload);
    },

    setLayout(state, action: PayloadAction<MeetingLayout>) {
      state.layout = action.payload;
    },

    toggleFullscreen(state) {
      state.fullscreen = !state.fullscreen;
    },

    setControl(state, action: PayloadAction<{ key: keyof MeetingControls; value: boolean }>) {
      state.controls[action.payload.key] = action.payload.value;
    },

    setDevices(state, action: PayloadAction<Partial<MeetingDeviceSelection>>) {
      state.devices = { ...state.devices, ...action.payload };
    },

    setDevicesList(state, action: PayloadAction<MeetingDevice[]>) {
      state.devicesList = action.payload;
    },

    setConnectionStatus(state, action: PayloadAction<MeetingState['connection']['status']>) {
      state.connection.status = action.payload;
    },

    setConnectionQuality(state, action: PayloadAction<ConnectionQuality>) {
      state.connection.quality = action.payload;
      // Auto-recover only from non-reconnecting states so a deliberate
      // reconnection demo (or a real outage) is not instantly overridden.
      if (
        (action.payload === 'excellent' || action.payload === 'good') &&
        state.connection.status !== 'reconnecting'
      ) {
        state.connection.status = 'connected';
      }
    },

    setStats(state, action: PayloadAction<Partial<CallStats>>) {
      state.stats = { ...state.stats, ...action.payload };
    },

    addMessage(state, action: PayloadAction<MeetingMessage>) {
      state.messages = [...state.messages, action.payload];
      if (!state.controls.chatOpen && action.payload.kind !== 'system') {
        state.unreadChat += 1;
      }
    },

    openChat(state) {
      state.controls.chatOpen = true;
      state.unreadChat = 0;
    },

    closeChat(state) {
      state.controls.chatOpen = false;
    },

    toggleMessagePin(state, action: PayloadAction<string>) {
      state.messages = state.messages.map((message) =>
        message.id === action.payload ? { ...message, pinned: !message.pinned } : message,
      );
    },

    reactToMessage(state, action: PayloadAction<{ messageId: string; emoji: string }>) {
      state.messages = state.messages.map((message) => {
        if (message.id !== action.payload.messageId) return message;
        const reactions = [...(message.reactions ?? [])];
        return {
          ...message,
          reactions: reactions.includes(action.payload.emoji)
            ? reactions.filter((emoji) => emoji !== action.payload.emoji)
            : [...reactions, action.payload.emoji],
        };
      });
    },

    addReaction(state, action: PayloadAction<MeetingReaction>) {
      state.reactions = [...state.reactions, action.payload].slice(-40);
    },

    clearReaction(state, action: PayloadAction<string>) {
      state.reactions = state.reactions.filter((reaction) => reaction.id !== action.payload);
    },

    setPinned(state, action: PayloadAction<string | null>) {
      state.pinnedId = action.payload;
    },

    setSpotlight(state, action: PayloadAction<string | null>) {
      state.spotlightId = action.payload;
    },

    setMeetingError(state, action: PayloadAction<MeetingError | null>) {
      state.error = action.payload;
    },

    resetMeeting() {
      return initialState;
    },
  },
});

export const {
  setMeeting,
  setMeetingStatus,
  joinMeeting,
  leaveMeeting,
  endMeeting,
  participantJoined,
  participantLeft,
  participantUpdated,
  patchParticipant,
  updateLocal,
  setLayout,
  toggleFullscreen,
  setControl,
  setDevices,
  setDevicesList,
  setConnectionStatus,
  setConnectionQuality,
  setStats,
  addMessage,
  openChat,
  closeChat,
  toggleMessagePin,
  reactToMessage,
  addReaction,
  clearReaction,
  setPinned,
  setSpotlight,
  setMeetingError,
  resetMeeting,
} = meetingSlice.actions;

export default meetingSlice.reducer;
