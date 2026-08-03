import { io, type Socket } from 'socket.io-client';
import { APP_CONFIG } from '@/config';
import { tokenManager } from '@/api';

/**
 * Socket.IO preparation layer.
 * Business events (chat, notifications, presence) will be wired on top of
 * this service when the communication-service features are implemented.
 */

/** Domain event names the app listens for (architecture blueprint). */
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  // Notifications
  NOTIFICATION: 'notification',
  NOTIFICATION_READ: 'notification:read',
  // Chat
  CHAT_MESSAGE: 'chat:message',
  CHAT_TYPING: 'chat:typing',
  CHAT_READ: 'chat:read',
  // Presence
  PRESENCE_ONLINE: 'presence:online',
  PRESENCE_OFFLINE: 'presence:offline',
} as const;

let socket: Socket | null = null;

export const socketService = {
  /** Connect (or reuse) the socket with the current access token. */
  connect(): Socket {
    if (socket?.connected) return socket;
    socket = io(APP_CONFIG.socketUrl, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      auth: (cb) => cb({ token: tokenManager.getAccessToken() }),
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    socket.on(SOCKET_EVENTS.CONNECT_ERROR, () => {
      // Authentication failures should fall back to the REST layer.
      socket?.disconnect();
    });
    return socket;
  },

  disconnect(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket(): Socket | null {
    return socket ?? null;
  },

  isConnected(): boolean {
    return socket?.connected ?? false;
  },

  on<T = unknown>(event: string, handler: (payload: T) => void): void {
    socket?.on(event, handler);
  },

  off(event: string, handler?: (...args: unknown[]) => void): void {
    if (handler) socket?.off(event, handler);
    else socket?.off(event);
  },

  emit<T = unknown>(event: string, payload?: T): void {
    socket?.emit(event, payload);
  },
};
