import { Box, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';
import { Avatar } from '@/components/ui';
import { Typography } from '@/components/ui/Typography';
import { gradients } from '@/theme';
import { formatTime, isToday } from '@/utils';
import { UnreadBadge } from './UnreadBadge';
import { PresenceBadge } from './PresenceBadge';
import { TypingIndicator } from './TypingIndicator';
import type { Conversation, PresenceInfo } from '@/types';

interface ConversationCardProps {
  conversation: Conversation;
  active: boolean;
  unread: number;
  presence?: PresenceInfo | null;
  /** Whether a participant is actively typing in this conversation. */
  typing?: boolean;
  onSelect: () => void;
  onTogglePin?: (conversationId: string, pinned: boolean) => void;
  onToggleMute?: (conversationId: string, muted: boolean) => void;
}

const previewText = (conversation: Conversation): string => {
  const last = conversation.lastMessage;
  if (!last) return 'No messages yet';
  if (last.deleted) return 'Message deleted';
  const prefix = last.senderId !== conversation.participants[0]?.userId ? `${last.senderName}: ` : '';
  if (last.kind === 'voice') return `${prefix}🎙️ Voice message`;
  if (last.kind === 'gif') return `${prefix}🎞️ GIF`;
  if (last.kind === 'image') return `${prefix}🖼️ Image`;
  if (last.kind === 'file') return `${prefix}📎 ${last.attachments?.[0]?.name ?? 'File'}`;
  if (last.kind === 'code') return `${prefix}</> Code snippet`;
  return `${prefix}${last.content}`;
};

const cardLabel = (conversation: Conversation): string => {
  if (conversation.title) return conversation.title;
  const other = conversation.participants.find((participant) => participant.userId !== 'user-me');
  return other?.name ?? 'Conversation';
};

/** Premium conversation row — gradient accent, presence dot, hover actions. */
export const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  active,
  unread,
  presence,
  typing = false,
  onSelect,
  onTogglePin,
  onToggleMute,
}) => {
  const other = conversation.participants.find((participant) => participant.userId !== 'user-me');
  const label = cardLabel(conversation);
  const preview = previewText(conversation);
  const isGroup = conversation.type === 'group' || conversation.type === 'session';
  const timestamp = conversation.lastMessage?.createdAt ?? conversation.updatedAt;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
    >
      <Box
        role="button"
        tabIndex={0}
        aria-label={`Open conversation with ${label}`}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect();
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 1.5,
          py: 1.25,
          borderRadius: 3,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          transition: 'background-color 160ms ease, transform 160ms ease',
          background: active
            ? (theme) =>
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(120deg, rgba(142,128,255,0.16), rgba(67,198,192,0.08))'
                  : 'linear-gradient(120deg, rgba(109,93,246,0.12), rgba(67,198,192,0.06))'
            : 'transparent',
          '&:hover': {
            background: (theme) =>
              active
                ? theme.palette.mode === 'dark'
                  ? 'linear-gradient(120deg, rgba(142,128,255,0.22), rgba(67,198,192,0.12))'
                  : 'linear-gradient(120deg, rgba(109,93,246,0.16), rgba(67,198,192,0.1))'
                : theme.palette.action.hover,
          },
          '&:hover .conversation-actions': { opacity: 1 },
        }}
      >
        {active && (            <motion.span
              layoutId="conversation-accent"
              style={{
                position: 'absolute',
                left: 0,
                top: '14%',
                bottom: '14%',
                width: 3,
                borderRadius: 999,
                background: gradients.brand,
                boxShadow: '0 0 12px rgba(109, 93, 246, 0.6)',
              }}
            />
        )}

        {/* Avatar + presence */}
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          {isGroup || conversation.avatarEmoji ? (
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(142,128,255,0.18)'
                    : 'rgba(109,93,246,0.12)',
                border: '1px solid rgba(109,93,246,0.25)',
              }}
            >
              {conversation.avatarEmoji ?? '👥'}
            </Box>
          ) : (
            <Avatar
              firstName={other?.firstName}
              lastName={other?.lastName}
              email={other?.email}
              size={46}
              sx={{ borderRadius: '14px' }}
            />
          )}
          {!isGroup && presence && (
            <Box sx={{ position: 'absolute', bottom: -1, right: -1 }}>
              <PresenceBadge status={presence.status} size={11} showLabel={false} />
            </Box>
          )}
        </Box>

        {/* Body */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              fontWeight={active || unread > 0 ? 700 : 600}
              noWrap
              sx={{ flexGrow: 1 }}
            >
              {label}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, fontSize: '0.68rem' }}>
              {isToday(timestamp) ? formatTime(timestamp) : new Date(timestamp).toLocaleDateString(undefined, { weekday: 'short' })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
            {typing ? (
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  color: 'primary.light',
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  minWidth: 0,
                }}
              >
                <TypingIndicator compact />
                <span>typing…</span>
              </Box>
            ) : (
              <Typography
                variant="caption"
                color={unread > 0 ? 'text.primary' : 'text.secondary'}
                fontWeight={unread > 0 ? 600 : 500}
                noWrap
                sx={{ flexGrow: 1, fontSize: '0.78rem' }}
              >
                {preview}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              {conversation.pinned && (
                <Tooltip title="Pinned">
                  <PushPinOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                </Tooltip>
              )}
              {conversation.muted && (
                <Tooltip title="Muted">
                  <NotificationsOffOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                </Tooltip>
              )}
              <UnreadBadge count={unread} muted={conversation.muted} />
            </Box>
          </Box>
        </Box>

        {/* Hover quick actions */}
        <Box
          className="conversation-actions"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
            opacity: 0,
            transition: 'opacity 140ms ease',
            '&:focus-within': { opacity: 1 },
          }}
        >
          {onTogglePin && (
            <IconButton
              size="small"
              aria-label={conversation.pinned ? 'Unpin conversation' : 'Pin conversation'}
              onClick={(event) => {
                event.stopPropagation();
                onTogglePin(conversation.id, !conversation.pinned);
              }}
              sx={{ width: 26, height: 26 }}
            >
              <PushPinOutlinedIcon sx={{ fontSize: 16 }} color={conversation.pinned ? 'primary' : 'disabled'} />
            </IconButton>
          )}
          {onToggleMute && (
            <IconButton
              size="small"
              aria-label={conversation.muted ? 'Unmute conversation' : 'Mute conversation'}
              onClick={(event) => {
                event.stopPropagation();
                onToggleMute(conversation.id, !conversation.muted);
              }}
              sx={{ width: 26, height: 26 }}
            >
              <NotificationsOffOutlinedIcon sx={{ fontSize: 16 }} color={conversation.muted ? 'primary' : 'disabled'} />
            </IconButton>
          )}
          <IconButton size="small" aria-label="More options" onClick={(event) => event.stopPropagation()} sx={{ width: 26, height: 26 }}>
            <MoreHorizIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </motion.div>
  );
};

export default ConversationCard;
