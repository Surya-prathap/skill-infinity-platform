import { Box, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import AddReactionOutlinedIcon from '@mui/icons-material/AddReactionOutlined';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import BookmarkOutlinedIcon from '@mui/icons-material/BookmarkOutlined';
import ForwardOutlinedIcon from '@mui/icons-material/ForwardOutlined';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { Avatar } from '@/components/ui';
import { Typography } from '@/components/ui/Typography';
import { formatTime } from '@/utils';
import { RichText } from './richText';
import { AttachmentPreview } from './AttachmentPreview';
import { QUICK_REACTIONS } from './emojis';
import { showInfo } from '@/utils';
import type { ChatMessage } from '@/types';

export type MessageAction = 'copy' | 'edit' | 'delete' | 'pin' | 'bookmark' | 'forward';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  /** Render sender name + avatar (group chats). */
  showSender: boolean;
  /** Temporary attention flash (search results, pinned messages). */
  highlighted?: boolean;
  onReply: (message: ChatMessage) => void;
  onReact: (message: ChatMessage, emoji: string) => void;
  /** Opens the overflow action menu anchored to the clicked button. */
  onMore?: (message: ChatMessage, anchorEl: HTMLElement) => void;
  onRetry?: (message: ChatMessage) => void;
}

const VOICE_BARS = Array.from({ length: 26 }, (_, index) => 8 + ((index * 37) % 18));

const Receipts: React.FC<{ message: ChatMessage }> = ({ message }) => {
  if (message.status === 'sending') return <ScheduleIcon sx={{ fontSize: 13, color: 'text.disabled' }} />;
  if (message.status === 'failed') return <ErrorOutlineOutlinedIcon sx={{ fontSize: 13, color: 'error.main' }} />;
  const read = message.status === 'read';
  return read ? (
    <DoneAllIcon data-testid="read-receipts" sx={{ fontSize: 13, color: '#5EEAD4' }} />
  ) : (
    <DoneAllIcon data-testid="read-receipts" sx={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }} />
  );
};

const SystemMessage: React.FC<{ message: ChatMessage }> = ({ message }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', px: 2, py: 1 }}>
    <Box
      sx={{
        px: 2,
        py: 0.75,
        borderRadius: 999,
        fontSize: '0.74rem',
        fontWeight: 600,
        color: 'text.secondary',
        background: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)',
      }}
    >
      {message.content}
    </Box>
  </Box>
);

const CodeBlock: React.FC<{ content: string }> = ({ content }) => (
  <Box
    component="pre"
    sx={{
      m: 0,
      p: 1.5,
      borderRadius: 2,
      overflowX: 'auto',
      fontFamily: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
      fontSize: '0.78rem',
      lineHeight: 1.55,
      color: (theme) => (theme.palette.mode === 'dark' ? '#D6DCEC' : '#1E293B'),
      background: (theme) =>
        theme.palette.mode === 'dark' ? 'rgba(2,6,17,0.55)' : 'rgba(15,23,42,0.045)',
      border: '1px solid rgba(109,93,246,0.16)',
    }}
  >
    {content}
  </Box>
);

const VoiceMessage: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const duration = message.attachments?.[0]?.durationSeconds ?? 30;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 180 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          background: 'rgba(255,255,255,0.18)',
          cursor: 'pointer',
        }}
        role="button"
        aria-label="Play voice message"
        onClick={() => showInfo('Voice playback coming soon 🎙️')}
      >
        <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
        {VOICE_BARS.map((height, index) => (
          <Box
            key={index}
            sx={{
              width: 3,
              height,
              borderRadius: 999,
              background: 'currentColor',
              opacity: 0.8,
            }}
          />
        ))}
      </Box>
      <Typography variant="caption" sx={{ ml: 0.5, opacity: 0.8 }}>
        {duration}s
      </Typography>
    </Box>
  );
};

const GifTile: React.FC<{ message: ChatMessage }> = ({ message }) => (
  <Box
    sx={{
      position: 'relative',
      width: 200,
      maxWidth: '100%',
      height: 110,
      borderRadius: 3,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 44,
      background: 'linear-gradient(135deg, #6D5DF6, #7C3AED, #0EA5E9)',
      backgroundSize: '300% 300%',
      animation: 'gradient-shift 6s ease infinite',
      color: '#fff',
      cursor: 'pointer',
      '&:hover': { transform: 'scale(1.02)' },
      transition: 'transform 180ms ease',
    }}
    onClick={() => showInfo('GIF preview 🎞️')}
  >
    {message.content || '🎞️'}
    <Box
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        px: 0.75,
        py: 0.25,
        borderRadius: 1,
        fontSize: '0.62rem',
        fontWeight: 800,
        letterSpacing: '0.08em',
        background: 'rgba(0,0,0,0.45)',
        color: '#fff',
      }}
    >
      GIF
    </Box>
  </Box>
);

/** A single premium chat message — aligned, animated, reactive. */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showSender,
  highlighted = false,
  onReply,
  onReact,
  onMore,
  onRetry,
}) => {
  if (message.kind === 'system') return <SystemMessage message={message} />;

  const attachments = message.attachments ?? [];
  const reactions = message.reactions ?? [];
  const otherRead = (message.readBy?.length ?? 0) > 0;

  const contentBlock = () => {
    if (message.kind === 'code') return <CodeBlock content={message.content} />;
    if (message.kind === 'voice') return <VoiceMessage message={message} />;
    if (message.kind === 'gif') return <GifTile message={message} />;
    return (
      <RichText
        text={message.deleted ? 'This message was deleted.' : message.content}
        className="message-text"
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className="message-row"
      style={{ display: 'flex', alignItems: 'flex-end', gap: 10, paddingInline: 16, paddingTop: 4 }}
    >
      {showSender && !isOwn && (
        <Box sx={{ width: 30, flexShrink: 0, alignSelf: 'flex-start', mt: 0.75 }}>
          <Avatar name={message.senderName} size={30} />
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwn ? 'flex-end' : 'flex-start',
          maxWidth: { xs: '82%', sm: '72%', md: '66%' },
          width: 'fit-content',
          position: 'relative',
        }}
      >
        {highlighted && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.55, 0] }}
            transition={{ duration: 2.2, times: [0, 0.2, 1] }}
            style={{
              position: 'absolute',
              inset: -6,
              borderRadius: 20,
              background: 'rgba(245, 158, 11, 0.28)',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        )}
        {showSender && !isOwn && (
          <Typography variant="caption" fontWeight={700} sx={{ ml: 0.75, mb: 0.25, color: 'text.secondary' }}>
            {message.senderName}
          </Typography>
        )}

        {message.replyTo && !message.deleted && (
          <Box
            sx={{
              mb: 0.5,
              px: 1.25,
              py: 0.6,
              borderRadius: 2,
              maxWidth: 320,
              borderLeft: '3px solid',
              borderColor: isOwn ? 'rgba(255,255,255,0.5)' : 'primary.light',
              background: isOwn ? 'rgba(255,255,255,0.12)' : 'rgba(109,93,246,0.08)',
              cursor: 'pointer',
            }}
          >
            <Typography variant="caption" fontWeight={800} sx={{ display: 'block', opacity: 0.9 }}>
              {message.replyTo.senderName}
            </Typography>
            <Typography variant="caption" noWrap sx={{ display: 'block', opacity: 0.75, maxWidth: 280 }}>
              {message.replyTo.content}
            </Typography>
          </Box>
        )}

        {message.forwardedFrom && !message.deleted && (
          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25, opacity: 0.75 }}>
            <ForwardOutlinedIcon sx={{ fontSize: 12 }} />
            Forwarded from {message.forwardedFrom}
          </Typography>
        )}

        <Box
          sx={{
            position: 'relative',
            px: 1.5,
            py: 0.9,
            borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            background: isOwn
              ? 'linear-gradient(135deg, #6D5DF6 0%, #5443D4 100%)'
              : (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.05)',
            color: isOwn ? '#FFFFFF' : 'text.primary',
            boxShadow: isOwn
              ? '0 6px 18px rgba(109, 93, 246, 0.32)'
              : (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 2px 8px rgba(0,0,0,0.25)'
                    : '0 2px 8px rgba(15,23,42,0.06)',
            border: isOwn
              ? '1px solid rgba(255,255,255,0.12)'
              : '1px solid rgba(109,93,246,0.12)',
            outline: message.status === 'failed' ? '1.5px solid' : 'none',
            outlineColor: message.status === 'failed' ? 'error.main' : 'transparent',
            maxWidth: '100%',
            '&:hover .message-hover-actions': { opacity: 1, transform: 'translateY(0)' },
          }}
        >
          {attachments.length > 0 && message.kind !== 'voice' && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: message.content ? 0.75 : 0 }}>
              {attachments.map((attachment) => (
                <AttachmentPreview key={attachment.id} attachment={attachment} />
              ))}
            </Box>
          )}
          {(message.kind === 'text' || message.kind === 'code' || message.kind === 'gif' || message.kind === 'voice') && (
            <Box sx={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{contentBlock()}</Box>
          )}
          {message.edited && !message.deleted && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.35, opacity: 0.65, fontSize: '0.66rem' }}>
              (edited)
            </Typography>
          )}

          {/* meta: timestamp + receipts */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 0.5,
              mt: 0.5,
              opacity: 0.75,
              fontSize: '0.64rem',
            }}
          >
            {isOwn && message.status === 'failed' && (
              <Tooltip title="Retry">
                <IconButton
                  size="small"
                  onClick={() => onRetry?.(message)}
                  sx={{ width: 18, height: 18 }}
                  aria-label="Retry sending message"
                >
                  <ErrorOutlineOutlinedIcon sx={{ fontSize: 14, color: 'error.main' }} />
                </IconButton>
              </Tooltip>
            )}
            <span>{formatTime(message.createdAt)}</span>
            {isOwn && <Receipts message={message} />}
            {!isOwn && otherRead && <CheckIcon sx={{ fontSize: 12 }} />}
          </Box>
        </Box>

        {/* pinned / bookmark chips */}
        {(message.pinned || message.bookmarked) && !message.deleted && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.4 }}>
            {message.pinned && (
              <Tooltip title="Pinned message">
                <PushPinOutlinedIcon sx={{ fontSize: 12, color: 'primary.light' }} />
              </Tooltip>
            )}
            {message.bookmarked && (
              <Tooltip title="Bookmarked">
                <BookmarkOutlinedIcon sx={{ fontSize: 12, color: 'warning.main' }} />
              </Tooltip>
            )}
          </Box>
        )}

        {/* reactions */}
        {reactions.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5, maxWidth: 320 }}>
            {reactions.map((reaction) => (
              <motion.button
                key={reaction.emoji}
                whileTap={{ scale: 0.9 }}
                onClick={() => onReact(message, reaction.emoji)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 999,
                  border: reaction.reactedByMe
                    ? '1.5px solid rgba(109,93,246,0.6)'
                    : '1px solid rgba(120,120,160,0.25)',
                  background: reaction.reactedByMe
                    ? 'rgba(109,93,246,0.12)'
                    : 'rgba(120,120,160,0.08)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
                aria-label={`Reaction ${reaction.emoji}`}
              >
                <span>{reaction.emoji}</span>
                <span style={{ opacity: 0.8 }}>{reaction.count}</span>
              </motion.button>
            ))}
          </Box>
        )}
      </Box>

      {/* hover actions */}
      <Box
        className="message-hover-actions"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
          opacity: 0,
          transform: 'translateY(6px)',
          transition: 'opacity 140ms ease, transform 140ms ease',
          background: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(18,26,43,0.85)' : 'rgba(255,255,255,0.9)',
          border: 1,
          borderColor: 'divider',
          borderRadius: 999,
          px: 0.5,
          py: 0.25,
          boxShadow: (theme) => theme.shadows[3] as string,
          alignSelf: 'center',
        }}
      >
        <Tooltip title="React">
          <IconButton size="small" aria-label="Add reaction" onClick={() => onReact(message, QUICK_REACTIONS[0] ?? '👍')} sx={{ width: 26, height: 26 }}>
            <AddReactionOutlinedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reply">
          <IconButton size="small" aria-label="Reply" onClick={() => onReply(message)} sx={{ width: 26, height: 26 }}>
            <ReplyOutlinedIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="More actions">
          <IconButton
            size="small"
            aria-label="More actions"
            onClick={(event) => onMore?.(message, event.currentTarget)}
            sx={{ width: 26, height: 26 }}
          >
            <MoreHorizIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </motion.div>
  );
};

export default MessageBubble;
