import { useMemo, useState } from 'react';
import { Box, InputAdornment, TextField, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from 'framer-motion';
import { EMOJI_CATEGORIES, flattenEmojis } from './emojis';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

/** Lightweight, dependency-free emoji picker with category tabs and search. */
export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect }) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [query, setQuery] = useState('');

  const allEmojis = useMemo(() => flattenEmojis(), []);
  const needle = query.trim().toLowerCase();

  const visible = needle
    ? allEmojis
    : (EMOJI_CATEGORIES[activeCategory]?.emojis ?? []);

  return (
    <Box sx={{ width: 300, maxWidth: '100%' }}>
      <TextField
        size="small"
        fullWidth
        placeholder="Search emojis…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        sx={{ mb: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 17 }} />
              </InputAdornment>
            ),
          },
        }}
      />

      {!needle && (
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1, overflowX: 'auto', pb: 0.5 }}>
          {EMOJI_CATEGORIES.map((category, index) => (
            <Tooltip key={category.label} title={category.label}>
              <Box
                role="button"
                tabIndex={0}
                aria-label={category.label}
                onClick={() => setActiveCategory(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') setActiveCategory(index);
                }}
                sx={{
                  width: 34,
                  height: 34,
                  minWidth: 34,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  cursor: 'pointer',
                  background: activeCategory === index ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {category.icon}
              </Box>
            </Tooltip>
          ))}
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0.5, maxHeight: 220, overflowY: 'auto' }}>
        {visible.map((emoji, index) => (
          <motion.button
            key={`${emoji}-${index}`}
            whileHover={{ scale: 1.25 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(emoji)}
            style={{
              fontSize: 20,
              padding: 4,
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              lineHeight: 1,
            }}
            aria-label={`Emoji ${emoji}`}
          >
            {emoji}
          </motion.button>
        ))}
        {visible.length === 0 && (
          <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 3, color: 'text.secondary', fontSize: '0.82rem' }}>
            No emojis found
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EmojiPicker;
