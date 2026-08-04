import { apiClient } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import type {
  Announcement,
  ApiResponse,
  ChatMessage,
  Conversation,
  CreateConversationRequest,
  MessageSearchFilters,
  MessageSearchResult,
  PageResponse,
  PresenceInfo,
  SendMessageRequest,
  UpdatePresenceRequest,
} from '@/types';

const resolve = (template: string, params: Record<string, string>): string =>
  Object.entries(params).reduce((url, [key, value]) => url.replace(`{${key}}`, value), template);

/**
 * communication-service endpoints. The current user is resolved from the JWT
 * by the API gateway (X-User-ID header).
 */
export const communicationService = {
  /* ---------------- Conversations ---------------- */

  getConversations: (page = 0, size = 50) =>
    apiClient.get<ApiResponse<PageResponse<Conversation>>>(
      `${API_ENDPOINTS.COMMUNICATION.CHAT}?page=${page}&size=${size}`,
    ),

  getConversation: (conversationId: string) =>
    apiClient.get<ApiResponse<Conversation>>(
      resolve(API_ENDPOINTS.COMMUNICATION.CONVERSATION, { conversationId }),
    ),

  createConversation: (payload: CreateConversationRequest) =>
    apiClient.post<ApiResponse<Conversation>>(API_ENDPOINTS.COMMUNICATION.CHAT, payload),

  /* ---------------- Messages ---------------- */

  getHistory: (conversationId: string, page = 0, size = 30) =>
    apiClient.get<ApiResponse<PageResponse<ChatMessage>>>(
      `${API_ENDPOINTS.COMMUNICATION.HISTORY}?conversationId=${conversationId}&page=${page}&size=${size}`,
    ),

  sendMessage: (payload: SendMessageRequest) =>
    apiClient.post<ApiResponse<ChatMessage>>(API_ENDPOINTS.COMMUNICATION.MESSAGE, payload),

  editMessage: (messageId: string, content: string) =>
    apiClient.put<ApiResponse<ChatMessage>>(
      resolve(API_ENDPOINTS.COMMUNICATION.MESSAGE_ITEM, { messageId }),
      { content },
    ),

  deleteMessage: (messageId: string) =>
    apiClient.delete<ApiResponse<void>>(
      resolve(API_ENDPOINTS.COMMUNICATION.MESSAGE_ITEM, { messageId }),
    ),

  searchMessages: (query: string, filters: MessageSearchFilters = {}, page = 0, size = 30) =>
    apiClient.get<ApiResponse<PageResponse<MessageSearchResult>>>(
      API_ENDPOINTS.COMMUNICATION.SEARCH,
      {
        params: { query, ...filters, page, size },
      },
    ),

  markConversationRead: (conversationId: string) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.COMMUNICATION.READ, { conversationId }),

  /* ---------------- Presence ---------------- */

  getPresence: (userId: string) =>
    apiClient.get<ApiResponse<PresenceInfo>>(
      resolve(API_ENDPOINTS.COMMUNICATION.PRESENCE, { userId }),
    ),

  getOnlineUsers: () =>
    apiClient.get<ApiResponse<PresenceInfo[]>>(API_ENDPOINTS.COMMUNICATION.PRESENCE_ONLINE),

  updatePresence: (payload: UpdatePresenceRequest) =>
    apiClient.post<ApiResponse<PresenceInfo>>(API_ENDPOINTS.COMMUNICATION.PRESENCE_BATCH, payload),

  /* ---------------- Announcements ---------------- */

  getAnnouncements: (page = 0, size = 30) =>
    apiClient.get<ApiResponse<PageResponse<Announcement>>>(
      `${API_ENDPOINTS.COMMUNICATION.ANNOUNCEMENTS}?page=${page}&size=${size}`,
    ),
} as const;

export default communicationService;
