import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import type { Role } from '@/types';

/* ---------------- Auth ---------------- */
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectUser = (state: RootState) => state.auth.user;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectRememberMe = (state: RootState) => state.auth.rememberMe;

export const selectIsAuthenticated = (state: RootState) =>
  state.auth.status === 'authenticated' && Boolean(state.auth.accessToken);

export const selectUserRoles = createSelector(
  [(state: RootState) => state.auth.user],
  (user) => user?.roles ?? ([] as Role[]),
);

export const selectHasRole = (roles: Role[]) => (state: RootState): boolean => {
  const userRoles = state.auth.user?.roles ?? [];
  return roles.some((role) => userRoles.includes(role));
};

export const selectIsAdmin = (state: RootState) => selectHasRole(['ROLE_ADMIN'])(state);
export const selectIsMentor = (state: RootState) => selectHasRole(['ROLE_MENTOR'])(state);
export const selectIsLearner = (state: RootState) => selectHasRole(['ROLE_LEARNER'])(state);

/* ---------------- User ---------------- */
export const selectUserProfile = (state: RootState) => state.user.profile;
export const selectUserProfileLoading = (state: RootState) => state.user.loading;

/* ---------------- Theme ---------------- */
export const selectThemeMode = (state: RootState) => state.theme.mode;

export const selectResolvedThemeMode = (state: RootState): 'light' | 'dark' => {
  const mode = state.theme.mode;
  if (mode === 'system') {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  return mode;
};

/* ---------------- Notifications ---------------- */
export const selectNotifications = (state: RootState) => state.notifications.items;
export const selectUnreadCount = (state: RootState) => state.notifications.unreadCount;
export const selectNotificationsLoading = (state: RootState) => state.notifications.loading;

/* ---------------- Settings ---------------- */
export const selectSettings = (state: RootState) => state.settings;
export const selectLanguage = (state: RootState) => state.settings.language;
export const selectTimezone = (state: RootState) => state.settings.timezone;

/* ---------------- Mentor wizard ---------------- */
export const selectMentorStep = (state: RootState) => state.mentor.step;
export const selectMentorDraft = (state: RootState) => state.mentor.draft;
export const selectMentorSubmitted = (state: RootState) => state.mentor.submitted;

/* ---------------- Loading ---------------- */
export const selectGlobalLoading = (state: RootState) => state.loading.pendingRequests > 0;
export const selectPageLoading = (state: RootState) => state.loading.pageLoading;

/* ---------------- Chat / Communication ---------------- */
export const selectChatConversations = (state: RootState) => state.chat.conversations;
export const selectChatActiveConversationId = (state: RootState) => state.chat.activeConversationId;
export const selectChatMessages = (state: RootState) => state.chat.messages;
export const selectChatTyping = (state: RootState) => state.chat.typing;
export const selectChatPresence = (state: RootState) => state.chat.presence;
export const selectChatUnreadCounts = (state: RootState) => state.chat.unreadCounts;
export const selectSocketStatus = (state: RootState) => state.chat.socketStatus;
export const selectOwnPresence = (state: RootState) => state.chat.ownPresence;

export const selectChatActiveConversation = createSelector(
  [selectChatConversations, selectChatActiveConversationId],
  (conversations, activeId) =>
    activeId ? conversations.find((conversation) => conversation.id === activeId) ?? null : null,
);

export const selectMessagesForConversation = createSelector(
  [selectChatMessages, (_: RootState, conversationId: string) => conversationId],
  (messages, conversationId) => messages[conversationId] ?? [],
);

export const selectTypingForConversation = createSelector(
  [selectChatTyping, (_: RootState, conversationId: string) => conversationId],
  (typing, conversationId) => typing[conversationId] ?? [],
);

export const selectPresenceForUser = createSelector(
  [selectChatPresence, (_: RootState, userId: string) => userId],
  (presence, userId) => presence[userId] ?? null,
);

export const selectTotalUnread = createSelector([selectChatUnreadCounts], (unreadCounts) =>
  Object.values(unreadCounts).reduce((sum, count) => sum + count, 0),
);

export const selectUnreadForConversation = createSelector(
  [selectChatUnreadCounts, (_: RootState, conversationId: string) => conversationId],
  (unreadCounts, conversationId) => unreadCounts[conversationId] ?? 0,
);

/* ---------------- Meeting ---------------- */
export const selectMeeting = (state: RootState) => state.meeting.meeting;
export const selectMeetingId = (state: RootState) => state.meeting.meetingId;
export const selectMeetingStatus = (state: RootState) => state.meeting.status;
export const selectMeetingParticipants = (state: RootState) => state.meeting.participants;
export const selectMeetingLayout = (state: RootState) => state.meeting.layout;
export const selectMeetingFullscreen = (state: RootState) => state.meeting.fullscreen;
export const selectMeetingControls = (state: RootState) => state.meeting.controls;
export const selectMeetingDevices = (state: RootState) => state.meeting.devices;
export const selectMeetingDevicesList = (state: RootState) => state.meeting.devicesList;
export const selectMeetingConnection = (state: RootState) => state.meeting.connection;
export const selectMeetingStats = (state: RootState) => state.meeting.stats;
export const selectMeetingMessages = (state: RootState) => state.meeting.messages;
export const selectMeetingReactions = (state: RootState) => state.meeting.reactions;
export const selectMeetingPinnedId = (state: RootState) => state.meeting.pinnedId;
export const selectMeetingSpotlightId = (state: RootState) => state.meeting.spotlightId;
export const selectMeetingStartedAt = (state: RootState) => state.meeting.startedAt;
export const selectMeetingUnreadChat = (state: RootState) => state.meeting.unreadChat;
export const selectMeetingError = (state: RootState) => state.meeting.error;

export const selectLocalParticipant = createSelector(
  [selectMeetingParticipants],
  (participants) => participants.find((participant) => participant.isLocal) ?? null,
);

export const selectSpeakingParticipants = createSelector(
  [selectMeetingParticipants],
  (participants) => participants.filter((participant) => participant.isSpeaking),
);

export const selectScreenSharingParticipant = createSelector(
  [selectMeetingParticipants],
  (participants) =>
    participants.find((participant) => participant.screenSharing) ?? null,
);
