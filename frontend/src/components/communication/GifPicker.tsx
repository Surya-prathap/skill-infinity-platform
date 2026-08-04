import { Box, InputAdornment, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import { Typography } from '@/components/ui/Typography';

interface GifItem {
  label: string;
  emoji: string;
  colors: string;
}

export const SEED_GIFS: GifItem[] = [
  { label: 'Cheers', emoji: '🥂', colors: 'linear-gradient(135deg, #6D5DF6, #7C3AED)' },
  { label: 'Let’s go', emoji: '🚀', colors: 'linear-gradient(135deg, #0EA5E9, #6D5DF6)' },
  { label: 'Party', emoji: '🎉', colors: 'linear-gradient(135deg, #F59E0B, #EF4444)' },
  { label: 'Fire', emoji: '🔥', colors: 'linear-gradient(135deg, #EF4444, #7C3AED)' },
  { label: 'Coffee break', emoji: '☕', colors: 'linear-gradient(135deg, #14B8A6, #0EA5E9)' },
  { label: 'Thumbs up', emoji: '👍', colors: 'linear-gradient(135deg, #10B981, #14B8A6)' },
  { label: 'Thinking', emoji: '🤔', colors: 'linear-gradient(135deg, #8B5CF6, #EC4899)' },
  { label: 'Mind blown', emoji: '🤯', colors: 'linear-gradient(135deg, #F97316, #F59E0B)' },
  { label: 'Applause', emoji: '👏', colors: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' },
  { label: 'Rocket', emoji: '🛰️', colors: 'linear-gradient(135deg, #0F766E, #6D5DF6)' },
  { label: 'Good vibes', emoji: '🌈', colors: 'linear-gradient(135deg, #10B981, #3B82F6)' },
  { label: 'Sleepy', emoji: '😴', colors: 'linear-gradient(135deg, #64748B, #334155)' },
];

interface GifPickerProps {
  onSelect: (label: string) => void;
}

/** Architecture-ready GIF picker rendered with self-contained animated tiles. */
export const GifPicker: React.FC<GifPickerProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');

  const visible = SEED_GIFS.filter((gif) =>
    query ? gif.label.toLowerCase().includes(query.toLowerCase()) : true,
  );

  return (
    <Box sx={{ width: 320, maxWidth: '100%' }}>
      <TextField
        size="small"
        fullWidth
        placeholder="Search GIFs…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        sx={{ mb: 1.5 }}
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
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, maxHeight: 260, overflowY: 'auto' }}>
        {visible.map((gif) => (
          <motion.button
            key={gif.label}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(gif.label)}
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              height: 84,
              position: 'relative',
            }}
            aria-label={`GIF ${gif.label}`}
          >
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 0.25,
                background: gif.colors,
                backgroundSize: '300% 300%',
                animation: 'gradient-shift 6s ease infinite',
                color: '#fff',
              }}
            >
              <Box sx={{ fontSize: 30 }}>{gif.emoji}</Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: '0.66rem' }}>
                {gif.label}
              </Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: 6,
                right: 6,
                px: 0.6,
                py: 0.15,
                borderRadius: 0.75,
                fontSize: '0.58rem',
                fontWeight: 800,
                background: 'rgba(0,0,0,0.4)',
                color: '#fff',
              }}
            >
              GIF
            </Box>
          </motion.button>
        ))}
        {visible.length === 0 && (
          <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 3, color: 'text.secondary' }}>
            No GIFs found
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default GifPicker;
