import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Typography } from '@/components/ui/Typography';
import { CalendarSlot } from './CalendarSlot';
import { DAY_SHORT_LABELS } from '@/features/mentor/constants';
import type { MentorAvailability } from '@/types';

const DAY_ORDER = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

const to12h = (time: string): string => (time ? dayjs(`2000-01-01T${time}`).format('h:mm A') : '');

interface AvailabilityCalendarProps {
  slots: MentorAvailability[];
  onToggleSlot?: (slot: MentorAvailability) => void;
  onRemoveSlot?: (slot: MentorAvailability) => void;
  onAddSlot?: (dayOfWeek: string) => void;
  readOnly?: boolean;
  /** Drag & drop — move slots between days. */
  onDragStartSlot?: (slot: MentorAvailability) => void;
  onDragEndSlot?: () => void;
  onDropOnDay?: (dayOfWeek: string) => void;
  /** Called while dragging over a day column (passes null on leave). */
  onHoverDay?: (dayOfWeek: string | null) => void;
  dropDay?: string | null;
  /** Id of the slot currently being dragged — dims the source slot for feedback. */
  draggingId?: string | null;
}

export const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  slots,
  onToggleSlot,
  onRemoveSlot,
  onAddSlot,
  readOnly = false,
  onDragStartSlot,
  onDragEndSlot,
  onDropOnDay,
  onHoverDay,
  dropDay = null,
  draggingId = null,
}) => {
  const isDropTarget = Boolean(onDropOnDay);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(7, 150px)', lg: 'repeat(7, 1fr)' },
        gap: 1.5,
        overflowX: 'auto',
        pb: 1,
      }}
    >
      {DAY_ORDER.map((day, dayIndex) => {
        const daySlots = slots.filter((slot) => slot.dayOfWeek === day);
        const isWeekend = dayIndex >= 5;
        const isOver = dropDay === day;

        return (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: dayIndex * 0.05, duration: 0.35, ease: 'easeOut' }}
          >
            <Box
              onDragOver={
                isDropTarget
                  ? (event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                      onHoverDay?.(day);
                    }
                  : undefined
              }
              onDragLeave={isDropTarget ? () => onHoverDay?.(null) : undefined}
              onDrop={
                isDropTarget
                  ? (event) => {
                      event.preventDefault();
                      onDropOnDay?.(day);
                    }
                  : undefined
              }
              sx={{
                borderRadius: 3,
                border: 1,
                borderColor: isOver ? 'success.main' : 'divider',
                bgcolor: isOver ? 'success.light' : 'background.paper',
                minHeight: 220,
                display: 'flex',
                flexDirection: 'column',
                transition:
                  'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
                '&:hover': {
                  borderColor: isWeekend ? 'warning.main' : 'primary.main',
                  boxShadow: '0 8px 24px rgba(15,23,42,0.08)',
                },
              }}
            >
              {/* Day header */}
              <Box
                sx={{
                  px: 1.5,
                  py: 1.25,
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isWeekend ? 'rgba(245,158,11,0.08)' : 'rgba(109,93,246,0.06)',
                  borderRadius: '12px 12px 0 0',
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={800}
                  sx={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: isWeekend ? 'warning.main' : 'primary.main',
                  }}
                >
                  {DAY_SHORT_LABELS[day]}
                </Typography>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  {daySlots.length > 0
                    ? `${daySlots.length} slot${daySlots.length > 1 ? 's' : ''}`
                    : '—'}
                </Typography>
              </Box>

              {/* Slots */}
              <Box sx={{ p: 1.25, display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
                {daySlots.map((slot) => {
                  const active = slot.active !== false;
                  const isDragging = draggingId != null && slot.id === draggingId;
                  return (
                    <Box
                      key={slot.id ?? `${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}`}
                      sx={{ opacity: isDragging ? 0.4 : 1, transition: 'opacity 0.15s ease' }}
                    >
                      <CalendarSlot
                        label={`${to12h(slot.startTime)} – ${to12h(slot.endTime)}`}
                        sublabel={
                          slot.recurring
                            ? 'Every week'
                            : slot.specificDate
                              ? `On ${dayjs(slot.specificDate).format('MMM D')}`
                              : 'One-off'
                        }
                        active={active}
                        onClick={onToggleSlot && !readOnly ? () => onToggleSlot(slot) : undefined}
                        onRemove={onRemoveSlot && !readOnly ? () => onRemoveSlot(slot) : undefined}
                        draggable={Boolean(onDragStartSlot && slot.id)}
                        onDragStart={
                          onDragStartSlot && slot.id ? () => onDragStartSlot(slot) : undefined
                        }
                        onDragEnd={onDragEndSlot}
                      />
                    </Box>
                  );
                })}

                {daySlots.length === 0 && !readOnly && onAddSlot && (
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => onAddSlot(day)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onAddSlot(day);
                      }
                    }}
                    sx={{
                      flexGrow: 1,
                      minHeight: 72,
                      borderRadius: 2,
                      border: '1.5px dashed',
                      borderColor: 'divider',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      cursor: 'pointer',
                      color: 'text.disabled',
                      transition:
                        'border-color 0.15s ease, color 0.15s ease, background 0.15s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                      '&:focus-visible': {
                        outline: '3px solid rgba(109,93,246,0.3)',
                        outlineOffset: 1,
                      },
                    }}
                  >
                    <AddOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography variant="caption" fontWeight={600}>
                      Add slots
                    </Typography>
                  </Box>
                )}

                {daySlots.length === 0 && readOnly && (
                  <Box
                    sx={{
                      flexGrow: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" color="text.disabled">
                      Not available
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </motion.div>
        );
      })}
    </Box>
  );
};

export default AvailabilityCalendar;
