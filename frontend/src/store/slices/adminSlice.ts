import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FlagEnvironment } from '@/types';

interface AdminState {
  /** Whether the admin sidebar is collapsed on desktop. */
  sidebarCollapsed: boolean;
  /** Environment label shown in the admin header. */
  environment: FlagEnvironment;
}

const initialState: AdminState = {
  sidebarCollapsed: false,
  environment: 'production',
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebarCollapsed(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setEnvironment(state, action: PayloadAction<FlagEnvironment>) {
      state.environment = action.payload;
    },
  },
});

export const { setSidebarCollapsed, toggleSidebarCollapsed, setEnvironment } = adminSlice.actions;
export default adminSlice.reducer;
