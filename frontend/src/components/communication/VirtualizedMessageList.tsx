import { Box, CircularProgress, Fade, IconButton } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { useVirtualList } from '@/hooks/useVirtualList';
import { Typography } from '@/components/ui/Typography';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage } from '@/types';

interface VirtualizedMessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  isGroup: boolean;
  typingNames: string[];
  hasMore: boolean;
  isLoadingMore: boolean;
  /** When set, the list scrolls to and flashes the matching message. */
  highlightId?: string | null;
  onLoadMore: () => void;
  onReply: (message: ChatMessage) => void;
  onReact: (message: ChatMessage, emoji: string) => void;
  onMore: (message: ChatMessage, anchorEl: HTMLElement) => void;
  onRetry?: (message: ChatMessage) => void;
}

const dayLabel = (value: string): string => {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
};

const DatePill: React.FC<{ value: string }> = ({ value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
    <Box
      sx={{
        px: 1.5,
        py: 0.4,
        borderRadius: 999,
        fontSize: '0.7rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        color: 'text.secondary',
        background: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.05)',
      }}
    >
      {dayLabel(value)}
    </Box>
  </Box>
);

const EmptyChat: React.FC<{ label: string }> = ({ label }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 10, px: 3, textAlign: 'center' }}>
    <Box
      sx={{
        width: 76,
        height: 76,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'primary.main',
        background: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(142,128,255,0.14)' : 'rgba(109,93,246,0.1)',
      }}
    >
      <ForumOutlinedIcon sx={{ fontSize: 36 }} />
    </Box>
    <Typography variant="h6" fontWeight={700}>
      {label}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340 }}>
      Say hello and start the conversation. Your mentor and peers will see your message instantly.
    </Typography>
  </Box>
);

/**
 * Performance-conscious message list: dynamic-height windowing for long
 * threads, date separators, typing indicator and auto-scroll.
 */
export const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({
  messages,
  currentUserId,
  isGroup,
  typingNames,
  hasMore,
  isLoadingMore,
  highlightId,
  onLoadMore,
  onReply,
  onReact,
  onMore,
  onRetry,
}) => {
  const { containerRef, enabled, virtualItems, totalHeight, isNearBottom, onScroll, registerItem, scrollToBottom, scrollToIndex } =
    useVirtualList(messages, {
      estimateHeight: 84,
      overscan: 10,
      stickToBottom: true,
      hasMore,
      loadMore: onLoadMore,
      loadMoreThreshold: 160,
    });

  /** Indexes where a new date separator should appear. */
  const separatorIndexes = useMemo(() => {
    const indexes = new Set<number>();
    let previousDay = '';
    messages.forEach((message, index) => {
      const day = new Date(message.createdAt).toDateString();
      if (day !== previousDay) {
        indexes.add(index);
        previousDay = day;
      }
    });
    return indexes;
  }, [messages]);

  /* Scroll to + flash the highlighted message. */
  useEffect(() => {
    if (!highlightId) return;
    const index = messages.findIndex((message) => message.id === highlightId);
    if (index >= 0) scrollToIndex(index, 'auto');
  }, [highlightId, messages, scrollToIndex]);

  const renderBubble = (message: ChatMessage, index: number, forceFull = false) => (
    <div
      key={message.id}
      data-index={index}
      ref={enabled && !forceFull ? (element) => registerItem(index, element) : undefined}
    >
      {separatorIndexes.has(index) && <DatePill value={message.createdAt} />}
      <MessageBubble
        message={message}
        isOwn={message.senderId === currentUserId}
        showSender={isGroup && message.senderId !== currentUserId}
        highlighted={highlightId === message.id}
        onReply={onReply}
        onReact={onReact}
        onMore={onMore}
        onRetry={onRetry}
      />
    </div>
  );

  return (
    <Box
      ref={containerRef}
      onScroll={onScroll}
      sx={{
        position: 'relative',
        flexGrow: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'radial-gradient(1200px 500px at 50% -10%, rgba(109,93,246,0.08), transparent)'
            : 'radial-gradient(1200px 500px at 50% -10%, rgba(109,93,246,0.05), transparent)',
      }}
      aria-label="Messages"
      role="log"
      aria-live="polite"
    >
      {isLoadingMore && (
        <Fade in>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
            <CircularProgress size={22} thickness={5} />
          </Box>
        </Fade>
      )}

      {messages.length === 0 ? (
        <EmptyChat label={isGroup ? 'Start the group conversation' : 'Start the conversation'} />
      ) : enabled ? (
        <>
          <Box sx={{ position: 'relative', height: totalHeight }}>
            {virtualItems.map(({ item, index, offsetTop }) => (
              <Box key={item.id} sx={{ position: 'absolute', top: offsetTop, left: 0, right: 0 }}>
                {renderBubble(item, index, true)}
              </Box>
            ))}
          </Box>
          {typingNames.length > 0 && (
            <Box sx={{ px: 2, py: 1 }}>
              <TypingIndicator names={typingNames} />
            </Box>
          )}
        </>
      ) : (
        <>
          <Box sx={{ pb: 1 }}>{messages.map((message, index) => renderBubble(message, index))}</Box>
          {typingNames.length > 0 && (
            <Box sx={{ px: 2, pb: 1 }}>
              <TypingIndicator names={typingNames} />
            </Box>
          )}
        </>
      )}

      <AnimatePresence>
        {!isNearBottom && messages.length > 0 && (
          <Fade in>
            <IconButton
              size="small"
              aria-label="Jump to latest message"
              onClick={() => scrollToBottom('smooth')}
              sx={{
                position: 'sticky',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                boxShadow: (theme) => theme.shadows[6] as string,
                '&:hover': { bgcolor: 'action.hover' },
                zIndex: 5,
              }}
            >
              <KeyboardArrowDownRoundedIcon />
            </IconButton>
          </Fade>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default VirtualizedMessageList;
