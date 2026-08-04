import { useState } from 'react';
import { Box, Button, Chip, Grid, Tab, Tabs } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AddIcon from '@mui/icons-material/Add';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { PageHeader } from '@/components/common';
import { SessionCard, SessionTimeline } from '@/components/session';
import { EmptyState, PageSkeleton } from '@/components/feedback';
import { Pagination } from '@/components/ui/Pagination';
import { useDocumentTitle } from '@/hooks';
import { ROUTES } from '@/constants';
import { useSessionHistoryQuery, useUpcomingSessionsQuery } from '@/features/sessions';

const PAGE_SIZE = 6;

export const SessionsPage: React.FC = () => {
  useDocumentTitle('Sessions');
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);

  const upcoming = useUpcomingSessionsQuery(page, PAGE_SIZE);
  const history = useSessionHistoryQuery(page, PAGE_SIZE);

  const data = tab === 0 ? upcoming : history;

  return (
    <Box>
      <PageHeader
        title="Sessions"
        subtitle="Book, manage and attend your learning sessions."
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<CalendarMonthOutlinedIcon />}
              onClick={() => navigate(ROUTES.CALENDAR)}
            >
              Calendar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(ROUTES.MENTORS)}
            >
              Book Session
            </Button>
          </>
        }
      />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <Card sx={{ p: { xs: 2, md: 3.5 } }}>
          <Tabs
            value={tab}
            onChange={(_, value) => {
              setTab(value as number);
              setPage(0);
            }}
            sx={{ mb: 3 }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<EventAvailableOutlinedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={`Upcoming (${upcoming.data.totalElements})`}
            />
            <Tab
              icon={<HistoryOutlinedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={`History (${history.data.totalElements})`}
            />
          </Tabs>

          {data.isFetching && data.data.content.length === 0 ? (
            <PageSkeleton />
          ) : data.data.empty ? (
            <EmptyState
              icon={tab === 0 ? <EventAvailableOutlinedIcon /> : <HistoryOutlinedIcon />}
              title={tab === 0 ? 'No upcoming sessions' : 'No session history yet'}
              description={
                tab === 0
                  ? 'Book your first session with a verified mentor and start learning today.'
                  : 'Completed and cancelled sessions will appear here with ratings and notes.'
              }
              actionLabel={tab === 0 ? 'Find a mentor' : undefined}
              onAction={tab === 0 ? () => navigate(ROUTES.MENTORS) : undefined}
            />
          ) : tab === 0 ? (
            <>
              <Grid container spacing={3}>
                {data.data.content.map((session, index) => (
                  <Grid key={session.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <SessionCard session={session} index={index} />
                  </Grid>
                ))}
              </Grid>
              <Pagination
                page={page + 1}
                count={data.data.totalPages}
                totalItems={data.data.totalElements}
                pageSize={PAGE_SIZE}
                onChange={(_, value) => setPage(value - 1)}
                sx={{ mt: 3 }}
              />
            </>
          ) : (
            <>
              <SessionTimeline sessions={data.data.content} />
              <Pagination
                page={page + 1}
                count={data.data.totalPages}
                totalItems={data.data.totalElements}
                pageSize={PAGE_SIZE}
                onChange={(_, value) => setPage(value - 1)}
                sx={{ mt: 3 }}
              />
            </>
          )}

          {data.isOffline && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              Showing your local session preview — live data syncs when the API is reachable.
            </Typography>
          )}
        </Card>
      </motion.div>

      {/* Quick stats strip */}
      <Stack direction="row" gap={1.5} flexWrap="wrap" sx={{ mt: 3 }}>
        {[
          { label: 'Upcoming', value: upcoming.data.totalElements, color: '#6D5DF6' },
          { label: 'Completed', value: history.data.content.filter((s) => s.status === 'COMPLETED').length, color: '#10B981' },
          { label: 'Cancelled', value: history.data.content.filter((s) => s.status === 'CANCELLED').length, color: '#EF4444' },
          { label: 'Rescheduled', value: history.data.content.filter((s) => s.rescheduleCount && s.rescheduleCount > 0).length, color: '#3B82F6' },
        ].map((stat) => (
          <Chip
            key={stat.label}
            label={`${stat.label}: ${stat.value}`}
            sx={{ fontWeight: 700, bgcolor: `${stat.color}14`, color: stat.color, border: 1, borderColor: `${stat.color}44` }}
            variant="outlined"
          />
        ))}
      </Stack>
    </Box>
  );
};

export default SessionsPage;
