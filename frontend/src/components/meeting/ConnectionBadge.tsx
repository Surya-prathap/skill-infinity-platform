import { motion } from 'framer-motion';
import { qualityColor, qualityLabel } from './meetingHelpers';
import type { ConnectionQuality } from '@/types';

interface ConnectionBadgeProps {
  quality: ConnectionQuality;
  latencyMs?: number;
  compact?: boolean;
}

/** Premium network-quality pill shown in the meeting header. */
export const ConnectionBadge = ({ quality, latencyMs, compact = false }: ConnectionBadgeProps) => {
  const color = qualityColor[quality];
  const label = qualityLabel[quality];

  return (
    <motion.span
      role="status"
      aria-label={`Connection quality: ${label}`}
      title={`${label}${latencyMs !== undefined ? ` · ${latencyMs} ms latency` : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.02em',
        color: color,
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 999,
        padding: compact ? '3px 9px' : '4px 12px',
        backdropFilter: 'blur(12px)',
        whiteSpace: 'nowrap',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
    >
      <motion.span
        animate={{ opacity: [1, 0.35, 1] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        style={{ width: 7, height: 7, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }}
      />
      {!compact && label}
      {!compact && latencyMs !== undefined && (
        <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{latencyMs}ms</span>
      )}
    </motion.span>
  );
};
