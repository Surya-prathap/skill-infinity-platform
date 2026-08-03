import { Box, Button, Chip, Grid, LinearProgress } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import {
  AnimatedNumber,
  Avatar,
  AvatarStack,
  Card,
  GlassCard,
  MetricCard,
  ProfileCompletionRing,
  SectionHeader,
  Timeline,
} from '@/components';
import { AreaChart, BarChart } from '@/components/charts';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import AccessTimeFilledOutlinedIcon from '@mui/icons-material/AccessTimeFilledOutlined';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
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
import {
  ACTIVITY_TIMELINE,
  COMMUNITY_ACTIVITY,
  DASHBOARD_STATS,
  LEARNING_PROGRESS,
  RECENT_NOTIFICATIONS,
  RECENT_REVIEWS,
  RECOMMENDED_MENTORS,
  UPCOMING_SESSIONS,
} from '@/features/dashboard/data';
import { formatCurrency } from '@/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const STAT_ICONS = [
  <EventAvailableOutlinedIcon key="sessions" />,
  <AccessTimeFilledOutlinedIcon key="hours" />,
  <AccountBalanceWalletOutlinedIcon key="credits" />,
  <StarOutlineOutlinedIcon key="rating" />,
];

export const DashboardPage: React.FC = () => {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { profile, isOffline } = useProfileQuery();
  const completion = computeProfileCompletion(profile);

  const hour = dayjs().hour();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = profile?.firstName || user?.firstName || user?.username || 'there';

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
            filter: 'blur(30px)',
            pointerEvents: 'none',
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
                  ? 'Offline preview — showing your saved data.'
                  : "You're 2 sessions away from your monthly goal."}
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
                Monthly learning goal
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                8 / 10 sessions
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={80}
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
        {DASHBOARD_STATS.map((stat, index) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={index} style={{ height: '100%' }}>
              <MetricCard
                label={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                decimals={'decimals' in stat ? stat.decimals : 0}
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
                    label="+22% vs last month"
                    size="small"
                    color="success"
                    icon={<ArrowUpwardOutlinedIcon sx={{ fontSize: 14 }} />}
                  />
                }
              />
              <AreaChart data={[...LEARNING_PROGRESS]} color="#6D5DF6" suffix=" sessions" height={230} />
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
                  <Button
                    component={RouterLink}
                    to={ROUTES.SESSIONS}
                    size="small"
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                  >
                    View all
                  </Button>
                }
              />
              <Stack spacing={1.5}>
                {UPCOMING_SESSIONS.map((session) => (
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
                        background: `linear-gradient(135deg, ${session.color}, ${session.color}99)`,
                        flexShrink: 0,
                      }}
                    >
                      <EventAvailableOutlinedIcon fontSize="small" />
                    </Box>
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {session.topic}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        with {session.mentor} · {session.date} · {session.time}
                      </Typography>
                    </Box>
                    <Button size="small" variant="outlined">
                      Join
                    </Button>
                  </Box>
                ))}
              </Stack>
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
                <AnimatedNumber value={248} prefix="$" variant="h3" />
                <Typography variant="body2" sx={{ opacity: 0.85, mb: 2 }}>
                  ≈ {formatCurrency(248)} in credits
                </Typography>
                <Stack direction="row" gap={2} sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      2,450
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      Credits balance
                    </Typography>
                  </Box>
                  <Box sx={{ width: 1, bgcolor: 'rgba(255,255,255,0.25)' }} />
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      +50
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      This month
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" gap={1.5}>
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

      {/* ================= Activity + reviews + mentors ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: '100%' }}>
              <SectionHeader icon={<AccessTimeFilledOutlinedIcon />} iconColor="#3B82F6" title="Recent Activity" subtitle="Your latest actions" />
              <Timeline
                items={ACTIVITY_TIMELINE.map((item) => ({
                  title: item.title,
                  description: item.description,
                  time: item.time,
                  color: item.color,
                }))}
              />
            </Card>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: '100%' }}>
              <SectionHeader icon={<StarOutlineOutlinedIcon />} iconColor="#F59E0B" title="Recent Reviews" subtitle="What mentors say about you" />
              <Stack spacing={2}>
                {RECENT_REVIEWS.map((review) => (
                  <Box key={review.author} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'action.hover' }}>
                    <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 0.75 }}>
                      <Avatar name={review.author} size={34} />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {review.author}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {review.role} · {review.time}
                        </Typography>
                      </Box>
                      <Stack direction="row" alignItems="center" gap={0.25} sx={{ color: '#F59E0B' }}>
                        <StarIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" fontWeight={700}>
                          {review.rating}.0
                        </Typography>
                      </Stack>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      “{review.text}”
                    </Typography>
                  </Box>
                ))}
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
                subtitle="Matched to your goals"
                action={
                  <Button component={RouterLink} to={ROUTES.MENTORS} size="small" endIcon={<ArrowForwardIcon fontSize="small" />}>
                    Browse
                  </Button>
                }
              />
              <Stack spacing={1.5}>
                {RECOMMENDED_MENTORS.map((mentor) => {
                  const [firstName, lastName] = mentor.name.split(' ');
                  return (
                    <Box
                      key={mentor.name}
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
                      <Avatar firstName={firstName} lastName={lastName} size={40} />
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {mentor.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {mentor.role}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={`★ ${mentor.rating.toFixed(1)}`}
                        sx={{ bgcolor: 'action.selected', color: 'primary.main', fontWeight: 700 }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* ================= Community activity + notifications ================= */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: '100%' }}>
              <SectionHeader
                icon={<ForumOutlinedIcon />}
                iconColor="#14B8A6"
                title="Community Activity"
                subtitle="Posts & replies this week"
                action={
                  <Button component={RouterLink} to={ROUTES.COMMUNITY} size="small" endIcon={<ArrowForwardIcon fontSize="small" />}>
                    Open Community
                  </Button>
                }
              />
              <BarChart data={[...COMMUNITY_ACTIVITY]} color="#14B8A6" suffix=" posts" height={210} />
            </Card>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} style={{ height: '100%' }}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, height: '100%' }}>
              <SectionHeader
                icon={<NotificationsNoneOutlinedIcon />}
                iconColor="#F59E0B"
                title="Notifications"
                subtitle="Latest updates"
                action={
                  <Button component={RouterLink} to={ROUTES.NOTIFICATIONS} size="small" endIcon={<ArrowForwardIcon fontSize="small" />}>
                    View all
                  </Button>
                }
              />
              <Stack spacing={1.5}>
                {RECENT_NOTIFICATIONS.map((notification) => (
                  <Stack key={notification.id} direction="row" alignItems="center" gap={1.5}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: notification.unread ? 'primary.main' : 'text.disabled',
                        boxShadow: notification.unread ? '0 0 0 4px rgba(109,93,246,0.15)' : 'none',
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={notification.unread ? 700 : 500}
                        noWrap
                      >
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.time}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
              <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                <Button
                  component={RouterLink}
                  to={ROUTES.MENTORS}
                  fullWidth
                  variant="contained"
                  startIcon={<ExploreOutlinedIcon />}
                >
                  Find a Mentor
                </Button>
                <Button
                  component={RouterLink}
                  to={ROUTES.WALLET}
                  fullWidth
                  variant="outlined"
                  startIcon={<AccountBalanceWalletOutlinedIcon />}
                >
                  Top Up Credits
                </Button>
              </Stack>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Mentors preview strip */}
      <Card sx={{ mt: 3, p: { xs: 2.5, md: 3 }, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <AvatarStack
          items={RECOMMENDED_MENTORS.map((mentor) => {
            const [firstName, lastName] = mentor.name.split(' ');
            return { firstName, lastName };
          })}
          size={38}
          label={`${RECOMMENDED_MENTORS.length} mentors available now`}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="caption" color="text.secondary">
          Average rating 4.9/5 · 120k+ sessions booked
        </Typography>
      </Card>
    </Box>
  );
};

export default DashboardPage;
