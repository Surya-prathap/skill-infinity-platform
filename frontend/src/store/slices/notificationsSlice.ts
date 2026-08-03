import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppNotification } from '@/types';

export interface NotificationsState {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  loading: false,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<AppNotification[]>) {
      state.items = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.read).length;
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = Math.max(0, action.payload);
    },
    addNotification(state, action: PayloadAction<AppNotification>) {
      state.items = [action.payload, ...state.items];
      if (!action.payload.read) state.unreadCount += 1;
    },
    markAsRead(state, action: PayloadAction<string>) {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && !item.read) {
        item.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead(state) {
      state.items = state.items.map((n) => ({ ...n, read: true }));
      state.unreadCount = 0;
    },
    removeNotification(state, action: PayloadAction<string>) {
      const item = state.items.find((n) => n.id === action.payload);
      state.items = state.items.filter((n) => n.id !== action.payload);
      if (item && !item.read) state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    clearNotifications(state) {
      state.items = [];
      state.unreadCount = 0;
    },
    setNotificationsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const {
  setNotifications,
  setUnreadCount,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
  setNotificationsLoading,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
