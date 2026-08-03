import { Box, Button, Grid, LinearProgress } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import { Link as RouterLink } from 'react-router-dom';
import dayjs from 'dayjs';
import { Card, PageHeader, Avatar } from '@/components';
import { useAuth, useDocumentTitle } from '@/hooks';
import { ROUTES } from '@/constants';
import { formatCurrency } from '@/utils';

const STAT_CARDS = [
  {
    title: 'Sessions Booked',
    value: '12',
    change: '+3 this month',
    icon: <EventAvailableOutlinedIcon />,
    color: '#6D5DF6',
  },
  {
    title: 'Wallet Balance',
    value: formatCurrency(248),
    change: '+50 credits earned',
    icon: <AccountBalanceWalletOutlinedIcon />,
    color: '#14B8A6',
  },
  {
    title: 'Community Posts',
    value: '8',
    change: '2 new replies',
    icon: <ForumOutlinedIcon />,
    color: '#F59E0B',
  },
  {
    title: 'Average Rating',
    value: '4.9',
    change: 'From 24 reviews',
    icon: <StarOutlineOutlinedIcon />,
    color: '#EC4899',
  },
];

const ACTIVITY = [
  { title: 'Session completed with Sarah Chen', time: '2 hours ago', type: 'session' },
  { title: 'Earned 50 credits for referral', time: 'Yesterday', type: 'wallet' },
  { title: 'New reply on your community post', time: '2 days ago', type: 'community' },
  { title: 'Mentor booked: System Design 101', time: '3 days ago', type: 'session' },
];

const UPCOMING = [
  { mentor: 'Alex Rivera', topic: 'System Design Deep Dive', date: 'Aug 8 · 4:00 PM', color: '#6D5DF6' },
  { mentor: 'Emily Watson', topic: 'React Performance Patterns', date: 'Aug 12 · 6:30 PM', color: '#14B8A6' },
  { mentor: 'David Kim', topic: 'Behavioral Interview Prep', date: 'Aug 15 · 11:00 AM', color: '#F59E0B' },
];

export const DashboardPage: React.FC = () => {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();

  const hour = dayjs().hour();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.firstName || user?.username || 'there';

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle={`${dayjs().format('dddd, MMMM D')} — here's what's happening today.`} />

      {/* Welcome banner */}
      <Box
        sx={{
          borderRadius: 4,
          p: { xs: 3, md: 4 },
          mb: 4,
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
          background: 'linear-gradient(120deg, #4F46E5 0%, #7C3AED 55%, #0EA5E9 120%)',
        }}
      >
        <Box className="dot-grid" sx={{ position: 'absolute', inset: 0, opacity: 0.2, pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative' }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
            <Avatar firstName={user?.firstName} lastName={user?.lastName} email={user?.email} size={48} />
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                {greeting}, {firstName} 👋
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                You're 2 sessions away from your monthly goal.
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ maxWidth: 380, mt: 2 }}>
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
              sx={{ height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.25)', '& .MuiLinearProgress-bar': { backgroundColor: '#5EEAD4', borderRadius: 999 } }}
            />
          </Box>
        </Box>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {STAT_CARDS.map((stat) => (
          <Grid key={stat.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card hoverable sx={{ p: 2.5, height: '100%' }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    background: `linear-gradient(135deg, ${stat.color}, ${stat.color}AA)`,
                    boxShadow: `0 6px 16px ${stat.color}40`,
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h5" fontWeight={800} noWrap>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="success.main" fontWeight={600}>
                    {stat.change}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Upcoming sessions */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
              <Typography variant="h6" fontWeight={700}>
                Upcoming Sessions
              </Typography>
              <Button
                component={RouterLink}
                to={ROUTES.SESSIONS}
                size="small"
                endIcon={<ArrowForwardIcon fontSize="small" />}
              >
                View all
              </Button>
            </Stack>
            <Stack spacing={2}>
              {UPCOMING.map((session) => (
                <Box
                  key={session.mentor}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderRadius: 2.5,
                    border: 1,
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' },
                    transition: 'background-color 0.2s ease',
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
                      with {session.mentor} · {session.date}
                    </Typography>
                  </Box>
                  <Button size="small" variant="outlined">
                    Join
                  </Button>
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Activity + quick actions */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Recent Activity
              </Typography>
              <Stack spacing={1.5}>
                {ACTIVITY.map((item) => (
                  <Stack key={item.title} direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        mt: 0.75,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        flexShrink: 0,
                      }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {item.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.time}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Card>

            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <Stack spacing={1.5}>
                <Button
                  component={RouterLink}
                  to={ROUTES.MENTORS}
                  fullWidth
                  variant="contained"
                  startIcon={<ExploreOutlinedIcon />}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Find a Mentor
                </Button>
                <Button
                  component={RouterLink}
                  to={ROUTES.WALLET}
                  fullWidth
                  variant="outlined"
                  startIcon={<AccountBalanceWalletOutlinedIcon />}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  Top Up Credits
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
