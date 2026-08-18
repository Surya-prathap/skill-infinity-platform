import { Box, Button as MuiButton, Chip, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PriceChangeOutlinedIcon from '@mui/icons-material/PriceChangeOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AccessTimeFilledOutlinedIcon from '@mui/icons-material/AccessTimeFilledOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Timeline } from '@/components/ui/Timeline';
import { AreaChart, BarChart, DonutChart } from '@/components/charts';
import { AnalyticsCard, GradientCard, MentorCard, ProgressCard } from '@/components/mentor';
import { CommunityImpactCard } from '@/components/mentor/CommunityImpactCard';
import { ScheduleCommunitySessionCard } from '@/components/mentor/ScheduleCommunitySessionCard';
import {
  getSessionJoinState,
  joinSessionMeeting,
  useApproveBookingMutation,
  useCommunityImpactQuery,
  useMentorBookingsQuery,
  useRejectBookingMutation,
  useUpcomingSessionsQuery,
} from '@/features/sessions';
import { useWalletMonthlySeriesQuery } from '@/features/wallet';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/selectors';
import { useDocumentTitle } from '@/hooks';
import { ROUTES } from '@/constants';
import { formatRelativeTime, nowInAppZone, parseApiTime } from '@/utils';
import { useMentorDashboardQuery, useMentorProfileQuery } from '@/features/mentor/hooks';
import {
  MENTOR_ACTIVITY,
  MENTOR_REVIEWS,
  MENTOR_SESSION_MIX,
  MENTOR_WEEKLY_ACTIVITY,
  seedMentor,
} from '@/features/mentor/data';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const QUICK_ACTIONS = [
  // A mentor is also a learner — they can book other mentors and earn/learn.
  { label: 'Find mentors to learn from', path: ROUTES.MENTORS, icon: <SearchOutlinedIcon />, color: '#6D5DF6' },
  { label: 'Add availability', path: ROUTES.MENTOR_AVAILABILITY, icon: <CalendarMonthOutlinedIcon />, color: '#14B8A6' },
  { label: 'Manage pricing', path: ROUTES.MENTOR_PRICING, icon: <PriceChangeOutlinedIcon />, color: '#F59E0B' },
  { label: 'Edit profile', path: ROUTES.PROFILE, icon: <AutoGraphOutlinedIcon />, color: '#EC4899' },
];

export const MentorDashboardPage: React.FC = () => {
  useDocumentTitle('Mentor Dashboard');
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const { mentor, isOffline } = useMentorProfileQuery();
  const { dashboard } = useMentorDashboardQuery();
  const { impact: communityImpact, isLoading: impactLoading } = useCommunityImpactQuery(mentor?.userId);

  // Real booking requests for this mentor — never another mentor's requests.
  const { data: mentorBookings, isFetching: bookingsLoading } = useMentorBookingsQuery('PENDING');
  const approveBooking = useApproveBookingMutation();
  const rejectBooking = useRejectBookingMutation();
  const pendingRequests = mentorBookings.content.length;

  // Real sessions the mentor participates in (as mentor OR as learner) —
  // no seeded/dummy rows. Discord join links come straight from the API.
  const { data: upcomingData, isFetching: upcomingLoading } = useUpcomingSessionsQuery(0, 30, { silent: true });
  const { series: earningsSeries } = useWalletMonthlySeriesQuery(7);
  const upcomingSessions = upcomingData.content;
  const todaySessions = upcomingSessions.filter((session) =>
    session.startTime ? parseApiTime(session.startTime)?.isSame(nowInAppZone(), 'day') : false,
  );

  /**
   * True when the session is inside its join window. The Join button must
   * never be removed: when no real invite is configured, clicking answers
   * "Meeting link is not available yet." (never Discord Home, never a fake
   * URL).
   */
  const canJoin = (session: (typeof upcomingSessions)[number]): boolean =>
    getSessionJoinState(session).eligible;
  const laterSessions = upcomingSessions.filter(
    (session) => !session.startTime || !parseApiTime(session.startTime)?.isSame(nowInAppZone(), 'day'),
  );

  /** The other participant in a session the mentor is part of. */
  const counterpart = (session: (typeof upcomingSessions)[number]): string => {
    if (session.mentorId === user?.userId) return session.learnerName ?? 'Learner';
    return session.mentorName ?? 'Mentor';
  };

  const stats = dashboard.statistics;
  const profile = mentor?.profile;
  const name = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.username || 'Mentor';
  const available = profile?.acceptingStudents !== false;

  const metrics = [
    {
      label: 'Total Earnings',
      value: stats?.totalEarnings ?? 0,
      suffix: ' credits',
      decimals: 0,
      color: '#10B981',
      icon: <MonetizationOnOutlinedIcon />,
    },
    {
      label: 'Sessions Completed',
      value: stats?.completedSessions ?? 0,
      delta: `${stats?.upcomingSessions ?? 0} upcoming`,
      color: '#6D5DF6',
      icon: <EventAvailableOutlinedIcon />,
    },
    {
      label: 'Average Rating',
      value: stats?.averageRating ?? 0,
      decimals: 1,
      suffix: ' / 5',
      delta: `${stats?.totalReviews ?? 0} reviews`,
      color: '#F59E0B',
      icon: <StarOutlineOutlinedIcon />,
    },
    {
      label: 'Active Students',
      value: stats?.totalStudents ?? 0,
      color: '#EC4899',
      icon: <GroupOutlinedIcon />,
    },
  ];

  return (
    <Box>
      {/* ================= Hero ================= */}
      <GradientCard gradient="hero" sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ alignItems: { xs: 'flex-start', md: 'center' } }} gap={2}>
          <Stack direction="row" alignItems="center" gap={2} sx={{ flexGrow: 1 }}>
            <Avatar name={name} size={56} sx={{ border: '2px solid rgba(255,255,255,0.5)' }} />
            <Box>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                  Welcome back, {name.split(' ')[0]} 👋
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {isOffline
                  ? 'Offline preview — showing your saved mentor data.'
                  : profile?.headline || 'Your mentor studio at a glance.'}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <StatusBadge label={available ? 'Accepting students' : 'Not accepting'} color={available ? 'success' : 'warning'} />
            <MuiButton
              variant="contained"
              size="small"
              sx={{ bgcolor: '#fff', color: '#5443D4', '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' } }}
              onClick={() => navigate(ROUTES.MENTOR_AVAILABILITY)}
              startIcon={<CalendarMonthOutlinedIcon />}
            >
              Manage schedule
            </MuiButton>
          </Stack>
        </Stack>
      </GradientCard>

      {/* ================= Metrics ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metrics.map((metric, index) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={index} style={{ height: '100%' }}>
              <AnalyticsCard title={metric.label} badge={metric.delta} icon={metric.icon} iconColor={metric.color}>
                <Stack direction="row" alignItems="baseline" gap={0.75}>
                  <Typography variant="h3" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
                    {metric.value.toLocaleString('en-US', {
                      minimumFractionDigits: metric.decimals,
                      maximumFractionDigits: metric.decimals,
                    })}
                  </Typography>
                  {metric.suffix && (
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {metric.suffix}
                    </Typography>
                  )}
                </Stack>
              </AnalyticsCard>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* ================= Session requests ================= */}
      <AnalyticsCard
        title="Session Requests"
        subtitle={pendingRequests === 0 ? 'No pending requests' : `${pendingRequests} learner${pendingRequests === 1 ? '' : 's'} want${pendingRequests === 1 ? 's' : ''} to book you`}
        icon={<EventAvailableOutlinedIcon />}
        iconColor="#6D5DF6"
        sx={{ mb: 3 }}
      >
        {bookingsLoading && mentorBookings.content.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Loading your requests…
          </Typography>
        ) : mentorBookings.content.length === 0 ? (
          <Box
            sx={{
              borderRadius: 2.5,
              border: 1,
              borderStyle: 'dashed',
              borderColor: 'divider',
              p: 3,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No pending requests right now. Learners who book one of your available slots will appear here
              for you to accept or reject.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {mentorBookings.content.map((booking) => (
              <Box
                key={booking.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: 2.5,
                  border: 1,
                  borderColor: 'divider',
                  flexWrap: 'wrap',
                  transition: 'border-color 0.2s ease',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Avatar name={booking.learnerName ?? 'Learner'} size={40} />
                <Box sx={{ flexGrow: 1, minWidth: 200 }}>
                  <Typography variant="subtitle2" fontWeight={800}>
                    {booking.learnerName ?? 'Learner'} wants {booking.topic ?? 'a session'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {booking.preferredStartTime ? parseApiTime(booking.preferredStartTime)?.format('ddd, D MMM · h:mm A') : ''}{' '}
                    · {booking.durationMinutes} min · {(booking.price ?? 0) === 0 ? 'Free' : `${booking.price ?? 0} credits`}
                  </Typography>
                </Box>
                <Stack direction="row" gap={1}>
                  <MuiButton
                    size="small"
                    variant="contained"
                    color="success"
                    disabled={approveBooking.isPending || rejectBooking.isPending}
                    onClick={() => approveBooking.mutate(booking.id)}
                  >
                    Accept
                  </MuiButton>
                  <MuiButton
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={approveBooking.isPending || rejectBooking.isPending}
                    onClick={() => rejectBooking.mutate({ bookingId: booking.id })}
                  >
                    Reject
                  </MuiButton>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </AnalyticsCard>

      {/* ================= Revenue + session mix ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <AnalyticsCard
              title="Earnings Trend"
              subtitle="Credits in & out over the last 7 months (real wallet activity)"
              icon={<TrendingUpOutlinedIcon />}
              iconColor="#10B981"
            >
              <AreaChart data={[...earningsSeries]} color="#10B981" suffix=" credits" height={240} />
            </AnalyticsCard>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <AnalyticsCard title="Session Mix" subtitle="By session type" icon={<AutoGraphOutlinedIcon />} iconColor="#6D5DF6">
              <Stack alignItems="center" sx={{ py: 1 }}>
                <DonutChart
                  segments={[...MENTOR_SESSION_MIX]}
                  size={170}
                  strokeWidth={20}
                  centerValue={`${stats?.totalSessions ?? 0}`}
                  centerLabel="sessions"
                />
              </Stack>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {MENTOR_SESSION_MIX.map((segment) => (
                  <Stack key={segment.label} direction="row" alignItems="center" gap={1.5}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: segment.color }} />
                    <Typography variant="caption" fontWeight={600} sx={{ flexGrow: 1 }}>
                      {segment.label}
                    </Typography>
                    <Typography variant="caption" fontWeight={800}>
                      {segment.value}%
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </AnalyticsCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* ================= Today + upcoming sessions ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <AnalyticsCard
              title="Today's Sessions"
              subtitle={nowInAppZone().format('dddd, MMMM D')}
              icon={<AccessTimeFilledOutlinedIcon />}
              iconColor="#F59E0B"
              action={
                <MuiButton component={RouterLink} to={ROUTES.SESSIONS} size="small" endIcon={<ArrowForwardIcon fontSize="small" />}>
                  View all
                </MuiButton>
              }
            >
              {upcomingLoading && todaySessions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Loading your sessions…
                </Typography>
              ) : todaySessions.length === 0 ? (
                <Box
                  sx={{
                    borderRadius: 2.5,
                    border: 1,
                    borderStyle: 'dashed',
                    borderColor: 'divider',
                    p: 3,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No sessions today. Your upcoming sessions appear here with a working
                    Discord join link.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {todaySessions.map((session) => (
                    <Box
                      key={session.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        borderRadius: 2.5,
                        border: 1,
                        borderColor: 'divider',
                        transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
                        '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main', transform: 'translateY(-1px)' },
                      }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          background: 'linear-gradient(135deg, #6D5DF6, #43C6C0)',
                          flexShrink: 0,
                        }}
                      >
                        <VideocamOutlinedIcon fontSize="small" />
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {session.topic ?? session.title ?? 'Mentoring session'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          with {counterpart(session)} ·{' '}
                          {session.startTime ? parseApiTime(session.startTime)?.format('h:mm A') : ''}
                        </Typography>
                      </Box>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <StatusBadge
                          label={session.status === 'IN_PROGRESS' ? 'Live' : session.status}
                          color={session.status === 'IN_PROGRESS' ? 'success' : session.status === 'SCHEDULED' || session.status === 'APPROVED' ? 'success' : 'warning'}
                          withDot={false}
                        />
                        {canJoin(session) && (
                          <MuiButton
                            size="small"
                            variant="contained"
                            startIcon={<PlayArrowOutlinedIcon />}
                            onClick={() => void joinSessionMeeting(session.id)}
                          >
                            Join Meeting
                          </MuiButton>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </AnalyticsCard>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <AnalyticsCard
              title="Upcoming Sessions"
              subtitle={`${pendingRequests} pending request${pendingRequests === 1 ? '' : 's'}`}
              icon={<EventAvailableOutlinedIcon />}
              iconColor="#14B8A6"
            >
              {upcomingLoading && laterSessions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Loading your sessions…
                </Typography>
              ) : laterSessions.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No upcoming sessions. Book another mentor or wait for new bookings.
                </Typography>
              ) : (
                <Stack spacing={1.25}>
                  {laterSessions.map((session) => (
                    <Stack key={session.id} direction="row" alignItems="center" gap={1.5}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          bgcolor: '#14B8A6',
                          boxShadow: '0 0 0 4px rgba(20,184,166,0.15)',
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {session.topic ?? session.title ?? 'Mentoring session'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {counterpart(session)} ·{' '}
                          {session.startTime ? parseApiTime(session.startTime)?.format('ddd, D MMM · h:mm A') : ''}
                        </Typography>
                      </Box>
                      {canJoin(session) && (
                        <MuiButton
                          size="small"
                          variant="contained"
                          onClick={() => void joinSessionMeeting(session.id)}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          Join Meeting
                        </MuiButton>
                      )}
                    </Stack>
                  ))}
                </Stack>
              )}
            </AnalyticsCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* ================= Wallet + weekly activity ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <Box
              sx={{
                borderRadius: 4,
                p: 3.5,
                height: '100%',
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #14B8A6 0%, #0EA5E9 100%)',
              }}
            >
              <Box className="dot-grid" sx={{ position: 'absolute', inset: 0, opacity: 0.16 }} />
              <Box sx={{ position: 'relative' }}>
                <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2.5 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(255,255,255,0.18)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <AccountBalanceWalletOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Wallet Summary
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      Available for payout
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="h2" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
                  {(stats?.totalEarnings ?? 0).toLocaleString('en-IN')} credits
                </Typography>
                <Stack direction="row" gap={3} sx={{ mt: 2.5, mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      {stats?.totalSessions ?? 0}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      Total sessions
                    </Typography>
                  </Box>
                  <Box sx={{ width: 1, bgcolor: 'rgba(255,255,255,0.25)' }} />
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      {stats?.responseRate ?? 0}%
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      Response rate
                    </Typography>
                  </Box>
                  <Box sx={{ width: 1, bgcolor: 'rgba(255,255,255,0.25)' }} />
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      {stats?.responseTimeMinutes ?? 0}m
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      Avg. response
                    </Typography>
                  </Box>
                </Stack>
                <MuiButton
                  component={RouterLink}
                  to={ROUTES.WALLET}
                  variant="contained"
                  sx={{ bgcolor: '#fff', color: '#0F766E', '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' } }}
                >
                  View wallet
                </MuiButton>
              </Box>
            </Box>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <AnalyticsCard
              title="Weekly Activity"
              subtitle="Sessions per day this week"
              icon={<AutoGraphOutlinedIcon />}
              iconColor="#6D5DF6"
            >
              <BarChart data={[...MENTOR_WEEKLY_ACTIVITY]} color="#6D5DF6" suffix=" sessions" height={230} />
            </AnalyticsCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* ================= Community impact + schedule ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <CommunityImpactCard impact={communityImpact} loading={impactLoading} />
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <ScheduleCommunitySessionCard />
          </motion.div>
        </Grid>
      </Grid>

      {/* ================= Reviews + activity + messages ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <AnalyticsCard title="Recent Reviews" subtitle="What learners say" icon={<StarOutlineOutlinedIcon />} iconColor="#F59E0B">
              <Stack spacing={2}>
                {MENTOR_REVIEWS.map((review) => (
                  <Box key={review.id} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'action.hover' }}>
                    <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 0.75 }}>
                      <Avatar name={review.author} size={34} />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {review.author}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {review.time}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, color: '#F59E0B' }}>
                        <StarOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" fontWeight={800}>
                          {review.rating}.0
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      “{review.text}”
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </AnalyticsCard>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <AnalyticsCard title="Recent Activity" subtitle="Your studio timeline" icon={<AccessTimeFilledOutlinedIcon />} iconColor="#3B82F6">
              <Timeline
                items={MENTOR_ACTIVITY.map((item) => ({
                  title: item.title,
                  description: item.description,
                  time: item.time,
                  color: item.color,
                }))}
              />
            </AnalyticsCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* ================= Quick actions + profile ================= */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <AnalyticsCard title="Quick Actions" subtitle="Manage your studio" icon={<AutoGraphOutlinedIcon />} iconColor="#14B8A6">
              <Stack spacing={1.25}>
                {QUICK_ACTIONS.map((action) => (
                  <MuiButton
                    key={action.label}
                    component={RouterLink}
                    to={action.path}
                    variant="outlined"
                    fullWidth
                    startIcon={action.icon}
                    sx={{ justifyContent: 'flex-start', py: 1.25 }}
                  >
                    {action.label}
                  </MuiButton>
                ))}
                <MuiButton
                  component={RouterLink}
                  to={ROUTES.SESSIONS}
                  fullWidth
                  variant="contained"
                  startIcon={<EventAvailableOutlinedIcon />}
                  sx={{ mt: 0.5 }}
                >
                  Browse sessions
                </MuiButton>
              </Stack>
            </AnalyticsCard>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <ProgressCard label="Profile completion" value={profile?.profileCompletionPercentage ?? 0} sublabel="Complete your profile to rank higher" color="#6D5DF6" />
              <ProgressCard label="Booking acceptance" value={stats?.responseRate ?? 0} sublabel="Requests you respond to" color="#14B8A6" />
              <MentorCard mentor={mentor ?? seedMentor} name={name} featured={false} onAction={() => navigate(ROUTES.PROFILE)} actionLabel="Edit mentor profile" />
            </Stack>
          </motion.div>
        </Grid>
      </Grid>

      {/* ================= Availability strip ================= */}
      <AnalyticsCard
        title="Weekly Availability"
        subtitle={`${(mentor?.availabilities ?? []).length} recurring slots configured`}
        icon={<CalendarMonthOutlinedIcon />}
        iconColor="#EC4899"
        sx={{ mt: 3 }}
        action={
          <MuiButton
            component={RouterLink}
            to={ROUTES.MENTOR_AVAILABILITY}
            size="small"
            endIcon={<ArrowForwardIcon fontSize="small" />}
          >
            Manage
          </MuiButton>
        }
      >
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {(mentor?.availabilities ?? []).map((slot) => (
            <Chip
              key={slot.id ?? `${slot.dayOfWeek}-${slot.startTime}`}
              label={`${slot.dayOfWeek.charAt(0) + slot.dayOfWeek.slice(1).toLowerCase()} · ${slot.startTime}–${slot.endTime}`}
              variant={slot.active === false ? 'outlined' : 'filled'}
              sx={{ fontWeight: 700, ...(slot.active === false && { color: 'text.disabled' }) }}
            />
          ))}
          {(mentor?.availabilities ?? []).length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No availability configured yet — add your weekly schedule to start receiving bookings.
            </Typography>
          )}
        </Stack>
      </AnalyticsCard>

      {/* Footer strip */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems="center"
        justifyContent="space-between"
        gap={1.5}
        sx={{ mt: 3, py: 2.5, px: 3, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Stack direction="row" alignItems="center" gap={1} sx={{ color: 'text.secondary' }}>
          <EventAvailableOutlinedIcon sx={{ fontSize: 18, color: 'success.main' }} />
          <Typography variant="body2" fontWeight={600}>
            {dashboard.upcomingSessions ?? 0} upcoming sessions · {pendingRequests} pending request{pendingRequests === 1 ? '' : 's'}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Last updated {formatRelativeTime(mentor?.updatedAt)}
        </Typography>
      </Stack>
    </Box>
  );
};

export default MentorDashboardPage;
