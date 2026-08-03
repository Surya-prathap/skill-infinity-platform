import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ThemeMode } from '@/types';

export interface ThemeState {
  mode: ThemeMode;
}

const getInitialMode = (): ThemeMode => {
  const stored = window.localStorage.getItem('skill_theme_mode');
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
};

const initialState: ThemeState = {
  mode: getInitialMode(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
    toggleThemeMode(state, action: PayloadAction<'light' | 'dark'>) {
      state.mode = action.payload === 'light' ? 'dark' : 'light';
    },
  },
});

export const { setThemeMode, toggleThemeMode } = themeSlice.actions;

export default themeSlice.reducer;
