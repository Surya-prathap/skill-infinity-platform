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
import { CURRENT_USER_ID, DEMO_THINKING_REPLIES } from '@/features/communication/data';
import type { ChatMessage, PresenceInfo, SocketStatus, TypingInfo } from '@/types';

/**
 * Real-time chat layer.
 *
 * Wires communication-service events (messages, typing, presence, read
 * receipts, notifications) into Redux. When the socket is unavailable the
 * REST layer + seed data keep the UI fully functional, and `simulatePeerReply`
 * provides a lifelike offline companion.
 */

let bound = false;
let keepAliveInterval: number | null = null;

const toSocketStatus = (connected: boolean, reconnecting = false): SocketStatus => {
  if (connected) return 'connected';
  if (reconnecting) return 'reconnecting';
  return 'disconnected';
};

/** Attach all chat event handlers (idempotent). */
export const connectChatSocket = (dispatch: AppDispatch): void => {
  if (bound) return;
  bound = true;

  const socket = socketService.connect();

  socket.on(SOCKET_EVENTS.CONNECT, () => {
    dispatch(setSocketStatus('connected'));
    // Announce our own presence + fetch the online roster.
    socketService.emit('presence:online', { userId: CURRENT_USER_ID, status: 'online' });
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
      socketService.emit('presence:online', { userId: CURRENT_USER_ID, status: 'online' });
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

/* ---------------- Offline companion (demo) ---------------- */

let simulationId = 0;

/**
 * Simulates the peer typing and replying when the socket is disconnected,
 * so the Communication Center feels alive without a backend. Returns a
 * cancel function.
 */
export const simulatePeerReply = (
  dispatch: AppDispatch,
  conversationId: string,
  peer: { userId: string; name: string },
  content: string,
  delayMs = 1600,
): (() => void) => {
  const id = ++simulationId;
  const timers: number[] = [];

  const typingStart: TypingInfo = {
    conversationId,
    userId: peer.userId,
    userName: peer.name,
    isTyping: true,
    expiresAt: new Date(Date.now() + 4000).toISOString(),
  };

  const thinkingDelay = 500 + (id % 3) * 350;

  timers.push(
    window.setTimeout(() => {
      dispatch(typingChanged({ ...typingStart, isTyping: true }));
    }, Math.max(200, delayMs - thinkingDelay)),
  );

  timers.push(
    window.setTimeout(() => {
      dispatch(typingChanged({ ...typingStart, isTyping: false }));
      // The peer has read our latest messages.
      dispatch(
        readReceiptReceived({
          conversationId,
          messageIds: [],
          readerId: peer.userId,
        }),
      );
      const reply: ChatMessage = {
        id: `peer-${Date.now()}-${id}`,
        conversationId,
        senderId: peer.userId,
        senderName: peer.name,
        content,
        kind: 'text',
        attachments: [],
        reactions: [],
        status: 'delivered',
        createdAt: new Date().toISOString(),
        replyTo: null,
        readBy: [peer.userId, CURRENT_USER_ID],
      };
      dispatch(messageReceived(reply));
    }, delayMs),
  );

  return () => timers.forEach((timer) => window.clearTimeout(timer));
};

/** Canned “thinking” line used before an offline peer reply. */
export const pickThinkingLine = (): string =>
  DEMO_THINKING_REPLIES[Math.floor(Math.random() * DEMO_THINKING_REPLIES.length)] ?? 'Typing…';
