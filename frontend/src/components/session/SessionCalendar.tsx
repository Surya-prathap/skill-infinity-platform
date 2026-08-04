import { useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, Tooltip } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs, { type Dayjs } from 'dayjs';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import type { CalendarEvent, Session } from '@/types';

export type CalendarViewMode = 'month' | 'week' | 'day';

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: '#10B981',
  CANCELLED: '#EF4444',
  CONFIRMED: '#6D5DF6',
  SCHEDULED: '#6D5DF6',
  PENDING: '#F59E0B',
  IN_PROGRESS: '#3B82F6',
};

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Monday-based week start (dayjs defaults to Sunday). */
const startOfWeek = (date: Dayjs): Dayjs => {
  const day = date.day(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  return date.add(diff, 'day').startOf('day');
};

interface SessionCalendarProps {
  events: CalendarEvent[];
  sessions?: Session[];
  onSelectEvent?: (event: CalendarEvent) => void;
}

export const SessionCalendar: React.FC<SessionCalendarProps> = ({
  events,
  sessions,
  onSelectEvent,
}) => {
  const [mode, setMode] = useState<CalendarViewMode>('month');
  const [cursor, setCursor] = useState<Dayjs>(() => dayjs());

  const statusBySession = useMemo(() => {
    const map: Record<string, string> = {};
    sessions?.forEach((session) => {
      map[session.id] = session.status;
    });
    return map;
  }, [sessions]);

  const move = (direction: number) => {
    setCursor((prev) =>
      mode === 'month'
        ? prev.add(direction, 'month')
        : mode === 'week'
          ? prev.add(direction, 'week')
          : prev.add(direction, 'day'),
    );
  };

  const goToday = () => setCursor(dayjs());

  const eventsOn = (date: Dayjs): CalendarEvent[] =>
    events.filter((event) => dayjs(event.startTime).isSame(date, 'day'));

  /* ---------------- Month grid ---------------- */
  const monthCells = useMemo(() => {
    const startOfMonth = cursor.startOf('month');
    const start = startOfWeek(startOfMonth);
    return Array.from({ length: 42 }).map((_, index) => start.add(index, 'day'));
  }, [cursor]);

  const renderEventChip = (event: CalendarEvent, compact = false) => {
    const color = STATUS_COLOR[statusBySession[event.sessionId] ?? 'SCHEDULED'] ?? '#6D5DF6';
    return (
      <Tooltip key={event.id} title={`${event.title} · ${dayjs(event.startTime).format('h:mm A')}`}>
        <Box
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onSelectEvent?.(event);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSelectEvent?.(event);
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 0.75,
            py: 0.35,
            mb: 0.5,
            borderRadius: 1.25,
            cursor: 'pointer',
            background: `${color}1A`,
            border: `1px solid ${color}55`,
            '&:hover': { background: `${color}2E` },
          }}
        >
          {!compact && (
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
          )}
          <Typography variant="caption" fontWeight={700} noWrap sx={{ fontSize: '0.68rem', color: (theme) => theme.palette.text.primary }}>
            {compact ? dayjs(event.startTime).format('h:mm A') : dayjs(event.startTime).format('h:mm A')}
          </Typography>
          {!compact && (
            <Typography variant="caption" noWrap sx={{ fontSize: '0.66rem', color: 'text.secondary' }}>
              {event.title}
            </Typography>
          )}
        </Box>
      </Tooltip>
    );
  };

  /* ---------------- Week / day columns ---------------- */
  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor);
    return Array.from({ length: 7 }).map((_, index) => start.add(index, 'day'));
  }, [cursor]);

  return (
    <Box>
      {/* Toolbar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          mb: 2.5,
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <IconButton aria-label="Previous" onClick={() => move(-1)} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={800} sx={{ minWidth: 180, textAlign: 'center' }}>
            {mode === 'month'
              ? cursor.format('MMMM YYYY')
              : mode === 'week'
                ? `${weekDays[0].format('MMM D')} – ${weekDays[6].format('MMM D, YYYY')}`
                : cursor.format('dddd, MMMM D, YYYY')}
          </Typography>
          <IconButton aria-label="Next" onClick={() => move(1)} size="small">
            <ChevronRightIcon />
          </IconButton>
          <Button size="small" variant="outlined" onClick={goToday} startIcon={<TodayOutlinedIcon />}>
            Today
          </Button>
        </Stack>

        <Box sx={{ display: 'flex', gap: 0.75 }}>
          {(['month', 'week', 'day'] as CalendarViewMode[]).map((view) => (
            <Button
              key={view}
              size="small"
              variant={mode === view ? 'contained' : 'outlined'}
              onClick={() => setMode(view)}
              sx={{ textTransform: 'capitalize', minWidth: 72 }}
            >
              {view}
            </Button>
          ))}
        </Box>
      </Stack>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${mode}-${cursor.format('YYYY-MM-DD')}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {mode === 'month' && (
            <Box>
              {/* Weekday header */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, mb: 1 }}>
                {WEEKDAY_LABELS.map((label) => (
                  <Typography key={label} variant="caption" fontWeight={800} color="text.secondary" sx={{ textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                  </Typography>
                ))}
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
                {monthCells.map((date) => {
                  const dayEvents = eventsOn(date);
                  const isToday = date.isSame(dayjs(), 'day');
                  const isCurrentMonth = date.month() === cursor.month();
                  return (
                    <Box
                      key={date.format('YYYY-MM-DD')}
                      sx={{
                        minHeight: 108,
                        p: 0.75,
                        borderRadius: 2,
                        border: 1,
                        borderColor: isToday ? 'primary.main' : 'divider',
                        bgcolor: isToday ? 'action.selected' : isCurrentMonth ? 'background.paper' : 'action.hover',
                        opacity: isCurrentMonth ? 1 : 0.45,
                        transition: 'border-color 0.15s ease',
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={isToday ? 800 : 600}
                        sx={{ color: isToday ? 'primary.main' : 'text.secondary', display: 'block', mb: 0.5 }}
                      >
                        {date.format('D')}
                      </Typography>
                      {dayEvents.slice(0, 3).map((event) => renderEventChip(event))}
                      {dayEvents.length > 3 && (
                        <Typography variant="caption" color="text.disabled" sx={{ pl: 0.5 }}>
                          +{dayEvents.length - 3} more
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {mode === 'week' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
              {weekDays.map((date) => {
                const dayEvents = eventsOn(date);
                const isToday = date.isSame(dayjs(), 'day');
                return (
                  <Box
                    key={date.format('YYYY-MM-DD')}
                    sx={{
                      minHeight: 200,
                      p: 1,
                      borderRadius: 2,
                      border: 1,
                      borderColor: isToday ? 'primary.main' : 'divider',
                      bgcolor: isToday ? 'action.selected' : 'background.paper',
                    }}
                  >
                    <Typography variant="caption" fontWeight={800} sx={{ display: 'block', mb: 1, color: isToday ? 'primary.main' : 'text.secondary' }}>
                      {date.format('ddd D')}
                    </Typography>
                    {dayEvents.map((event) => renderEventChip(event, true))}
                    {dayEvents.length === 0 && (
                      <Typography variant="caption" color="text.disabled">
                        No sessions
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          )}

          {mode === 'day' && (
            <Box sx={{ borderRadius: 2.5, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
              <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.selected', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight={800}>
                  {cursor.format('dddd, MMMM D')}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {eventsOn(cursor).length} sessions scheduled
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {eventsOn(cursor).length === 0 ? (
                  <Box sx={{ py: 5, textAlign: 'center' }}>
                    <VideoCallOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No sessions on this day — enjoy the break!
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.5}>
                    {eventsOn(cursor).map((event) => {
                      const color = STATUS_COLOR[statusBySession[event.sessionId] ?? 'SCHEDULED'] ?? '#6D5DF6';
                      return (
                        <Box
                          key={event.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => onSelectEvent?.(event)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') onSelectEvent?.(event);
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 1.75,
                            borderRadius: 2.5,
                            border: 1,
                            borderColor: 'divider',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s ease, transform 0.2s ease',
                            '&:hover': { borderColor: color, transform: 'translateX(4px)' },
                          }}
                        >
                          <Box sx={{ width: 4, alignSelf: 'stretch', borderRadius: 999, background: color }} />
                          <Box sx={{ minWidth: 90 }}>
                            <Typography variant="subtitle2" fontWeight={800} sx={{ color }}>
                              {dayjs(event.startTime).format('h:mm A')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {dayjs(event.endTime).format('h:mm A')}
                            </Typography>
                          </Box>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" fontWeight={700} noWrap>
                              {event.title}
                            </Typography>
                            {event.description && (
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {event.description}
                              </Typography>
                            )}
                          </Box>
                          <Chip
                            size="small"
                            label={statusBySession[event.sessionId] ?? 'SCHEDULED'}
                            sx={{
                              color,
                              borderColor: `${color}66`,
                              fontWeight: 700,
                              bgcolor: `${color}14`,
                              textTransform: 'capitalize',
                            }}
                            variant="outlined"
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </Box>
          )}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default SessionCalendar;
