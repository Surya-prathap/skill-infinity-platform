import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { Typography } from '@/components/ui/Typography';
import { Avatar } from '@/components/ui';
import { gradients } from '@/theme';
import { useCurrentUserIdentity } from '@/hooks';
import { ConversationCard } from './ConversationCard';
import { PresenceBadge } from './PresenceBadge';
import { UnreadBadge } from './UnreadBadge';
import { isPresenceOnline } from './presence';
import type { Conversation, PresenceInfo, TypingInfo } from '@/types';

type ConversationFilter = 'all' | 'unread' | 'groups' | 'pinned';

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  unreadCounts: Record<string, number>;
  presence: Record<string, PresenceInfo>;
  typing: Record<string, TypingInfo[]>;
  announcementsUnread: number;
  onSelectConversation: (conversationId: string) => void;
  onTogglePin: (conversationId: string, pinned: boolean) => void;
  onToggleMute: (conversationId: string, muted: boolean) => void;
  onSearchClick: () => void;
  onNewChat: (participantId: string, participantName: string) => void;
  onAnnouncementsClick: () => void;
  socketStatusLabel: string;
}

const FILTERS: { value: ConversationFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'groups', label: 'Groups' },
  { value: 'pinned', label: 'Pinned' },
];

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography
    variant="caption"
    sx={{
      display: 'block',
      px: 1.5,
      mt: 1.5,
      mb: 0.5,
      fontSize: '0.66rem',
      fontWeight: 800,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'text.disabled',
    }}
  >
    {children}
  </Typography>
);

/** Left rail of the Communication Center — conversations, filters, search. */
export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeConversationId,
  unreadCounts,
  presence,
  typing,
  announcementsUnread,
  onSelectConversation,
  onTogglePin,
  onToggleMute,
  onSearchClick,
  onNewChat,
  onAnnouncementsClick,
  socketStatusLabel,
}) => {
  const [filter, setFilter] = useState<ConversationFilter>('all');
  const [query, setQuery] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const { userId: currentUserId } = useCurrentUserIdentity();

  const sorted = useMemo(
    () =>
      [...conversations].sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }),
    [conversations],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sorted.filter((conversation) => {
      if (filter === 'unread' && (unreadCounts[conversation.id] ?? 0) === 0) return false;
      if (filter === 'groups' && conversation.type !== 'group' && conversation.type !== 'session') return false;
      if (filter === 'pinned' && !conversation.pinned) return false;
      if (needle) {
        const label =
          conversation.title ??
          conversation.participants.find((p) => p.userId !== currentUserId)?.name ??
          '';
        if (!label.toLowerCase().includes(needle)) return false;
      }
      return true;
    });
  }, [sorted, filter, query, unreadCounts]);

  const pinned = filtered.filter((conversation) => conversation.pinned);
  const groups = filtered.filter(
    (conversation) => !conversation.pinned && (conversation.type === 'group' || conversation.type === 'session'),
  );
  const chats = filtered.filter(
    (conversation) =>
      !conversation.pinned && conversation.type !== 'group' && conversation.type !== 'session',
  );

  const onlineContacts = Object.values(presence)
    .filter((info) => isPresenceOnline(info.status) && info.userId !== currentUserId)
    .slice(0, 6);

  const renderList = (list: Conversation[]) => (
    <AnimatePresence initial={false}>
      {list.map((conversation) => {
        const other = conversation.participants.find((p) => p.userId !== currentUserId);
        const isTyping = (typing[conversation.id] ?? []).some((info) => info.isTyping);
        return (
          <ConversationCard
            key={conversation.id}
            conversation={conversation}
            active={conversation.id === activeConversationId}
            unread={unreadCounts[conversation.id] ?? conversation.unreadCount ?? 0}
            presence={other ? presence[other.userId] ?? null : null}
            typing={isTyping}
            onSelect={() => onSelectConversation(conversation.id)}
            onTogglePin={onTogglePin}
            onToggleMute={onToggleMute}
          />
        );
      })}
    </AnimatePresence>
  );

  const emptyMessage =
    filter === 'unread'
      ? 'You’re all caught up 🎉'
      : query
        ? 'No conversations match your search'
        : 'Start a conversation to get going';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
      {/* Header */}
      <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ flexGrow: 1 }}>
            Messages
          </Typography>
          <Tooltip title="Search messages">
            <IconButton size="small" aria-label="Search messages" onClick={onSearchClick}>
              <SearchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="New conversation">
            <IconButton size="small" aria-label="New conversation" onClick={() => setNewChatOpen(true)}>
              <AddCommentOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Inline search */}
        <TextField
          size="small"
          placeholder="Search conversations…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          fullWidth
          sx={{ mt: 1.25 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 0.75, mt: 1.25, flexWrap: 'wrap' }}>
          {FILTERS.map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              size="small"
              onClick={() => setFilter(item.value)}
              color={filter === item.value ? 'primary' : 'default'}
              variant={filter === item.value ? 'filled' : 'outlined'}
              sx={{ height: 26, fontSize: '0.74rem' }}
            />
          ))}
        </Box>

        {/* Online strip */}
        {onlineContacts.length > 0 && filter === 'all' && (
          <Box sx={{ display: 'flex', gap: 0.75, mt: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            {onlineContacts.map((info) => (
              <Tooltip key={info.userId} title={info.status === 'online' ? 'Online' : 'In a session'} arrow>
                <Box sx={{ position: 'relative', cursor: 'pointer' }}>
                  <Avatar name={info.userId} size={30} />
                  <Box sx={{ position: 'absolute', bottom: -1, right: -1 }}>
                    <PresenceBadge status={info.status} size={9} showLabel={false} />
                  </Box>
                </Box>
              </Tooltip>
            ))}
          </Box>
        )}
      </Box>

      {/* Conversation lists */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', px: 1, pb: 1 }}>
        {filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, px: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {emptyMessage}
            </Typography>
          </Box>
        ) : filter !== 'all' ? (
          renderList(filtered)
        ) : (
          <>
            {pinned.length > 0 && (
              <>
                <SectionLabel>Pinned</SectionLabel>
                {renderList(pinned)}
              </>
            )}
            {groups.length > 0 && (
              <>
                <SectionLabel>
                  {groups.some((g) => g.type === 'session') ? 'Sessions & Groups' : 'Groups'}
                </SectionLabel>
                {renderList(groups)}
              </>
            )}
            {chats.length > 0 && (
              <>
                <SectionLabel>Chats</SectionLabel>
                {renderList(chats)}
              </>
            )}
          </>
        )}
      </Box>

      {/* Announcements + connection status footer */}
      <Box sx={{ borderTop: 1, borderColor: 'divider', p: 1 }}>
        <Box
          role="button"
          tabIndex={0}
          onClick={onAnnouncementsClick}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onAnnouncementsClick();
            }
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 1,
            borderRadius: 2.5,
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: gradients.brand,
              color: '#fff',
            }}
          >
            <CampaignOutlinedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="body2" fontWeight={600} sx={{ flexGrow: 1 }}>
            Announcements
          </Typography>
          <UnreadBadge count={announcementsUnread} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.75 }}>
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: socketStatusLabel === 'Connected' ? '#22C55E' : '#F59E0B',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {socketStatusLabel}
          </Typography>
        </Box>
      </Box>

      {/* New conversation dialog */}
      <NewChatDialog
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onSelect={(participantId, participantName) => {
          setNewChatOpen(false);
          onNewChat(participantId, participantName);
        }}
        presence={presence}
      />
    </Box>
  );
};

/* ============================================================
   New conversation dialog
   ============================================================ */

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (participantId: string, participantName: string) => void;
  presence: Record<string, PresenceInfo>;
}

export const NewChatDialog: React.FC<NewChatDialogProps> = ({ open, onClose, onSelect, presence }) => {
  const [query, setQuery] = useState('');

  // Real contacts are loaded from the conversations list; presence is
  // broadcast live by the socket. No hard-coded participant directory.
  const options = Object.values(presence)
    .filter((info) =>
      query ? info.userId.toLowerCase().includes(query.toLowerCase()) : true,
    )
    .slice(0, 12);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth aria-label="Start a new conversation">
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Typography variant="subtitle1" fontWeight={800}>
          Start a conversation
        </Typography>
        <IconButton size="small" aria-label="Close" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '0 !important' }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search people…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ mb: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {options.map((info) => {
            const name = info.userId;
            return (
              <Box
                key={info.userId}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(info.userId, name)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') onSelect(info.userId, name);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1,
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Avatar name={name} size={38} />
                  <Box sx={{ position: 'absolute', bottom: -1, right: -1 }}>
                    <PresenceBadge status={info.status} size={9} showLabel={false} />
                  </Box>
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {info.customStatus ?? 'Skill Infinity member'}
                  </Typography>
                </Box>
              </Box>
            );
          })}
          {options.length === 0 && (
            <Typography variant="body2" color="text.disabled" sx={{ py: 3, textAlign: 'center' }}>
              No contacts online right now.
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ConversationSidebar;
