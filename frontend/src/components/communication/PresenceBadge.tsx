import { Box, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import type { PresenceStatus } from '@/types';
import { PRESENCE_META } from './presence';

interface PresenceBadgeProps {
  status: PresenceStatus;
  /** Extra label rendered next to the dot (e.g. in chat header). */
  label?: string;
  size?: number;
  showLabel?: boolean;
}

/** Animated presence indicator — a glowing dot with optional label. */
export const PresenceBadge: React.FC<PresenceBadgeProps> = ({
  status,
  label,
  size = 10,
  showLabel = true,
}) => {
  const meta = PRESENCE_META[status] ?? PRESENCE_META.offline;
  const online = status === 'online' || status === 'in-session';

  const dot = (
    <Box
      component={motion.span}
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      sx={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        background: meta.dotColor,
        display: 'inline-block',
        boxShadow: online ? `0 0 0 3px ${meta.dotColor}33, 0 0 10px ${meta.dotColor}80` : 'none',
        position: 'relative',
        '&::after': online
          ? {
              content: '""',
              position: 'absolute',
              inset: -3,
              borderRadius: '50%',
              border: `1.5px solid ${meta.dotColor}55`,
              animation: 'presencePing 2.4s cubic-bezier(0, 0, 0.2, 1) infinite',
            }
          : {},
      }}
    />
  );

  return (
    <Tooltip title={meta.label} arrow>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
        {dot}
        {showLabel && (
          <Box
            component="span"
            sx={{ fontSize: '0.78rem', fontWeight: 600, color: meta.color, lineHeight: 1 }}
          >
            {label ?? meta.label}
          </Box>
        )}
      </Box>
    </Tooltip>
  );
};

export default PresenceBadge;
