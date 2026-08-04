import type { Role } from './auth';

/* ============================================================
   Conversations
   ============================================================ */

export type ConversationType = 'direct' | 'mentor-learner' | 'session' | 'group';

export interface ChatParticipant {
  userId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: Role;
  headline?: string;
  avatarUrl?: string;
  timezone?: string;
}

/* ============================================================
   Messages
   ============================================================ */

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type MessageKind = 'text' | 'image' | 'file' | 'code' | 'voice' | 'gif' | 'system';

export type AttachmentKind =
  | 'image'
  | 'pdf'
  | 'document'
  | 'certificate'
  | 'archive'
  | 'video'
  | 'audio'
  | 'other';

export interface MessageAttachment {
  id: string;
  name: string;
  kind: AttachmentKind;
  size: number;
  url?: string;
  previewUrl?: string;
  mimeType?: string;
  durationSeconds?: number;
  /** Emoji used for self-contained visual previews (no network required). */
  emoji?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  reactedByMe: boolean;
  userIds: string[];
}

export interface ReplyPreview {
  messageId: string;
  senderName: string;
  content: string;
  kind: MessageKind;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  senderRole?: Role;
  content: string;
  kind: MessageKind;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  status: MessageStatus;
  createdAt: string;
  edited?: boolean;
  deleted?: boolean;
  pinned?: boolean;
  bookmarked?: boolean;
  replyTo?: ReplyPreview | null;
  forwardedFrom?: string;
  /** User IDs that have read this message (read receipts). */
  readBy?: string[];
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title?: string;
  subtitle?: string;
  avatarEmoji?: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  pinned?: boolean;
  muted?: boolean;
  archived?: boolean;
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

/* ============================================================
   Presence & typing
   ============================================================ */

export type PresenceStatus = 'online' | 'away' | 'busy' | 'in-session' | 'offline' | 'invisible';

export type PresenceDevice = 'desktop' | 'mobile' | 'web';

export interface PresenceInfo {
  userId: string;
  status: PresenceStatus;
  customStatus?: string;
  lastSeen?: string;
  isTyping?: boolean;
  device?: PresenceDevice;
}

export interface TypingInfo {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  expiresAt?: string;
}

export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';

/* ============================================================
   Announcements
   ============================================================ */

export type AnnouncementCategory = 'SYSTEM' | 'MAINTENANCE' | 'PLATFORM' | 'PROMOTION' | 'EVENT';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  author: string;
  pinned?: boolean;
  readByMe?: boolean;
  publishedAt: string;
  expiresAt?: string;
}

/* ============================================================
   Search
   ============================================================ */

export interface MessageSearchFilters {
  kind?: MessageKind[];
  onlyFiles?: boolean;
  onlyImages?: boolean;
  onlyLinks?: boolean;
  onlyMentions?: boolean;
  onlyBookmarks?: boolean;
  fromDate?: string;
  toDate?: string;
}

export interface MessageSearchResult {
  message: ChatMessage;
  conversationId: string;
}

/* ============================================================
   API payloads (mirror communication-service controllers)
   ============================================================ */

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  kind?: MessageKind;
  attachments?: MessageAttachment[];
  replyTo?: ReplyPreview | null;
}

export interface CreateConversationRequest {
  type: ConversationType;
  participantIds: string[];
  title?: string;
  sessionId?: string;
}

export interface UpdatePresenceRequest {
  status: PresenceStatus;
  customStatus?: string;
}
