import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  sessionReminders: boolean;
  marketingEmails: boolean;
}

const initialState: SettingsState = {
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
  emailNotifications: true,
  pushNotifications: true,
  sessionReminders: true,
  marketingEmails: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings(state, action: PayloadAction<Partial<SettingsState>>) {
      Object.assign(state, action.payload);
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
    setTimezone(state, action: PayloadAction<string>) {
      state.timezone = action.payload;
    },
    resetSettings(state) {
      Object.assign(state, initialState);
    },
  },
});

export const { updateSettings, setLanguage, setTimezone, resetSettings } = settingsSlice.actions;

export default settingsSlice.reducer;
