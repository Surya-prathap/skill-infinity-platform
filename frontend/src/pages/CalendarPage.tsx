import { useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, Modal, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import { Card } from '@/components/ui/Card';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { PageHeader } from '@/components/common';
import { SessionCalendar } from '@/components/session';
import { EmptyState } from '@/components/feedback';
import { useDocumentTitle } from '@/hooks';
import { ROUTES } from '@/constants';
import { useCalendarQuery, useSessionHistoryQuery, useUpcomingSessionsQuery } from '@/features/sessions';
import { sessionService } from '@/services';
import { formatDateTime } from '@/utils';
import type { CalendarEvent, Session, SessionStatus } from '@/types';

export const CalendarPage: React.FC = () => {
  useDocumentTitle('Calendar');
  const navigate = useNavigate();
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [statusFilter, setStatusFilter] = useState<SessionStatus | 'ALL'>('ALL');
  const [dateRange] = useState<{ start?: string; end?: string }>(() => ({
    start: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    end: dayjs().add(90, 'day').format('YYYY-MM-DD'),
  }));

  const { data, isOffline } = useCalendarQuery(dateRange.start, dateRange.end);
  const { data: upcomingData } = useUpcomingSessionsQuery(0, 100);
  const { data: historyData } = useSessionHistoryQuery(0, 100);

  const realSessions = useMemo<Session[]>(() => {
    const map = new Map<string, Session>();
    for (const session of [...upcomingData.content, ...historyData.content]) {
      map.set(session.id, session);
    }
    return [...map.values()];
  }, [upcomingData.content, historyData.content]);

  const events = useMemo(() => {
    if (statusFilter === 'ALL') return data.events;
    const statusBySession = new Map(realSessions.map((session) => [session.id, session.status]));
    return data.events.filter((event) => statusBySession.get(event.sessionId) === statusFilter);
  }, [data.events, statusFilter, realSessions]);

  const exportCalendar = async () => {
    try {
      const response = await sessionService.exportCalendarIcs();
      const blob = new Blob([response.data], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'sessions.ics';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      // Offline — keep the UI functional.
      window.open('', '_blank');
    }
  };

  const openSession = (event: CalendarEvent) => {
    setSelected(null);
    navigate(ROUTES.SESSION_DETAILS.replace(':sessionId', event.sessionId));
  };

  return (
    <Box>
      <PageHeader
        title="Calendar"
        subtitle="Your sessions at a glance — month, week or day view."
        actions={
          <>
            <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={() => void exportCalendar()}>
              Export ICS
            </Button>
            <Button
              variant="contained"
              startIcon={<EventAvailableOutlinedIcon />}
              onClick={() => navigate(ROUTES.MENTORS)}
            >
              Book session
            </Button>
          </>
        }
      />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <Card sx={{ p: { xs: 2, md: 3.5 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1.5} sx={{ mb: 2.5 }}>
            <Stack direction="row" alignItems="center" gap={1}>
              <CalendarMonthOutlinedIcon sx={{ color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight={800}>
                Session schedule
              </Typography>
            </Stack>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {(['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map((status) => {
                const active = statusFilter === status;
                return (
                  <Chip
                    key={status}
                    label={status === 'ALL' ? 'All' : status.replace(/_/g, ' ').toLowerCase()}
                    size="small"
                    onClick={() => setStatusFilter(status)}
                    sx={{
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      bgcolor: active ? 'primary.main' : 'background.paper',
                      color: active ? '#fff' : 'text.secondary',
                      border: 1,
                      borderColor: active ? 'primary.main' : 'divider',
                    }}
                  />
                );
              })}
            </Box>
          </Stack>

          {events.length === 0 ? (
            <EmptyState
              icon={<CalendarMonthOutlinedIcon />}
              title="No sessions scheduled"
              description="Your booked sessions will appear here. Explore mentors and book your first session."
              actionLabel="Find a mentor"
              onAction={() => navigate(ROUTES.MENTORS)}
            />
          ) : (
            <SessionCalendar events={events} sessions={realSessions} onSelectEvent={setSelected} />
          )}

          {isOffline && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              Live calendar syncs when the API is reachable.
            </Typography>
          )}
        </Card>
      </motion.div>

      {/* Event detail modal */}
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} aria-labelledby="event-modal-title">
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90vw', sm: 420 },
            bgcolor: 'background.paper',
            borderRadius: 4,
            p: 3.5,
            outline: 'none',
          }}
        >
          {selected && (
            <>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                {selected.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                {formatDateTime(selected.startTime)} – {dayjs(selected.endTime).format('h:mm A')}
              </Typography>
              {selected.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {selected.description}
                </Typography>
              )}
              <Stack spacing={2} sx={{ mt: 2 }}>
                <TextField
                  size="small"
                  label="Meeting link"
                  value={selected.location ?? ''}
                  slotProps={{ input: { readOnly: true } }}
                  fullWidth
                />
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6 }}>
                    <Button fullWidth variant="contained" onClick={() => openSession(selected)}>
                      Open session
                    </Button>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Button fullWidth variant="outlined" onClick={() => setSelected(null)}>
                      Close
                    </Button>
                  </Grid>
                </Grid>
              </Stack>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default CalendarPage;
