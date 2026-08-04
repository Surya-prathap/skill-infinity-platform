import { Box } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { gradients } from '@/theme';

interface UnreadBadgeProps {
  count: number;
  muted?: boolean;
}

/** Animated unread count pill used across conversation cards and tabs. */
export const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count, muted = false }) => {
  if (count <= 0) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={muted ? 'muted' : 'count'}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 24 }}
      >
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 22,
            height: 22,
            px: 0.75,
            borderRadius: 999,
            fontSize: '0.72rem',
            fontWeight: 800,
            color: muted ? 'text.disabled' : '#FFFFFF',
            background: muted
              ? (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)'
              : gradients.brand,
            boxShadow: muted ? 'none' : '0 2px 8px rgba(109, 93, 246, 0.4)',
            lineHeight: 1,
          }}
        >
          {count > 99 ? '99+' : count}
        </Box>
      </motion.span>
    </AnimatePresence>
  );
};

export default UnreadBadge;
