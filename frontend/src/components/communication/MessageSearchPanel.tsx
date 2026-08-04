import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import { Typography } from '@/components/ui/Typography';
import { Avatar } from '@/components/ui';
import { useLocalStorage, useDebounce } from '@/hooks';
import { useSearchMessagesQuery } from '@/features/communication/hooks';
import { CURRENT_USER_ID, seedConversations } from '@/features/communication/data';
import { HighlightedText } from './richText';
import { formatRelativeTime } from '@/utils';
import type { MessageSearchFilters, MessageSearchResult } from '@/types';

interface MessageSearchPanelProps {
  onClose: () => void;
  onResultClick: (conversationId: string, messageId?: string) => void;
}

const RECENT_KEY = 'communication.recentSearches';

const FILTER_OPTIONS: { key: keyof MessageSearchFilters; label: string }[] = [
  { key: 'onlyFiles', label: '📎 Files' },
  { key: 'onlyImages', label: '🖼️ Images' },
  { key: 'onlyLinks', label: '🔗 Links' },
  { key: 'onlyMentions', label: '@ Mentions' },
  { key: 'onlyBookmarks', label: '🔖 Bookmarks' },
];

const conversationLabel = (conversationId: string): string => {
  const conversation = seedConversations.find((item) => item.id === conversationId);
  if (!conversation) return 'Conversation';
  if (conversation.title) return conversation.title;
  const other = conversation.participants.find((participant) => participant.userId !== CURRENT_USER_ID);
  return other?.name ?? 'Conversation';
};

/** Enterprise search — instant results, filters, recent queries, keyboard nav. */
export const MessageSearchPanel: React.FC<MessageSearchPanelProps> = ({ onClose, onResultClick }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 250);
  const [filters, setFilters] = useState<MessageSearchFilters>({});
  const [recent, setRecent, clearRecent] = useLocalStorage<string[]>(RECENT_KEY, []);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const { results, isFetching } = useSearchMessagesQuery(debouncedQuery, filters);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, filters]);

  const visibleResults = useMemo(
    () => (debouncedQuery ? results : []),
    [debouncedQuery, results],
  );

  const commitRecent = useCallback(() => {
    if (!debouncedQuery.trim()) return;
    setRecent((current) =>
      [debouncedQuery.trim(), ...current.filter((item) => item !== debouncedQuery)].slice(0, 6),
    );
  }, [debouncedQuery, setRecent]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, visibleResults.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter' && visibleResults[activeIndex]) {
      const result = visibleResults[activeIndex]!;
      commitRecent();
      onResultClick(result.conversationId, result.message.id);
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    const element = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    element?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const toggleFilter = (key: keyof MessageSearchFilters) => {
    setFilters((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'absolute',
        inset: 8,
        zIndex: 30,
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'transparent',
        boxShadow: '0 24px 64px rgba(2, 6, 17, 0.35)',
      }}
    >
      <Box
        sx={{
          background: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(18, 26, 43, 0.96)' : 'rgba(255, 255, 255, 0.97)',
          backdropFilter: 'blur(20px)',
          border: 1,
          borderColor: 'divider',
          borderRadius: 20,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={800}>
            Search messages
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Recent searches">
            <IconButton size="small" onClick={() => setQuery(recent[0] ?? '')} aria-label="Recent searches">
              <HistoryOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose} aria-label="Close search">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Input */}
        <Box sx={{ px: 1.5, pt: 1.25 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search messages, files, links…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            inputRef={(node) => {
              inputRef.current = node;
            }}
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
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 0.75, px: 1.5, py: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {FILTER_OPTIONS.map((option) => (
            <Chip
              key={option.key}
              label={option.label}
              size="small"
              onClick={() => toggleFilter(option.key)}
              color={filters[option.key] ? 'primary' : 'default'}
              variant={filters[option.key] ? 'filled' : 'outlined'}
              sx={{ height: 26, fontSize: '0.72rem' }}
            />
          ))}
          <Box sx={{ flexGrow: 1 }} />
          {recent.length > 0 && (
            <Chip size="small" label="Clear history" variant="outlined" onClick={clearRecent} sx={{ fontSize: '0.7rem' }} />
          )}
        </Box>

        {/* Recent searches */}
        {!debouncedQuery && recent.length > 0 && (
          <Box sx={{ px: 1.5, pb: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, fontSize: '0.66rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Recent
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.75 }}>
              {recent.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  size="small"
                  variant="outlined"
                  onClick={() => setQuery(item)}
                  sx={{ fontSize: '0.74rem' }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Results */}
        <Box
          ref={listRef}
          sx={{ flexGrow: 1, overflowY: 'auto', px: 1, py: 1 }}
          onKeyDown={handleKeyDown}
        >
          {isFetching && debouncedQuery && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Searching…
              </Typography>
            </Box>
          )}
          {!isFetching && debouncedQuery && visibleResults.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <SearchOffOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No messages match “{debouncedQuery}”
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Try fewer keywords or clear some filters
              </Typography>
            </Box>
          )}
          <AnimatePresence initial={false}>
            {visibleResults.map((result: MessageSearchResult, index) => (
              <motion.div
                key={result.message.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
              >
                <Box
                  data-active={index === activeIndex}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${conversationLabel(result.conversationId)}`}
                  onClick={() => {
                    commitRecent();
                    onResultClick(result.conversationId, result.message.id);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      commitRecent();
                      onResultClick(result.conversationId, result.message.id);
                    }
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2.5,
                    cursor: 'pointer',
                    background: index === activeIndex ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Avatar name={conversationLabel(result.conversationId)} size={32} />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight={700} noWrap>
                        {conversationLabel(result.conversationId)}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0 }}>
                        {formatRelativeTime(result.message.createdAt)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: '0.8rem' }}>
                      <HighlightedText text={result.message.content} query={debouncedQuery} maxLength={120} />
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>

        {/* Footer hint */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 1.5,
            py: 0.75,
            borderTop: 1,
            borderColor: 'divider',
            color: 'text.disabled',
            fontSize: '0.7rem',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <KeyboardArrowUpIcon sx={{ fontSize: 14 }} />
            <KeyboardArrowUpIcon sx={{ fontSize: 14, transform: 'rotate(180deg)' }} />
            navigate
          </Box>
          <span>·</span>
          <span>Enter to open</span>
          <span>·</span>
          <span>Esc to close</span>
        </Box>
      </Box>
    </motion.div>
  );
};

export default MessageSearchPanel;
