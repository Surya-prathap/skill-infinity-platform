import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AdminState {
  /** Whether the admin sidebar is collapsed on desktop. */
  sidebarCollapsed: boolean;
}

const initialState: AdminState = {
  sidebarCollapsed: false,
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
  },
});

export const { setSidebarCollapsed, toggleSidebarCollapsed } = adminSlice.actions;
export default adminSlice.reducer;
