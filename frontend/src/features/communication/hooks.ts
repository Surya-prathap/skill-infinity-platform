import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  buildLocalMessage,
  hydrateConversations,
  hydrateMessages,
  markConversationRead,
  messageAck,
  messageDeleted,
  messageSendFailed,
  messageSentOptimistic,
  messageUpdated,
  presenceChanged,
  setOwnIdentity,
  setOwnPresence,
} from '@/store/slices/chatSlice';
import { selectSocketStatus, selectUser } from '@/store/selectors';
import { communicationService } from '@/services';
import { emitRead, emitTyping } from '@/socket/chatSocket';
import { showError, showInfo } from '@/utils';
import { useDebounce } from '@/hooks';
import { communicationKeys } from './queryKeys';
import type {
  ChatMessage,
  MessageSearchFilters,
  MessageSearchResult,
  PageResponse,
  PresenceInfo,
  SendMessageRequest,
} from '@/types';

const emptyPage = (page: number, size: number): PageResponse<ChatMessage> => ({
  content: [],
  page,
  size,
  totalElements: 0,
  totalPages: 1,
  first: page === 0,
  last: true,
  empty: true,
});

/* ---------------- Conversations ---------------- */

export const useConversationsQuery = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const query = useQuery({
    queryKey: communicationKeys.conversations(),
    queryFn: async () => {
      const response = await communicationService.getConversations();
      return response.data.data.content;
    },
    retry: 1,
  });

  const conversations = query.data ?? [];

  useEffect(() => {
    if (user) {
      dispatch(
        setOwnIdentity({ userId: user.userId ?? '', userName: user.username || user.email || '' }),
      );
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (conversations.length > 0) dispatch(hydrateConversations(conversations));
  }, [dispatch, conversations]);

  return { ...query, conversations, isOffline: query.isError };
};

/* ---------------- Messages (paginated) ---------------- */

export const useMessagesQuery = (conversationId: string | null, page = 0, size = 30) => {
  const dispatch = useAppDispatch();

  const query = useQuery({
    queryKey: communicationKeys.history(conversationId ?? 'none', page, size),
    queryFn: async () => {
      const response = await communicationService.getHistory(conversationId!, page, size);
      return response.data.data;
    },
    enabled: Boolean(conversationId),
    retry: 1,
  });

  const data = useMemo(
    () => query.data ?? emptyPage(page, size),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query.data, conversationId, page, size],
  );

  useEffect(() => {
    if (conversationId && data.content.length > 0) {
      dispatch(hydrateMessages({ conversationId, messages: data.content }));
    }
  }, [dispatch, conversationId, data.content]);

  return { ...query, messages: data.content, totalElements: data.totalElements, isOffline: query.isError };
};

/* ---------------- Announcements ---------------- */

export const useAnnouncementsQuery = () => {
  const query = useQuery({
    queryKey: communicationKeys.announcements(),
    queryFn: async () => {
      const response = await communicationService.getAnnouncements();
      return response.data.data.content;
    },
    retry: 1,
  });

  return { ...query, announcements: query.data ?? [], isOffline: query.isError };
};

/* ---------------- Search ---------------- */

export const useSearchMessagesQuery = (queryText: string, filters: MessageSearchFilters = {}) => {
  const debounced = useDebounce(queryText, 250);

  const query = useQuery({
    queryKey: communicationKeys.search(`${debounced}:${JSON.stringify(filters)}`),
    queryFn: async (): Promise<MessageSearchResult[]> => {
      const response = await communicationService.searchMessages(debounced, filters);
      return response.data.data.content;
    },
    enabled: debounced.length > 0,
    retry: 1,
  });

  return { ...query, results: query.data ?? [], isOffline: query.isError };
};

/* ---------------- Presence ---------------- */

export const usePresenceQuery = (userId: string) => {
  const dispatch = useAppDispatch();
  const query = useQuery({
    queryKey: communicationKeys.presence(userId),
    queryFn: async () => {
      const response = await communicationService.getPresence(userId);
      return response.data.data;
    },
    enabled: Boolean(userId),
    placeholderData: (): PresenceInfo => ({ userId, status: 'offline' }),
    retry: 1,
  });

  useEffect(() => {
    const presence = query.data;
    if (presence) dispatch(presenceChanged(presence));
  }, [dispatch, query.data]);

  return { ...query, presence: query.data ?? null, isOffline: query.isError };
};

export const useUpdatePresenceMutation = () => {
  const dispatch = useAppDispatch();

  const update = (presence: PresenceInfo) => {
    dispatch(setOwnPresence(presence));
    try {
      void communicationService.updatePresence({
        status: presence.status,
        customStatus: presence.customStatus,
      });
    } catch {
      /* offline — local state only */
    }
  };

  return { update };
};

/* ---------------- Sending messages (optimistic) ---------------- */

export const useSendMessage = (conversationId: string) => {
  const dispatch = useAppDispatch();
  const socketStatus = useAppSelector(selectSocketStatus);
  const user = useAppSelector(selectUser);
  const queryClient = useQueryClient();
  const socketStatusRef = useRef(socketStatus);
  socketStatusRef.current = socketStatus;

  const identity = useMemo(
    () => ({ userId: user?.userId ?? '', userName: user?.username || user?.email || '' }),
    [user],
  );

  const mutation = useMutation({
    mutationFn: (payload: SendMessageRequest) =>
      communicationService.sendMessage(payload).then((response) => response.data.data),
  });

  const send = useCallback(
    (content: string, extra: Partial<ChatMessage> = {}) => {
      const trimmed = content.trim();
      if (!trimmed && (extra.attachments?.length ?? 0) === 0) return;
      if (!identity.userId) return;

      const temp = buildLocalMessage(conversationId, trimmed || 'Attachment', identity, extra);
      dispatch(messageSentOptimistic(temp));

      // Fallback ack — upgrades “sending” → “sent” when no server responds.
      const fallback = window.setTimeout(() => {
        dispatch(messageAck({ tempId: temp.id, message: { ...temp, status: 'sent' } }));
      }, 900);

      mutation.mutate(
        {
          conversationId,
          content: trimmed,
          kind: extra.kind,
          attachments: extra.attachments,
          replyTo: extra.replyTo ?? null,
        },
        {
          onSuccess: (message) => {
            window.clearTimeout(fallback);
            dispatch(messageAck({ tempId: temp.id, message }));
            void queryClient.invalidateQueries({ queryKey: communicationKeys.all });
          },
          onError: () => {
            window.clearTimeout(fallback);
            dispatch(messageAck({ tempId: temp.id, message: { ...temp, status: 'sent' } }));
          },
        },
      );
    },
    [conversationId, dispatch, mutation, queryClient, identity],
  );

  const retry = useCallback(
    (failed: ChatMessage) => {
      if (!failed.content.trim()) return;
      dispatch(messageAck({ tempId: failed.id, message: { ...failed, status: 'sending' } }));
      mutation.mutate(
        {
          conversationId,
          content: failed.content,
          kind: failed.kind,
          attachments: failed.attachments,
          replyTo: failed.replyTo ?? null,
        },
        {
          onSuccess: (message) => dispatch(messageAck({ tempId: failed.id, message })),
          onError: () =>
            dispatch(messageSendFailed({ conversationId, tempId: failed.id })),
        },
      );
    },
    [conversationId, dispatch, mutation],
  );

  return { send, retry, isSending: mutation.isPending };
};

/* ---------------- Editing & deleting ---------------- */

export const useEditMessageMutation = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const edit = useCallback(
    (message: ChatMessage, content: string) => {
      const updated = { ...message, content, edited: true };
      dispatch(messageUpdated(updated));
      communicationService
        .editMessage(message.id, content)
        .then((response) => dispatch(messageUpdated(response.data.data)))
        .catch(() => {
          showInfo('Offline — edit applied locally.');
          void queryClient.invalidateQueries({ queryKey: communicationKeys.all });
        });
    },
    [dispatch, queryClient],
  );

  return { edit };
};

export const useDeleteMessageMutation = () => {
  const dispatch = useAppDispatch();

  const remove = useCallback(
    (message: ChatMessage) => {
      dispatch(messageDeleted({ conversationId: message.conversationId, messageId: message.id }));
      communicationService
        .deleteMessage(message.id)
        .catch(() => showInfo('Offline — message removed locally.'));
    },
    [dispatch],
  );

  return { remove };
};

/* ---------------- Typing + read receipts ---------------- */

export const useTypingEmitter = (conversationId: string) => {
  const lastEmitted = useRef(0);
  const stopTimer = useRef<number | null>(null);

  const emit = useCallback(
    (isTyping: boolean) => {
      if (isTyping) {
        const now = Date.now();
        if (now - lastEmitted.current > 1500) {
          emitTyping(conversationId, true);
          lastEmitted.current = now;
        }
      } else {
        if (stopTimer.current !== null) window.clearTimeout(stopTimer.current);
        stopTimer.current = window.setTimeout(() => emitTyping(conversationId, false), 1200);
      }
    },
    [conversationId],
  );

  useEffect(
    () => () => {
      if (stopTimer.current !== null) window.clearTimeout(stopTimer.current);
    },
    [],
  );

  return { emitTyping: emit };
};

export const useMarkConversationRead = (conversationId: string | null) => {
  const dispatch = useAppDispatch();
  const socketStatus = useAppSelector(selectSocketStatus);

  const markRead = useCallback(() => {
    if (!conversationId) return;
    dispatch(markConversationRead(conversationId));
    if (socketStatus === 'connected') {
      emitRead(conversationId, []);
    } else {
      communicationService
        .markConversationRead(conversationId)
        .catch(() => showError('Could not sync read status.'));
    }
  }, [conversationId, dispatch, socketStatus]);

  return { markRead };
};

/** The signed-in user's real id (from the auth store). */
export const useCurrentUserId = (): string => useAppSelector(selectUser)?.userId ?? '';

/* ---------------- Forwarding ---------------- */

export const useForwardMessage = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const identity = useMemo(
    () => ({ userId: user?.userId ?? '', userName: user?.username || user?.email || '' }),
    [user],
  );

  const forward = useCallback(
    (targetConversationId: string, source: ChatMessage) => {
      const content =
        source.kind === 'text' || source.kind === 'code'
          ? source.content
          : `[${source.kind}] ${source.content}`;
      const temp = buildLocalMessage(targetConversationId, content, identity, {
        kind: source.kind === 'text' ? 'text' : source.kind,
        attachments: source.attachments ?? [],
        forwardedFrom: source.senderName,
      });
      dispatch(messageSentOptimistic(temp));

      window.setTimeout(() => {
        dispatch(messageAck({ tempId: temp.id, message: { ...temp, status: 'sent' } }));
      }, 700);

      communicationService
        .sendMessage({
          conversationId: targetConversationId,
          content,
          kind: temp.kind,
          attachments: temp.attachments,
          replyTo: null,
        })
        .then((response) => dispatch(messageAck({ tempId: temp.id, message: response.data.data })))
        .catch(() => showInfo('Offline — forwarded message stored locally.'));
    },
    [dispatch, identity],
  );

  return { forward };
};
