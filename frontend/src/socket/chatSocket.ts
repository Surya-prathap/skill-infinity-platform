import { socketService, SOCKET_EVENTS } from './socket';
import type { AppDispatch } from '@/store';
import {
  messageReceived,
  presenceChanged,
  readReceiptReceived,
  setSocketStatus,
  typingChanged,
} from '@/store/slices/chatSlice';
import { addNotification } from '@/store/slices/notificationsSlice';
import type { ChatMessage, PresenceInfo, SocketStatus, TypingInfo } from '@/types';

/**
 * Real-time chat layer.
 *
 * Wires communication-service events (messages, typing, presence, read
 * receipts, notifications) into Redux. The signed-in user's identity comes
 * from the auth store — never hardcoded.
 */

let bound = false;
let keepAliveInterval: number | null = null;

const toSocketStatus = (connected: boolean, reconnecting = false): SocketStatus => {
  if (connected) return 'connected';
  if (reconnecting) return 'reconnecting';
  return 'disconnected';
};

/** Attach all chat event handlers (idempotent). */
export const connectChatSocket = (
  dispatch: AppDispatch,
  userId: string,
): void => {
  if (bound) return;
  if (!userId) return;
  bound = true;

  const socket = socketService.connect();

  socket.on(SOCKET_EVENTS.CONNECT, () => {
    dispatch(setSocketStatus('connected'));
    // Announce our own presence + fetch the online roster.
    socketService.emit('presence:online', { userId, status: 'online' });
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    dispatch(setSocketStatus('disconnected'));
  });

  socket.on(SOCKET_EVENTS.CONNECT_ERROR, () => {
    dispatch(setSocketStatus(toSocketStatus(socketService.isConnected(), true)));
  });

  socket.on('reconnect_attempt', () => {
    dispatch(setSocketStatus('reconnecting'));
  });

  socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (message: ChatMessage) => {
    dispatch(messageReceived(message));
  });

  socket.on(SOCKET_EVENTS.CHAT_TYPING, (info: TypingInfo) => {
    dispatch(typingChanged(info));
  });

  socket.on(SOCKET_EVENTS.CHAT_READ, (payload: { conversationId: string; messageIds: string[]; readerId: string }) => {
    dispatch(readReceiptReceived(payload));
  });

  socket.on(SOCKET_EVENTS.PRESENCE_ONLINE, (presence: PresenceInfo) => {
    dispatch(presenceChanged(presence));
  });

  socket.on(SOCKET_EVENTS.PRESENCE_OFFLINE, (presence: PresenceInfo) => {
    dispatch(presenceChanged(presence));
  });

  socket.on('notification', (notification) => {
    dispatch(addNotification(notification));
  });

  // Presence keep-alive while connected.
  keepAliveInterval = window.setInterval(() => {
    if (socketService.isConnected()) {
      socketService.emit('presence:online', { userId, status: 'online' });
    }
  }, 25_000);
};

/** Detach chat handlers and close the underlying socket. */
export const disconnectChatSocket = (): void => {
  bound = false;
  if (keepAliveInterval !== null) {
    window.clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
  socketService.disconnect();
};

/* ---------------- Emitters ---------------- */

export const emitTyping = (conversationId: string, isTyping: boolean): void => {
  socketService.emit(SOCKET_EVENTS.CHAT_TYPING, { conversationId, isTyping });
};

export const emitRead = (conversationId: string, messageIds: string[]): void => {
  socketService.emit(SOCKET_EVENTS.CHAT_READ, { conversationId, messageIds });
};

export const emitPresence = (presence: PresenceInfo): void => {
  socketService.emit('presence:online', presence);
};

export const emitMessageSent = (message: ChatMessage): void => {
  socketService.emit(SOCKET_EVENTS.CHAT_MESSAGE, message);
};

export const isSocketConnected = (): boolean => socketService.isConnected();
