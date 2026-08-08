import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  messageBookmarked,
  messagePinned,
  messageReacted,
  setActiveConversation,
  updateConversation,
} from '@/store/slices/chatSlice';
import {
  selectChatActiveConversationId,
  selectChatConversations,
  selectChatPresence,
  selectChatTyping,
  selectChatUnreadCounts,
  selectMessagesForConversation,
  selectSocketStatus,
} from '@/store/selectors';
import {
  useAnnouncementsQuery,
  useConversationsQuery,
  useDeleteMessageMutation,
  useEditMessageMutation,
  useForwardMessage,
  useMarkConversationRead,
  useMessagesQuery,
  useSendMessage,
} from '@/features/communication';
import { socketService } from '@/socket';
import { ROUTES } from '@/constants';
import { showSuccess } from '@/utils';
import { useDocumentTitle } from '@/hooks';
import {
  ChatHeader,
  CommunicationEmptyState,
  ConnectionBanner,
  ConversationDetailsPanel,
  ConversationSidebar,
  MessageActionMenu,
  MessageComposer,
  MessageSearchPanel,
  VirtualizedMessageList,
} from '@/components/communication';
import { Typography } from '@/components/ui/Typography';
import { useCurrentUserIdentity } from '@/hooks';
import type { ChatMessage, Conversation, ReplyPreview } from '@/types';
import type { MessageAction } from '@/components/communication/MessageBubble';
import type { ComposerPayload } from '@/components/communication/MessageComposer';

const socketLabel = (status: string): string => {
  if (status === 'connected') return 'Connected · real-time active';
  if (status === 'connecting') return 'Connecting…';
  if (status === 'reconnecting') return 'Reconnecting…';
  return 'Offline · demo mode';
};

/** The Communication Center — three-panel premium chat experience. */
export const CommunicationPage: React.FC = () => {
  useDocumentTitle('Messages');
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { conversationId } = useParams<{ conversationId: string }>();

  const conversations = useAppSelector(selectChatConversations);
  const activeConversationId = useAppSelector(selectChatActiveConversationId);
  const presence = useAppSelector(selectChatPresence);
  const typing = useAppSelector(selectChatTyping);
  const unreadCounts = useAppSelector(selectChatUnreadCounts);
  const socketStatus = useAppSelector(selectSocketStatus);
  const messages = useAppSelector((state) => selectMessagesForConversation(state, activeConversationId ?? 'none'));

  const [infoOpen, setInfoOpen] = useState(isLgUp);
  const [searchOpen, setSearchOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyPreview | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [actionMenu, setActionMenu] = useState<{ message: ChatMessage; anchorEl: HTMLElement } | null>(null);
  const [forwardTarget, setForwardTarget] = useState<ChatMessage | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(0);
  const pendingJumpRef = useRef(false);
  const { userId: currentUserId } = useCurrentUserIdentity();

  useConversationsQuery();
  const { announcements } = useAnnouncementsQuery();
  const { totalElements } = useMessagesQuery(activeConversationId, historyPage, 30);
  const { markRead } = useMarkConversationRead(activeConversationId);
  const { send, retry } = useSendMessage(activeConversationId ?? '');
  const { edit } = useEditMessageMutation();
  const { remove } = useDeleteMessageMutation();
  const { forward } = useForwardMessage();

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
    [conversations, activeConversationId],
  );

  const announcementsUnread = announcements.filter((announcement) => !announcement.readByMe).length;
  const typingNames = useMemo(
    () =>
      (activeConversationId ? (typing[activeConversationId] ?? []) : [])
        .filter((info) => info.isTyping)
        .map((info) => info.userName),
    [typing, activeConversationId],
  );

  /* Sync Redux with the URL. */
  useEffect(() => {
    dispatch(setActiveConversation(conversationId ?? null));
  }, [conversationId, dispatch]);

  /* Fresh history page per conversation (unless a message jump is pending). */
  useEffect(() => {
    if (pendingJumpRef.current) {
      pendingJumpRef.current = false;
      return;
    }
    setHistoryPage(0);
  }, [conversationId]);

  /* Mark read when opening a conversation. */
  useEffect(() => {
    if (activeConversationId) markRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  /* Clear the highlight after a beat. */
  useEffect(() => {
    if (!highlightId) return;
    const timer = window.setTimeout(() => setHighlightId(null), 3600);
    return () => window.clearTimeout(timer);
  }, [highlightId]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      setHighlightId(null);
      navigate(ROUTES.MESSAGES_CONVERSATION.replace(':conversationId', id));
      if (!isLgUp) setInfoOpen(false);
    },
    [navigate, isLgUp],
  );

  const handleBack = useCallback(() => {
    navigate(ROUTES.MESSAGES);
  }, [navigate]);

  const handleSend = useCallback(
    (payload: ComposerPayload) => {
      if (!activeConversationId) return;
      send(payload.content, {
        kind: payload.kind,
        attachments: payload.attachments,
        replyTo: payload.replyTo,
      });
      setReplyTo(null);
    },
    [activeConversationId, send],
  );

  const handleEditSubmit = useCallback(
    (message: ChatMessage, content: string) => {
      edit(message, content);
      setEditingMessage(null);
    },
    [edit],
  );

  const handleReply = useCallback((message: ChatMessage) => {
    setReplyTo({
      messageId: message.id,
      senderName: message.senderName,
      content: message.content,
      kind: message.kind,
    });
  }, []);

  const handleReact = useCallback(
    (message: ChatMessage, emoji: string) => {
      dispatch(
        messageReacted({
          conversationId: message.conversationId,
          messageId: message.id,
          emoji,
        }),
      );
    },
    [dispatch],
  );

  const handleAction = useCallback(
    (message: ChatMessage, action: MessageAction) => {
      if (action === 'copy') {
        void navigator.clipboard
          ?.writeText(message.content)
          .then(() => showSuccess('Message copied to clipboard'));
      } else if (action === 'edit') {
        setEditingMessage(message);
      } else if (action === 'delete') {
        remove(message);
      } else if (action === 'pin') {
        dispatch(
          messagePinned({
            conversationId: message.conversationId,
            messageId: message.id,
            pinned: !message.pinned,
          }),
        );
      } else if (action === 'bookmark') {
        dispatch(
          messageBookmarked({
            conversationId: message.conversationId,
            messageId: message.id,
            bookmarked: !message.bookmarked,
          }),
        );
      } else if (action === 'forward') {
        setForwardTarget(message);
      }
    },
    [dispatch, remove],
  );

  const handleSearchResult = useCallback(
    (conversationId: string, messageId?: string) => {
      setSearchOpen(false);
      handleSelectConversation(conversationId);
      if (messageId) {
        pendingJumpRef.current = true;
        setHistoryPage(999);
        setHighlightId(messageId);
      }
    },
    [handleSelectConversation],
  );

  const handlePinnedJump = useCallback(
    (messageId: string) => {
      const found = messages.some((message) => message.id === messageId);
      if (!found) {
        pendingJumpRef.current = true;
        setHistoryPage(999);
      }
      setHighlightId(messageId);
    },
    [messages],
  );

  const handleReconnect = useCallback(() => {
    socketService.connect();
  }, []);

  const hasMore = totalElements > messages.length;
  const isLoadingMore = historyPage > 0 && messages.length < totalElements;

  const isOwn = (message: ChatMessage): boolean =>
    Boolean(currentUserId) && message.senderId === currentUserId;
  const chatPartner =
    activeConversation?.participants.find((participant) => participant.userId !== currentUserId) ?? null;

  const showSidebar = isMdUp || !activeConversationId;
  const showChatPanel = isMdUp || Boolean(activeConversationId);

  return (
    <Box
      sx={{
        height: { xs: 'calc(100vh - 72px)', md: 'calc(100vh - 112px)' },
        display: 'flex',
        gap: 1.5,
        minHeight: 480,
      }}
    >
      {/* ============ Left: conversations ============ */}
      <AnimatePresence initial={false}>
        {showSidebar && (
          <Box
            key="sidebar"
            sx={{
              width: { xs: '100%', md: 320, lg: 340 },
              flexShrink: 0,
              borderRadius: 4,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'hidden',
            }}
          >
            <ConversationSidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              unreadCounts={unreadCounts}
              presence={presence}
              typing={typing}
              announcementsUnread={announcementsUnread}
              onSelectConversation={handleSelectConversation}
              onTogglePin={(id, pinned) => dispatch(updateConversation({ id, pinned }))}
              onToggleMute={(id, muted) => dispatch(updateConversation({ id, muted }))}
              onSearchClick={() => setSearchOpen(true)}
              onNewChat={(_participantId, participantName) => {
                showSuccess(`Starting a chat with ${participantName} — coming right up!`);
              }}
              onAnnouncementsClick={() => navigate(ROUTES.ANNOUNCEMENTS)}
              socketStatusLabel={socketLabel(socketStatus)}
            />
          </Box>
        )}
      </AnimatePresence>

      {/* ============ Middle: chat ============ */}
      {showChatPanel && (
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 4,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {socketStatus !== 'connected' && socketStatus !== 'connecting' && (
            <ConnectionBanner
              status="Not connected — showing demo data. Reconnect to go live."
              onRetry={handleReconnect}
            />
          )}

          {activeConversation ? (
            <>
              <ChatHeader
                conversation={activeConversation}
                presence={chatPartner ? presence[chatPartner.userId] ?? null : null}
                typingNames={typingNames}
                onBack={handleBack}
                onSearchClick={() => setSearchOpen(true)}
                onInfoClick={() => setInfoOpen((current) => !current)}
                onCallClick={() => {
                  if (activeConversation?.id) {
                    navigate(`/meet/meet-instant-${Date.now()}`);
                  }
                }}
                onVideoCallClick={() => {
                  if (activeConversation?.id) {
                    navigate(`/meet/meet-instant-${Date.now()}`);
                  }
                }}
                infoOpen={infoOpen}
              />

              <VirtualizedMessageList
                key={activeConversation.id}
                messages={messages}
                currentUserId={currentUserId}
                isGroup={activeConversation.type === 'group' || activeConversation.type === 'session'}
                typingNames={typingNames}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
                highlightId={highlightId}
                onLoadMore={() => setHistoryPage((page) => page + 1)}
                onReply={handleReply}
                onReact={handleReact}
                onMore={(message, anchorEl) => setActionMenu({ message, anchorEl })}
                onRetry={retry}
              />

              <MessageComposer
                conversationId={activeConversation.id}
                replyTo={replyTo}
                onCancelReply={() => setReplyTo(null)}
                onSend={handleSend}
                editingMessage={editingMessage}
                onEditSubmit={handleEditSubmit}
                onCancelEdit={() => setEditingMessage(null)}
                placeholder={
                  activeConversation.type === 'group' || activeConversation.type === 'session'
                    ? `Message ${activeConversation.title ?? 'the group'}…`
                    : 'Type a message…'
                }
              />

              {/* Search overlay */}
              <AnimatePresence>
                {searchOpen && (
                  <MessageSearchPanel
                    onClose={() => setSearchOpen(false)}
                    onResultClick={handleSearchResult}
                  />
                )}
              </AnimatePresence>
            </>
          ) : (
            <CommunicationEmptyState
              icon={<ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 34 }} />}
              title="Select a conversation"
              description="Pick a chat from the sidebar to start messaging, or search across all your conversations."
              actionLabel="Browse announcements"
              onAction={() => navigate(ROUTES.ANNOUNCEMENTS)}
            />
          )}
        </Box>
      )}

      {/* ============ Right: details ============ */}
      <AnimatePresence initial={false}>
        {infoOpen && activeConversation && (
          <Box
            key="details"
            sx={{
              width: 300,
              flexShrink: 0,
              display: { xs: 'none', lg: 'block' },
              borderRadius: 4,
              border: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'hidden',
            }}
          >
            <ConversationDetailsPanel
              conversation={activeConversation}
              messages={messages}
              presence={presence}
              onClose={() => setInfoOpen(false)}
              onPinnedMessageClick={handlePinnedJump}
            />
          </Box>
        )}
      </AnimatePresence>

      {/* ============ Action menu ============ */}
      <MessageActionMenu
        anchorEl={actionMenu?.anchorEl ?? null}
        message={actionMenu?.message ?? null}
        isOwn={actionMenu ? isOwn(actionMenu.message) : false}
        onClose={() => setActionMenu(null)}
        onReply={() => actionMenu && handleReply(actionMenu.message)}
        onForward={() => actionMenu && setForwardTarget(actionMenu.message)}
        onCopy={() => actionMenu && handleAction(actionMenu.message, 'copy')}
        onEdit={() => actionMenu && handleAction(actionMenu.message, 'edit')}
        onDelete={() => actionMenu && handleAction(actionMenu.message, 'delete')}
        onTogglePin={(pinned) =>
          actionMenu &&
          dispatch(
            messagePinned({
              conversationId: actionMenu.message.conversationId,
              messageId: actionMenu.message.id,
              pinned,
            }),
          )
        }
        onToggleBookmark={(bookmarked) =>
          actionMenu &&
          dispatch(
            messageBookmarked({
              conversationId: actionMenu.message.conversationId,
              messageId: actionMenu.message.id,
              bookmarked,
            }),
          )
        }
      />

      {/* ============ Forward dialog ============ */}
      <ForwardDialog
        open={Boolean(forwardTarget)}
        message={forwardTarget}
        conversations={conversations}
        currentUserId={currentUserId}
        onClose={() => setForwardTarget(null)}
        onForward={(conversationId) => {
          if (forwardTarget) {
            forward(conversationId, forwardTarget);
            showSuccess('Message forwarded');
          }
          setForwardTarget(null);
        }}
      />
    </Box>
  );
};

/* ============================================================
   Forward dialog
   ============================================================ */

interface ForwardDialogProps {
  open: boolean;
  message: ChatMessage | null;
  conversations: Conversation[];
  currentUserId: string;
  onClose: () => void;
  onForward: (conversationId: string) => void;
}

const ForwardDialog: React.FC<ForwardDialogProps> = ({
  open,
  message,
  conversations,
  currentUserId,
  onClose,
  onForward,
}) => {
  const labelFor = (conversation: Conversation): string => {
    if (conversation.title) return conversation.title;
    const other = conversation.participants.find((participant) => participant.userId !== currentUserId);
    return other?.name ?? 'Conversation';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth aria-label="Forward message">
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Typography variant="subtitle1" fontWeight={800}>
          Forward message
        </Typography>
        <IconButton size="small" aria-label="Close" onClick={onClose}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '0 !important' }}>
        {message && (
          <Box
            sx={{
              mb: 1.5,
              p: 1.25,
              borderRadius: 2.5,
              bgcolor: 'action.hover',
              borderLeft: '3px solid',
              borderColor: 'primary.main',
            }}
          >
            <Typography variant="caption" fontWeight={700}>
              {message.senderName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
              {message.content}
            </Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 320, overflowY: 'auto' }}>
          {conversations.map((conversation) => (
            <Box
              key={conversation.id}
              role="button"
              tabIndex={0}
              onClick={() => onForward(conversation.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') onForward(conversation.id);
              }}
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                {labelFor(conversation)}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default CommunicationPage;
