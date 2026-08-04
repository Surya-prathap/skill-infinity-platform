import { Box } from '@mui/material';
import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  names?: string[];
  /** Renders just the bouncing dots (used inside message rows). */
  compact?: boolean;
}

const DOTS = [0, 1, 2];

/** Premium “X is typing…” indicator with bouncing dots. */
export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ names = [], compact = false }) => {
  const label =
    names.length === 0
      ? 'Someone is typing'
      : names.length === 1
        ? `${names[0]} is typing`
        : `${names.slice(0, 2).join(' and ')} are typing`;

  const dots = (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      {DOTS.map((dot) => (
        <motion.span
          key={dot}
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15, ease: 'easeInOut' }}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'currentColor',
            display: 'inline-block',
          }}
        />
      ))}
    </Box>
  );

  if (compact) return dots;

  return (
    <Box
      aria-live="polite"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        px: 1.25,
        py: 0.75,
        borderRadius: 999,
        color: 'primary.light',
        background: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(142,128,255,0.12)' : 'rgba(109,93,246,0.08)',
        fontSize: '0.78rem',
        fontWeight: 600,
        width: 'fit-content',
      }}
    >
      {dots}
      <span>{label}…</span>
    </Box>
  );
};

export default TypingIndicator;
