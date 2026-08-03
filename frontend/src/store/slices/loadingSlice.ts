import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface LoadingState {
  pendingRequests: number;
  pageLoading: boolean;
}

const initialState: LoadingState = {
  pendingRequests: 0,
  pageLoading: false,
};

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    incrementPendingRequests(state) {
      state.pendingRequests += 1;
    },
    decrementPendingRequests(state) {
      state.pendingRequests = Math.max(0, state.pendingRequests - 1);
    },
    setPageLoading(state, action: PayloadAction<boolean>) {
      state.pageLoading = action.payload;
    },
    resetLoading(state) {
      state.pendingRequests = 0;
      state.pageLoading = false;
    },
  },
});

export const {
  incrementPendingRequests,
  decrementPendingRequests,
  setPageLoading,
  resetLoading,
} = loadingSlice.actions;

export default loadingSlice.reducer;
