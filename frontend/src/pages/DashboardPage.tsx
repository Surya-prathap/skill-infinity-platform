import { Box, Button, Chip, Grid, LinearProgress } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import {
  AnimatedNumber,
  Avatar,
  Card,
  GlassCard,
  MetricCard,
  ProfileCompletionRing,
  SectionHeader,
  Timeline,
} from '@/components';
import { AreaChart } from '@/components/charts';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import AccessTimeFilledOutlinedIcon from '@mui/icons-material/AccessTimeFilledOutlined';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowUpwardOutlinedIcon from '@mui/icons-material/ArrowUpwardOutlined';
import StarIcon from '@mui/icons-material/Star';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import dayjs from 'dayjs';
import { useAuth, useDocumentTitle } from '@/hooks';
import { ROUTES } from '@/constants';
import { computeProfileCompletion, useProfileQuery } from '@/features/profile';
import { useDashboardData } from '@/features/dashboard';
import {
  useCommunityAllowanceQuery,
  useJoinCommunitySessionMutation,
  useUpcomingCommunitySessionsQuery,
} from '@/features/sessions';
import type { Session } from '@/types';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const STAT_ICONS = [
  <EventAvailableOutlinedIcon key="sessions" />,
  <AccessTimeFilledOutlinedIcon key="hours" />,
  <AccountBalanceWalletOutlinedIcon key="credits" />,
  <EventAvailableOutlinedIcon key="upcoming" />,
];

export const DashboardPage: React.FC = () => {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { profile, isOffline } = useProfileQuery();
  const completion = computeProfileCompletion(profile);
  const dashboard = useDashboardData();

  const hour = dayjs().hour();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.firstName || user?.firstName || user?.username || 'there';

  const { stats, learningProgress, upcomingSessions, mentorsQuery, reviewsQuery } = dashboard;

  const communityAllowance = useCommunityAllowanceQuery().allowance;
  const communityQuery = useUpcomingCommunitySessionsQuery(0, 3);
  const communitySessions = communityQuery.data.content;
  const joinCommunity = useJoinCommunitySessionMutation();

  const handleJoinCommunity = (session: Session) => {
    if (joinCommunity.isPending) return;
    joinCommunity.mutate(session.id);
  };

  const recommendedMentors = mentorsQuery.data.content;

  const timelineItems = dashboard.historyQuery.data.content.slice(0, 4).map((session) => {
    const color =
      session.status === 'COMPLETED'
        ? '#6D5DF6'
        : session.status === 'CANCELLED'
          ? '#EF4444'
          : session.status === 'IN_PROGRESS'
            ? '#14B8A6'
            : '#3B82F6';
    const label =
      session.status === 'COMPLETED'
        ? `Session completed with ${session.mentorName ?? 'your mentor'}`
        : session.status === 'CANCELLED'
          ? `Session cancelled — ${session.mentorName ?? 'mentor'}`
          : session.status === 'IN_PROGRESS'
            ? `Session in progress — ${session.topic ?? session.title ?? 'Live session'}`
            : `Session scheduled — ${session.topic ?? session.title ?? 'Session'}`;
    return {
      title: label,
      description: `${session.durationMinutes ?? 60} min · ${dayjs(session.startTime).format('MMM D, h:mm A')}`,
      time: session.startTime ? dayjs(session.startTime).fromNow() : '',
      color,
    };
  });

  const walletBalance = dashboard.walletQuery.balance?.currentBalance ?? 0;

  return (
    <Box>
      {/* ================= Welcome banner ================= */}
      <Box
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          mb: 3,
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
          background: 'linear-gradient(120deg, #4F46E5 0%, #7C3AED 55%, #0EA5E9 120%)',
        }}
      >
        <Box className="dot-grid" sx={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }} />
        <Box
          component={motion.div}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          sx={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            top: -140,
            right: '6%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.25), transparent 70%)',
            // No filter: blur() — the gradient fades out on its own and animating
            // a blurred layer re-rasterizes every frame (expensive).
            pointerEvents: 'none',
            willChange: 'transform',
          }}
        />
        <Box sx={{ position: 'relative' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mb: 2, alignItems: { xs: 'flex-start', sm: 'center' } }}
          >
            <Avatar
              firstName={profile?.firstName}
              lastName={profile?.lastName}
              name={firstName}
              email={profile?.email ?? user?.email}
              src={profile?.profilePictureUrl}
              size={52}
              sx={{ border: '2px solid rgba(255,255,255,0.5)' }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                {greeting}, {firstName} 👋
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {isOffline
                  ? 'Showing your last synced data.'
                  : `${upcomingSessions.length} upcoming session${upcomingSessions.length === 1 ? '' : 's'} in your calendar.`}
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to={ROUTES.MENTORS}
              variant="contained"
              sx={{
                bgcolor: '#fff',
                color: '#5443D4',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
              }}
              startIcon={<ExploreOutlinedIcon />}
            >
              Find a Mentor
            </Button>
          </Stack>
          <Box sx={{ maxWidth: 380 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Profile completion
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {completion.percentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completion.percentage}
              sx={{
                height: 8,
                borderRadius: 999,
                backgroundColor: 'rgba(255,255,255,0.25)',
                '& .MuiLinearProgress-bar': { backgroundColor: '#5EEAD4', borderRadius: 999 },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* ================= Stat cards ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={index} style={{ height: '100%' }}>
              <MetricCard
                label={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                decimals={stat.decimals ?? 0}
                delta={stat.delta}
                color={stat.color}
                icon={STAT_ICONS[index]}
              />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* ================= Learning progress + completion ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: '100%' }}>
              <SectionHeader
                icon={<AutoGraphOutlinedIcon />}
                iconColor="#6D5DF6"
                title="Learning Progress"
                subtitle="Sessions attended over the last 8 weeks"
                action={
                  <Chip
                    label="Live data"
                    size="small"
                    color="success"
                    icon={<ArrowUpwardOutlinedIcon sx={{ fontSize: 14 }} />}
                  />
                }
              />
              <AreaChart data={[...learningProgress]} color="#6D5DF6" suffix=" sessions" height={230} />
            </Card>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <GlassCard hoverable sx={{ p: 3, height: '100%', textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Profile Completion
              </Typography>
              <ProfileCompletionRing value={completion.percentage} size={150} sublabel={`${completion.missing.length} items to go`} />
              <Button
                component={RouterLink}
                to={ROUTES.PROFILE}
                fullWidth
                sx={{ mt: 2.5 }}
                endIcon={<ArrowForwardIcon />}
                variant="outlined"
              >
                View Profile
              </Button>
            </GlassCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* ================= Upcoming sessions + wallet ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: '100%' }}>
              <SectionHeader
                icon={<EventAvailableOutlinedIcon />}
                iconColor="#14B8A6"
                title="Upcoming Sessions"
                subtitle="Your next live sessions"
                action={
                  <>
                    {communityAllowance && (
                      <Chip
                        label={`${communityAllowance.remaining} free community session${communityAllowance.remaining === 1 ? '' : 's'} left this month`}
                        size="small"
                        color={communityAllowance.remaining > 0 ? 'success' : 'error'}
                        variant="outlined"
                        sx={{ fontWeight: 700, mr: 1 }}
                      />
                    )}
                    <Button
                      component={RouterLink}
                      to={ROUTES.SESSIONS}
                      size="small"
                      endIcon={<ArrowForwardIcon fontSize="small" />}
                    >
                      View all
                    </Button>
                  </>
                }
              />
              {upcomingSessions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No upcoming sessions yet.
                  </Typography>
                  <Button component={RouterLink} to={ROUTES.MENTORS} variant="contained" startIcon={<ExploreOutlinedIcon />}>
                    Book your first session
                  </Button>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {upcomingSessions.map((session) => (
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
                          background: 'linear-gradient(135deg, #14B8A6, #0EA5E9)',
                          flexShrink: 0,
                        }}
                      >
                        <EventAvailableOutlinedIcon fontSize="small" />
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {session.topic ?? session.title ?? 'Mentoring session'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          with {session.mentorName ?? 'your mentor'} ·{' '}
                          {session.startTime ? dayjs(session.startTime).format('MMM D, h:mm A') : 'Time TBD'}
                        </Typography>
                      </Box>
                      <Button size="small" variant="outlined" component={RouterLink} to={ROUTES.SESSIONS}>
                        Details
                      </Button>
                    </Box>
                  ))}
                </Stack>
              )}
            </Card>
          </motion.div>
        </Grid>
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
                  <Typography variant="h6" fontWeight={700}>
                    Wallet Balance
                  </Typography>
                </Stack>
                <AnimatedNumber value={walletBalance} variant="h3" />
                <Typography variant="body2" sx={{ opacity: 0.85, mb: 1.5 }}>
                  {walletBalance.toLocaleString('en-IN')} credits available
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    mb: 2,
                  }}
                >
                  {[
                    { label: 'Welcome', value: dashboard.walletQuery.balance?.welcomeBalance ?? 0, color: '#34D399' },
                    { label: 'Purchased', value: dashboard.walletQuery.balance?.purchasedBalance ?? 0, color: '#60A5FA' },
                    { label: 'Learning', value: dashboard.walletQuery.balance?.learningBalance ?? 0, color: '#FBBF24' },
                    { label: 'Withdrawable', value: dashboard.walletQuery.balance?.withdrawableBalance ?? 0, color: '#F9A8D4' },
                  ].map((bucket) => (
                    <Box
                      key={bucket.label}
                      sx={{
                        borderRadius: 2,
                        px: 1.25,
                        py: 0.5,
                        bgcolor: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <Typography variant="caption" sx={{ opacity: 0.75, mr: 0.5 }}>
                        {bucket.label}
                      </Typography>
                      <Typography variant="caption" fontWeight={800} sx={{ color: bucket.color }}>
                        {bucket.value.toLocaleString('en-IN')}
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    component={RouterLink}
                    to={ROUTES.WALLET}
                    variant="contained"
                    sx={{ bgcolor: '#fff', color: '#0F766E', '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' } }}
                  >
                    Top Up
                  </Button>
                  <Button
                    component={RouterLink}
                    to={ROUTES.WALLET}
                    variant="outlined"
                    sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
                  >
                    History
                  </Button>
                </Stack>
              </Box>
            </Box>
          </motion.div>
        </Grid>
      </Grid>

      {/* ================= Community sessions ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <SectionHeader
                icon={<ForumOutlinedIcon />}
                iconColor="#EC4899"
                title="Community Sessions"
                subtitle="Free group sessions hosted by mentors — no credits needed"
                action={
                  <>
                    {communityAllowance && (
                      <Chip
                        label={`${communityAllowance.remaining} free${communityAllowance.remaining === 1 ? '' : 's'} left this month`}
                        size="small"
                        color={communityAllowance.remaining > 0 ? 'success' : 'error'}
                        variant="outlined"
                        sx={{ fontWeight: 700, mr: 1 }}
                      />
                    )}
                    <Button
                      component={RouterLink}
                      to={ROUTES.SESSIONS}
                      size="small"
                      endIcon={<ArrowForwardIcon fontSize="small" />}
                    >
                      View all
                    </Button>
                  </>
                }
              />
              {communitySessions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No community sessions are open right now — mentors schedule new ones regularly.
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {communitySessions.map((session) => (
                    <Grid key={session.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <Box
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1.25,
                          p: 2,
                          borderRadius: 3,
                          border: 1,
                          borderColor: 'divider',
                          transition: 'background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'primary.main',
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              background: 'linear-gradient(135deg, #EC4899, #F59E0B)',
                              flexShrink: 0,
                            }}
                          >
                            <ForumOutlinedIcon fontSize="small" />
                          </Box>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Typography variant="subtitle2" fontWeight={700} noWrap>
                              {session.topic ?? session.title ?? 'Community session'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {session.mentorName ?? 'A mentor'}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label="Free"
                            color="secondary"
                            sx={{ fontWeight: 700 }}
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {session.startTime
                            ? dayjs(session.startTime).format('ddd, MMM D · h:mm A')
                            : 'Time TBD'}
                          {session.durationMinutes ? ` · ${session.durationMinutes} min` : ''}
                          {session.participantCount !== undefined ? ` · ${session.participantCount} joined` : ''}
                        </Typography>
                        <Button
                          size="small"
                          variant="contained"
                          fullWidth
                          disabled={joinCommunity.isPending}
                          onClick={() => handleJoinCommunity(session)}
                          sx={{ mt: 'auto' }}
                        >
                          Join session
                        </Button>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* ================= Activity + reviews + mentors ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: '100%' }}>
              <SectionHeader icon={<AccessTimeFilledOutlinedIcon />} iconColor="#3B82F6" title="Recent Activity" subtitle="Your latest sessions" />
              {timelineItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                  No session activity yet.
                </Typography>
              ) : (
                <Timeline items={timelineItems} />
              )}
            </Card>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: '100%' }}>
              <SectionHeader icon={<StarOutlineOutlinedIcon />} iconColor="#F59E0B" title="Top Reviews" subtitle="Highest rated feedback" />
              <Stack spacing={2}>
                {reviewsQuery.data?.length ? (
                  reviewsQuery.data.map((review) => (
                    <Box key={review.id} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'action.hover' }}>
                      <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 0.75 }}>
                        <Avatar name={review.learnerName ?? 'Learner'} size={34} />
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={700} noWrap>
                            {review.learnerName ?? 'Anonymous learner'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {review.publishedAt ? dayjs(review.publishedAt).fromNow() : 'Verified review'}
                          </Typography>
                        </Box>
                        <Stack direction="row" alignItems="center" gap={0.25} sx={{ color: '#F59E0B' }}>
                          <StarIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" fontWeight={700}>
                            {review.rating.toFixed(1)}
                          </Typography>
                        </Stack>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        “{review.content ?? review.title ?? 'No content'}”
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No reviews yet.
                  </Typography>
                )}
              </Stack>
            </Card>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: '100%' }}>
              <SectionHeader
                icon={<ForumOutlinedIcon />}
                iconColor="#EC4899"
                title="Recommended Mentors"
                subtitle="Top rated on the platform"
                action={
                  <Button component={RouterLink} to={ROUTES.MENTORS} size="small" endIcon={<ArrowForwardIcon fontSize="small" />}>
                    Browse
                  </Button>
                }
              />
              <Stack spacing={1.5}>
                {recommendedMentors.length ? (
                  recommendedMentors.map((mentor) => (
                    <Box
                      key={mentor.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.25,
                        borderRadius: 2.5,
                        border: 1,
                        borderColor: 'divider',
                        transition: 'border-color 0.2s ease, transform 0.2s ease, background-color 0.2s ease',
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover', transform: 'translateY(-1px)' },
                      }}
                    >
                      <Avatar
                        firstName={mentor.headline?.split(' ')[0]}
                        lastName={mentor.headline?.split(' ').slice(1).join(' ')}
                        src={mentor.profilePictureUrl}
                        size={40}
                      />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {mentor.headline ?? 'Mentor'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {mentor.city ? `${mentor.city}, ` : ''}
                          {mentor.yearsOfExperience ? `${mentor.yearsOfExperience}+ yrs` : 'Verified'}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={`★ ${mentor.averageRating.toFixed(1)}`}
                        sx={{ bgcolor: 'action.selected', color: 'primary.main', fontWeight: 700 }}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                    No mentors yet.
                  </Typography>
                )}
              </Stack>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
