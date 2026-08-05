import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CreatePostRequest } from '@/types';

/** A post draft captured by the composer ("Draft saving"). */
export interface CommunityDraft {
  key: string;
  payload: Partial<CreatePostRequest>;
  savedAt: string;
}

export interface CommunityLiveEvent {
  id: string;
  kind: 'LIKE' | 'COMMENT' | 'POST' | 'POLL' | 'NOTIFICATION';
  message: string;
  createdAt: string;
}

interface CommunityState {
  drafts: Record<string, CommunityDraft>;
  liveEvents: CommunityLiveEvent[];
}

const initialState: CommunityState = {
  drafts: {},
  liveEvents: [],
};

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    saveDraft: (
      state,
      action: PayloadAction<{ key: string; payload: Partial<CreatePostRequest> }>,
    ) => {
      state.drafts[action.payload.key] = {
        key: action.payload.key,
        payload: action.payload.payload,
        savedAt: new Date().toISOString(),
      };
    },
    clearDraft: (state, action: PayloadAction<string>) => {
      delete state.drafts[action.payload];
    },
    pushLiveEvent: (state, action: PayloadAction<Omit<CommunityLiveEvent, 'id' | 'createdAt'>>) => {
      state.liveEvents = [
        { ...action.payload, id: `evt-${Date.now()}-${state.liveEvents.length}`, createdAt: new Date().toISOString() },
        ...state.liveEvents,
      ].slice(0, 12);
    },
    clearLiveEvents: (state) => {
      state.liveEvents = [];
    },
  },
});

export const { saveDraft, clearDraft, pushLiveEvent, clearLiveEvents } = communitySlice.actions;
export default communitySlice.reducer;
