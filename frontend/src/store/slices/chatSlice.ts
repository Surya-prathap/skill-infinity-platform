import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  ChatMessage,
  Conversation,
  PresenceInfo,
  SocketStatus,
  TypingInfo,
} from '@/types';

export interface ChatState {
  conversations: Conversation[];
  /** Messages per conversation, kept ascending by createdAt. */
  messages: Record<string, ChatMessage[]>;
  activeConversationId: string | null;
  /** Active typing sessions, keyed by conversationId. */
  typing: Record<string, TypingInfo[]>;
  presence: Record<string, PresenceInfo>;
  unreadCounts: Record<string, number>;
  socketStatus: SocketStatus;
  ownPresence: PresenceInfo;
  /** Real signed-in user id (set from the auth store — no demo constants). */
  ownUserId: string;
  ownUserName: string;
}

const initialState: ChatState = {
  conversations: [],
  messages: {},
  activeConversationId: null,
  typing: {},
  presence: {},
  unreadCounts: {},
  socketStatus: 'disconnected',
  ownPresence: {
    userId: '',
    status: 'online',
    customStatus: 'Ready to learn',
    device: 'web',
  },
  ownUserId: '',
  ownUserName: '',
};

/* ---------------- helpers ---------------- */

const byCreatedAtAsc = (a: ChatMessage, b: ChatMessage): number =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

const upsertMessage = (list: ChatMessage[], message: ChatMessage): ChatMessage[] => {
  const exists = list.some((item) => item.id === message.id);
  if (exists) return list.map((item) => (item.id === message.id ? message : item));
  return [...list, message].sort(byCreatedAtAsc);
};

const sortConversations = (list: Conversation[]): Conversation[] =>
  [...list].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

const updateConversationPreview = (conversations: Conversation[], message: ChatMessage): Conversation[] => {
  const list = conversations.map((conversation) =>
    conversation.id === message.conversationId
      ? { ...conversation, lastMessage: message, updatedAt: message.createdAt }
      : conversation,
  );
  return sortConversations(list);
};

/* ---------------- slice ---------------- */

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setOwnIdentity(state, action: PayloadAction<{ userId: string; userName: string }>) {
      const { userId, userName } = action.payload;
      state.ownUserId = userId;
      state.ownUserName = userName;
      state.ownPresence = { ...state.ownPresence, userId };
      state.presence = { ...state.presence, [userId]: state.ownPresence };
    },

    hydrateConversations(state, action: PayloadAction<Conversation[]>) {
      state.conversations = sortConversations(action.payload);
      const unread: Record<string, number> = {};
      action.payload.forEach((conversation) => {
        unread[conversation.id] = conversation.unreadCount ?? 0;
      });
      state.unreadCounts = { ...state.unreadCounts, ...unread };
    },

    hydrateMessages(state, action: PayloadAction<{ conversationId: string; messages: ChatMessage[] }>) {
      const { conversationId, messages } = action.payload;
      const existing = state.messages[conversationId] ?? [];
      const merged = [...existing];
      messages.forEach((item) => {
        if (!merged.some((m) => m.id === item.id)) merged.push(item);
      });
      merged.sort(byCreatedAtAsc);
      state.messages[conversationId] = merged;
    },

    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
    },

    updateConversation(state, action: PayloadAction<Partial<Conversation> & { id: string }>) {
      state.conversations = state.conversations.map((conversation) =>
        conversation.id === action.payload.id
          ? { ...conversation, ...action.payload }
          : conversation,
      );
    },

    messageReceived(state, action: PayloadAction<ChatMessage>) {
      const message = action.payload;
      state.messages[message.conversationId] = upsertMessage(
        state.messages[message.conversationId] ?? [],
        message,
      );
      state.conversations = updateConversationPreview(state.conversations, message);
      if (
        message.conversationId !== state.activeConversationId &&
        state.ownUserId &&
        message.senderId !== state.ownUserId
      ) {
        state.unreadCounts[message.conversationId] =
          (state.unreadCounts[message.conversationId] ?? 0) + 1;
      }
    },

    messageSentOptimistic(state, action: PayloadAction<ChatMessage>) {
      const message = action.payload;
      state.messages[message.conversationId] = upsertMessage(
        state.messages[message.conversationId] ?? [],
        message,
      );
      state.conversations = updateConversationPreview(state.conversations, message);
    },

    messageAck(state, action: PayloadAction<{ tempId: string; message: ChatMessage }>) {
      const { tempId, message } = action.payload;
      const list = state.messages[message.conversationId];
      if (!list) return;
      if (list.some((item) => item.id === tempId)) {
        state.messages[message.conversationId] = list
          .map((item) => (item.id === tempId ? { ...message, id: message.id } : item))
          .sort(byCreatedAtAsc);
      } else {
        state.messages[message.conversationId] = upsertMessage(list, message);
      }
      state.conversations = updateConversationPreview(state.conversations, message);
    },

    messageSendFailed(state, action: PayloadAction<{ conversationId: string; tempId: string }>) {
      const { conversationId, tempId } = action.payload;
      const list = state.messages[conversationId] ?? [];
      state.messages[conversationId] = list.map((item) =>
        item.id === tempId ? { ...item, status: 'failed' } : item,
      );
    },

    messageUpdated(state, action: PayloadAction<ChatMessage>) {
      const message = action.payload;
      const list = state.messages[message.conversationId] ?? [];
      state.messages[message.conversationId] = list.map((item) =>
        item.id === message.id ? { ...item, ...message, edited: true } : item,
      );
    },

    messageDeleted(state, action: PayloadAction<{ conversationId: string; messageId: string }>) {
      const { conversationId, messageId } = action.payload;
      const list = state.messages[conversationId] ?? [];
      state.messages[conversationId] = list.map((item) =>
        item.id === messageId
          ? {
              ...item,
              deleted: true,
              content: 'This message was deleted.',
              attachments: [],
              reactions: [],
              kind: 'text',
            }
          : item,
      );
    },

    messageReacted(
      state,
      action: PayloadAction<{ conversationId: string; messageId: string; emoji: string }>,
    ) {
      const { conversationId, messageId, emoji } = action.payload;
      const ownId = state.ownUserId;
      const list = state.messages[conversationId] ?? [];
      state.messages[conversationId] = list.map((item) => {
        if (item.id !== messageId) return item;
        const reactions = [...(item.reactions ?? [])];
        const existing = reactions.find((reaction) => reaction.emoji === emoji);
        if (existing) {
          if (existing.reactedByMe) {
            const next = {
              ...existing,
              count: Math.max(0, existing.count - 1),
              reactedByMe: false,
              userIds: existing.userIds.filter((id) => id !== ownId),
            };
            return {
              ...item,
              reactions: next.count === 0 ? reactions.filter((r) => r.emoji !== emoji) : reactions.map((r) => (r.emoji === emoji ? next : r)),
            };
          }
          const next = {
            ...existing,
            count: existing.count + 1,
            reactedByMe: true,
            userIds: [...existing.userIds, ownId],
          };
          return { ...item, reactions: reactions.map((r) => (r.emoji === emoji ? next : r)) };
        }
        return {
          ...item,
          reactions: [...reactions, { emoji, count: 1, reactedByMe: true, userIds: [ownId] }],
        };
      });
    },

    messagePinned(
      state,
      action: PayloadAction<{ conversationId: string; messageId: string; pinned: boolean }>,
    ) {
      const { conversationId, messageId, pinned } = action.payload;
      const list = state.messages[conversationId] ?? [];
      state.messages[conversationId] = list.map((item) =>
        item.id === messageId ? { ...item, pinned } : item,
      );
    },

    messageBookmarked(
      state,
      action: PayloadAction<{ conversationId: string; messageId: string; bookmarked: boolean }>,
    ) {
      const { conversationId, messageId, bookmarked } = action.payload;
      const list = state.messages[conversationId] ?? [];
      state.messages[conversationId] = list.map((item) =>
        item.id === messageId ? { ...item, bookmarked } : item,
      );
    },

    typingChanged(state, action: PayloadAction<TypingInfo>) {
      const info = action.payload;
      const list = state.typing[info.conversationId] ?? [];
      const without = list.filter((item) => item.userId !== info.userId);
      if (info.isTyping) {
        state.typing[info.conversationId] = [...without, info];
      } else {
        state.typing[info.conversationId] = without;
        if (without.length === 0) delete state.typing[info.conversationId];
      }
    },

    presenceChanged(state, action: PayloadAction<PresenceInfo>) {
      const presence = action.payload;
      state.presence = {
        ...state.presence,
        [presence.userId]: { ...state.presence[presence.userId], ...presence },
      };
    },

    presenceBatch(state, action: PayloadAction<PresenceInfo[]>) {
      const batch = { ...state.presence };
      action.payload.forEach((presence) => {
        batch[presence.userId] = { ...batch[presence.userId], ...presence };
      });
      state.presence = batch;
    },

    readReceiptReceived(
      state,
      action: PayloadAction<{ conversationId: string; messageIds: string[]; readerId: string }>,
    ) {
      const { conversationId, messageIds, readerId } = action.payload;
      const ownId = state.ownUserId;
      const list = state.messages[conversationId] ?? [];
      state.messages[conversationId] = list.map((item) => {
        if (!messageIds.includes(item.id)) return item;
        const readBy = [...(item.readBy ?? [])];
        if (!readBy.includes(readerId)) readBy.push(readerId);
        const next: ChatMessage = { ...item, readBy };
        if (ownId && item.senderId === ownId) {
          next.status = 'read';
        }
        return next;
      });
    },

    markConversationRead(state, action: PayloadAction<string>) {
      const conversationId = action.payload;
      const ownId = state.ownUserId;
      state.unreadCounts[conversationId] = 0;
      const list = state.messages[conversationId] ?? [];
      state.messages[conversationId] = list.map((item) =>
        ownId && item.senderId === ownId && item.status !== 'read'
          ? { ...item, status: 'read', readBy: [...new Set([...(item.readBy ?? []), ownId])] }
          : item,
      );
      state.conversations = state.conversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation,
      );
    },

    setSocketStatus(state, action: PayloadAction<SocketStatus>) {
      state.socketStatus = action.payload;
    },

    setOwnPresence(state, action: PayloadAction<PresenceInfo>) {
      state.ownPresence = action.payload;
      if (state.ownUserId) {
        state.presence = { ...state.presence, [state.ownUserId]: action.payload };
      }
    },

    clearChat(state) {
      state.conversations = [];
      state.messages = {};
      state.activeConversationId = null;
      state.typing = {};
      state.presence = {};
      state.unreadCounts = {};
      state.socketStatus = 'disconnected';
      state.ownPresence = { ...state.ownPresence, userId: state.ownUserId };
    },
  },
});

export const {
  setOwnIdentity,
  hydrateConversations,
  hydrateMessages,
  setActiveConversation,
  updateConversation,
  messageReceived,
  messageSentOptimistic,
  messageAck,
  messageSendFailed,
  messageUpdated,
  messageDeleted,
  messageReacted,
  messagePinned,
  messageBookmarked,
  typingChanged,
  presenceChanged,
  presenceBatch,
  readReceiptReceived,
  markConversationRead,
  setSocketStatus,
  setOwnPresence,
  clearChat,
} = chatSlice.actions;

/** Convenience: build a locally optimistically-sent message for the real user. */
export const buildLocalMessage = (
  conversationId: string,
  content: string,
  identity: { userId: string; userName: string },
  extra: Partial<ChatMessage> = {},
): ChatMessage => ({
  id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  conversationId,
  senderId: identity.userId,
  senderName: identity.userName,
  content,
  kind: 'text',
  attachments: [],
  reactions: [],
  status: 'sending',
  createdAt: new Date().toISOString(),
  replyTo: null,
  readBy: identity.userId ? [identity.userId] : [],
  ...extra,
});

export default chatSlice.reducer;
