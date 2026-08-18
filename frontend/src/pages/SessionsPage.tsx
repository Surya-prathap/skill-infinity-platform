import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Tab,
  Tabs,
  TextField,
  InputAdornment,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AddIcon from '@mui/icons-material/Add';
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { PageHeader } from '@/components/common';
import { SessionCard, SessionTimeline } from '@/components/session';
import { EmptyState, PageSkeleton } from '@/components/feedback';
import { Pagination } from '@/components/ui/Pagination';
import { useDocumentTitle } from '@/hooks';
import { ROUTES } from '@/constants';
import {
  useSessionHistoryQuery,
  useUpcomingSessionsQuery,
  useUpcomingCommunitySessionsQuery,
  useJoinCommunitySessionMutation,
  useCommunityAllowanceQuery,
} from '@/features/sessions';
import { formatDateTime, parseApiTime } from '@/utils';
import type { Session } from '@/types';

const PAGE_SIZE = 6;

export const SessionsPage: React.FC = () => {
  useDocumentTitle('Sessions');
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [costFilter, setCostFilter] = useState<'all' | 'free' | 'paid'>('all');

  const upcoming = useUpcomingSessionsQuery(page, PAGE_SIZE);
  const history = useSessionHistoryQuery(page, PAGE_SIZE);
  const community = useUpcomingCommunitySessionsQuery(page, PAGE_SIZE);
  const { allowance } = useCommunityAllowanceQuery();
  const joinCommunity = useJoinCommunitySessionMutation();

  /** The community session awaiting explicit confirmation before joining. */
  const [pendingJoin, setPendingJoin] = useState<Session | null>(null);

  const handleTabChange = (_: unknown, value: number) => {
    setTab(value as number);
    setPage(0);
  };

  const communityList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (community.data.content ?? []).filter((session) => {
      const matchesQuery =
        !q ||
        (session.topic ?? session.title ?? '').toLowerCase().includes(q) ||
        (session.mentorName ?? '').toLowerCase().includes(q) ||
        (session.description ?? '').toLowerCase().includes(q);
      const price = session.price ?? 0;
      const matchesCost =
        costFilter === 'all' ||
        (costFilter === 'free' && price === 0) ||
        (costFilter === 'paid' && price > 0);
      return matchesQuery && matchesCost;
    });
  }, [community.data.content, query, costFilter]);

  const seatsLeft = (session: Session): number => {
    if (session.remainingSeats !== undefined) return session.remainingSeats;
    const capacity = session.maxParticipants ?? 20;
    const taken = session.learnerCount ?? Math.max(0, (session.participantCount ?? 1) - 1);
    return Math.max(0, capacity - taken);
  };

  const isPast = (session: Session): boolean =>
    Boolean(session.startTime && (parseApiTime(session.startTime)?.valueOf() ?? 0) <= Date.now());

  return (
    <Box>
      <PageHeader
        title="Sessions"
        subtitle="Book, manage and attend your learning sessions."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(ROUTES.MENTORS)}>
            Book Session
          </Button>
        }
      />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <Card sx={{ p: { xs: 2, md: 3.5 } }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
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
            <Tab
              icon={<GroupsOutlinedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Community"
            />
          </Tabs>

          {/* ============ Upcoming / History ============ */}
          {tab !== 2 ? (
            (() => {
              // The backend decides what belongs in Upcoming vs History: a
              // session stays in Upcoming for its whole window (join window →
              // end time) and only moves to History once finished/expired.
              const data = tab === 0 ? upcoming : history;
              const sessions = data.data.content;
              return data.isFetching && data.data.content.length === 0 ? (
                <PageSkeleton />
              ) : sessions.length === 0 ? (
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
                    {sessions.map((session, index) => (
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
              );
            })()
          ) : (
            /* ============ Community sessions ============ */
            <>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 3, alignItems: { md: 'center' } }}>
                <TextField
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search community sessions…"
                  size="small"
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchOutlinedIcon sx={{ fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Stack direction="row" spacing={1}>
                  {(
                    [
                      { key: 'all', label: 'All' },
                      { key: 'free', label: 'FREE' },
                      { key: 'paid', label: 'Paid' },
                    ] as const
                  ).map((filter) => (
                    <Chip
                      key={filter.key}
                      label={filter.label}
                      size="small"
                      clickable
                      color={costFilter === filter.key ? 'primary' : 'default'}
                      variant={costFilter === filter.key ? 'filled' : 'outlined'}
                      onClick={() => setCostFilter(filter.key)}
                      sx={{ fontWeight: 700 }}
                    />
                  ))}
                </Stack>
                {allowance && (
                  <Chip
                    label={`${allowance.remaining} free session${allowance.remaining === 1 ? '' : 's'} left this month`}
                    size="small"
                    color={allowance.remaining > 0 ? 'success' : 'error'}
                    variant="outlined"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>

              {community.isFetching && community.data.content.length === 0 ? (
                <PageSkeleton />
              ) : communityList.length === 0 ? (
                <EmptyState
                  icon={<GroupsOutlinedIcon />}
                  title="No community sessions found"
                  description={
                    query || costFilter !== 'all'
                      ? 'Try a different search or filter.'
                      : 'Mentors will publish community sessions here — join group sessions on topics you care about.'
                  }
                />
              ) : (
                <>
                  <Grid container spacing={3}>
                    {communityList.map((session, index) => {
                      const seats = seatsLeft(session);
                      const price = session.price ?? 0;
                      const isFree = price === 0;
                      const joined = session.learnerCount !== undefined && session.remainingSeats !== undefined;
                      return (
                        <Grid key={session.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                          <motion.div
                            initial={{ opacity: 0, y: 18 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-30px' }}
                            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25) }}
                            whileHover={{ y: -4 }}
                            style={{ height: '100%' }}
                          >
                            <Card hoverable sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                                <Chip
                                  label={isFree ? 'FREE' : `${price} credit${price > 1 ? 's' : ''}`}
                                  size="small"
                                  color={isFree ? 'success' : 'primary'}
                                  variant={isFree ? 'filled' : 'outlined'}
                                  sx={{ fontWeight: 800 }}
                                />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                  {formatDateTime(session.startTime)}
                                </Typography>
                              </Stack>

                              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5, cursor: 'pointer' }} onClick={() => navigate(ROUTES.SESSION_DETAILS.replace(':sessionId', session.id))}>
                                {session.topic ?? session.title ?? 'Community session'}
                              </Typography>
                              {session.description && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    mb: 1.5,
                                    lineHeight: 1.6,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {session.description}
                                </Typography>
                              )}

                              <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 1.5 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                  Mentor: {session.mentorName ?? 'Community mentor'}
                                </Typography>
                              </Stack>

                              <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }} flexWrap="wrap">
                                <Typography variant="caption" fontWeight={600} color="text.secondary">
                                  {session.durationMinutes} min
                                </Typography>
                                <Typography
                                  variant="caption"
                                  fontWeight={700}
                                  color={seats === 0 ? 'error.main' : seats <= 3 ? 'warning.main' : 'success.main'}
                                >
                                  {seats === 0 ? 'Full' : `${seats} seat${seats === 1 ? '' : 's'} left`}
                                  {joined ? ` · ${session.learnerCount ?? 0}/${session.maxParticipants ?? 20}` : ''}
                                </Typography>
                              </Stack>

                              <Box sx={{ mt: 'auto' }}>
                                <Button
                                  fullWidth
                                  variant="contained"
                                  size="small"
                                  disabled={seats === 0 || isPast(session) || joinCommunity.isPending}
                                  onClick={() => setPendingJoin(session)}
                                  startIcon={isPast(session) ? undefined : <VideoCallOutlinedIcon />}
                                  color={isFree ? 'success' : 'primary'}
                                >
                                  {seats === 0 ? 'Session full' : isPast(session) ? 'Session started' : isFree ? 'Join free' : `Join · ${price} credit${price > 1 ? 's' : ''}`}
                                </Button>
                              </Box>
                            </Card>
                          </motion.div>
                        </Grid>
                      );
                    })}
                  </Grid>
                  <Pagination
                    page={page + 1}
                    count={community.data.totalPages}
                    totalItems={community.data.totalElements}
                    pageSize={PAGE_SIZE}
                    onChange={(_, value) => setPage(value - 1)}
                    sx={{ mt: 3 }}
                  />
                </>
              )}
            </>
          )}

          {(tab === 0 ? upcoming : tab === 1 ? history : community).isOffline && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              Showing your local session preview — live data syncs when the API is reachable.
            </Typography>
          )}
        </Card>
      </motion.div>

      {/* ============ Free / community session confirmation ============ */}
      <Dialog open={Boolean(pendingJoin)} onClose={() => setPendingJoin(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {pendingJoin && (pendingJoin.price ?? 0) === 0
            ? 'Book this free session?'
            : 'Confirm this booking?'}
        </DialogTitle>
        <DialogContent>
          {pendingJoin && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {pendingJoin && (pendingJoin.price ?? 0) === 0
                  ? 'Are you sure you want to book this free session?'
                  : 'Please confirm the details below before booking.'}
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Mentor</Typography>
                  <Typography variant="body2" fontWeight={700}>{pendingJoin.mentorName ?? 'Community mentor'}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Skill / Topic</Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ textAlign: 'right', maxWidth: '60%' }}>
                    {pendingJoin.topic ?? pendingJoin.title ?? 'Community session'}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {pendingJoin.startTime ? parseApiTime(pendingJoin.startTime)?.format('ddd, D MMM YYYY') : '—'}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Time</Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {pendingJoin.startTime ? parseApiTime(pendingJoin.startTime)?.format('h:mm A') : '—'}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="body2" fontWeight={700}>{pendingJoin.durationMinutes} min</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Session type</Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {(pendingJoin.price ?? 0) === 0 ? 'FREE Community Session' : `Community Session · ${pendingJoin.price} credit${(pendingJoin.price ?? 0) > 1 ? 's' : ''}`}
                  </Typography>
                </Stack>
              </Stack>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPendingJoin(null)}>Cancel</Button>
          <Button
            color="success"
            variant="contained"
            disabled={joinCommunity.isPending}
            onClick={() => {
              if (pendingJoin) joinCommunity.mutate(pendingJoin.id);
              setPendingJoin(null);
            }}
          >
            {joinCommunity.isPending ? 'Booking…' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick stats strip */}
      <Stack direction="row" gap={1.5} flexWrap="wrap" sx={{ mt: 3 }}>
        {[
          { label: 'Upcoming', value: upcoming.data.totalElements, color: '#6D5DF6' },
          { label: 'Completed', value: history.data.content.filter((s) => s.status === 'COMPLETED').length, color: '#10B981' },
          { label: 'Cancelled', value: history.data.content.filter((s) => s.status === 'CANCELLED').length, color: '#EF4444' },
          { label: 'Rescheduled', value: history.data.content.filter((s) => s.rescheduleCount && s.rescheduleCount > 0).length, color: '#3B82F6' },
          { label: 'Community', value: community.data.totalElements, color: '#14B8A6' },
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
