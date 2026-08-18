import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Typography } from '@/components/ui/Typography';

interface CalendarSlotProps {
  label: string;
  sublabel?: string;
  active?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  /** Compact variant used inside the weekly grid. */
  compact?: boolean;
  /** Enables HTML5 drag & drop for moving slots between days. */
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const CalendarSlot: React.FC<CalendarSlotProps> = ({
  label,
  sublabel,
  active = true,
  onClick,
  onRemove,
  compact = false,
  draggable = false,
  onDragStart,
  onDragEnd,
}) => {
  const interactive = Boolean(onClick);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Box
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        sx={{
          position: 'relative',
          px: compact ? 1 : 1.5,
          py: compact ? 0.75 : 1,
          borderRadius: 2,
          cursor: interactive ? 'pointer' : 'default',
          userSelect: 'none',
          border: 1.5,
          borderColor: active ? 'primary.main' : 'divider',
          background: active
            ? 'linear-gradient(135deg, rgba(109,93,246,0.14), rgba(67,198,192,0.12))'
            : 'action.hover',
          color: active ? 'primary.main' : 'text.disabled',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: active ? '0 6px 16px rgba(109,93,246,0.22)' : 'none',
          },
          '&:focus-visible': { outline: '3px solid rgba(109,93,246,0.35)', outlineOffset: 1 },
          ...(onRemove && {
            '&:hover .slot-remove': { opacity: 1 },
          }),
        }}
      >
        <Typography
          variant={compact ? 'caption' : 'body2'}
          fontWeight={700}
          sx={{ display: 'block', lineHeight: 1.3 }}
        >
          {label}
        </Typography>
        {sublabel && !compact && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
            {sublabel}
          </Typography>
        )}
        {onRemove && (
          <Box
            component="span"
            className="slot-remove"
            role="button"
            aria-label={`Remove ${label}`}
            onClick={(event) => {
              event.stopPropagation();
              onRemove();
            }}
            sx={{
              position: 'absolute',
              top: -7,
              right: -7,
              width: 20,
              height: 20,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              lineHeight: 1,
              cursor: 'pointer',
              opacity: 0,
              color: '#fff',
              background: '#EF4444',
              boxShadow: '0 4px 10px rgba(239,68,68,0.4)',
              transition: 'opacity 0.15s ease',
              zIndex: 3,
            }}
          >
            ×
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

export default CalendarSlot;
