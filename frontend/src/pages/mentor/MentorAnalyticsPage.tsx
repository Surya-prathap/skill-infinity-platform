import { Box, Chip, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { MetricCard } from '@/components/ui/MetricCard';
import { AnalyticsCard, GradientCard, ProgressCard } from '@/components/mentor';
import { AreaChart, BarChart, DonutChart } from '@/components/charts';
import { useDocumentTitle } from '@/hooks';
import { useMentorDashboardQuery, useMentorProfileQuery } from '@/features/mentor/hooks';
import {
  ANALYTICS_BOOKING_TRENDS,
  ANALYTICS_POPULAR_CATEGORIES,
  ANALYTICS_RATING_TRENDS,
  ANALYTICS_SESSION_TREND,
  ANALYTICS_STUDENT_GROWTH,
  ANALYTICS_TOP_SKILLS,
  MENTOR_REVENUE_SERIES,
} from '@/features/mentor/data';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

export const MentorAnalyticsPage: React.FC = () => {
  useDocumentTitle('Analytics');
  const { mentor, isOffline } = useMentorProfileQuery();
  const { dashboard } = useMentorDashboardQuery();

  const stats = dashboard.statistics ?? mentor?.statistics;
  const total = stats?.totalSessions ?? 0;
  const completed = stats?.completedSessions ?? 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const metrics: Array<{
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
    delta?: string;
    color: string;
    icon: React.ReactNode;
  }> = [
    {
      label: 'Total Sessions',
      value: total,
      delta: `${stats?.upcomingSessions ?? 0} upcoming`,
      color: '#6D5DF6',
      icon: <EventAvailableOutlinedIcon />,
    },
    {
      label: 'Completion Rate',
      value: completionRate,
      suffix: '%',
      color: '#10B981',
      icon: <TrendingUpOutlinedIcon />,
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
      label: 'Total Students',
      value: stats?.totalStudents ?? 0,
      color: '#EC4899',
      icon: <GroupOutlinedIcon />,
    },
  ];

  const performanceMetrics = [
    { label: 'Response rate', value: stats?.responseRate ?? 0, suffix: '%', color: '#6D5DF6' },
    {
      label: 'Avg. response time',
      value: stats?.responseTimeMinutes ?? 0,
      suffix: ' min',
      color: '#14B8A6',
    },
    { label: 'Cancelled sessions', value: stats?.cancelledSessions ?? 0, color: '#EF4444' },
    { label: 'Pending requests', value: dashboard.pendingRequests ?? 0, color: '#F59E0B' },
  ];

  return (
    <Box>
      {/* ================= Header ================= */}
      <GradientCard gradient="brand" sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}
          gap={2}
        >
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255,255,255,0.16)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <InsightsOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                Analytics
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Performance, revenue and learner growth at a glance
                {isOffline ? ' · offline preview' : ''}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Chip
              size="small"
              label="Last 7 months"
              sx={{
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.22)',
                fontWeight: 700,
              }}
            />
            <Chip
              size="small"
              label={`${completionRate}% completion`}
              sx={{
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.22)',
                fontWeight: 700,
              }}
            />
          </Stack>
        </Stack>
      </GradientCard>

      {/* ================= Metrics ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {metrics.map((metric, index) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={index}
              style={{ height: '100%' }}
            >
              <MetricCard
                label={metric.label}
                value={metric.value}
                prefix={metric.prefix}
                suffix={metric.suffix}
                decimals={metric.decimals}
                delta={metric.delta}
                icon={metric.icon}
                color={metric.color}
              />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* ================= Revenue + popular categories ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <AnalyticsCard
              title="Revenue Trend"
              subtitle="Monthly earnings in credits"
              icon={<MonetizationOnOutlinedIcon />}
              iconColor="#10B981"
            >
              <AreaChart
                data={[...MENTOR_REVENUE_SERIES]}
                color="#10B981"
                suffix=" credits"
                height={260}
              />
            </AnalyticsCard>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <AnalyticsCard
              title="Popular Categories"
              subtitle="By booked session hours"
              icon={<SchoolOutlinedIcon />}
              iconColor="#EC4899"
            >
              <Stack alignItems="center" sx={{ py: 1 }}>
                <DonutChart
                  segments={[...ANALYTICS_POPULAR_CATEGORIES]}
                  size={172}
                  strokeWidth={22}
                  centerValue={`${ANALYTICS_POPULAR_CATEGORIES.length}`}
                  centerLabel="categories"
                />
              </Stack>
              <Stack spacing={1} sx={{ mt: 2 }}>
                {ANALYTICS_POPULAR_CATEGORIES.map((segment) => (
                  <Stack key={segment.label} direction="row" alignItems="center" gap={1.5}>
                    <Box
                      sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: segment.color }}
                    />
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

      {/* ================= Sessions / growth / bookings ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <AnalyticsCard
              title="Session Trends"
              subtitle="Completed sessions per month"
              icon={<EventAvailableOutlinedIcon />}
              iconColor="#6D5DF6"
            >
              <BarChart
                data={[...ANALYTICS_SESSION_TREND]}
                color="#6D5DF6"
                suffix=" sessions"
                height={240}
              />
            </AnalyticsCard>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <AnalyticsCard
              title="Student Growth"
              subtitle="Active learners over time"
              icon={<GroupOutlinedIcon />}
              iconColor="#EC4899"
            >
              <AreaChart
                data={[...ANALYTICS_STUDENT_GROWTH]}
                color="#EC4899"
                suffix=" students"
                height={240}
              />
            </AnalyticsCard>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <AnalyticsCard
              title="Booking Trends"
              subtitle="New bookings per week"
              icon={<AutoGraphOutlinedIcon />}
              iconColor="#14B8A6"
            >
              <BarChart
                data={[...ANALYTICS_BOOKING_TRENDS]}
                color="#14B8A6"
                suffix=" bookings"
                height={240}
              />
            </AnalyticsCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* ================= Rating + top skills ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <AnalyticsCard
              title="Rating Trends"
              subtitle="Average rating per month"
              icon={<StarOutlineOutlinedIcon />}
              iconColor="#F59E0B"
              badge={`${stats?.averageRating ?? 0} / 5`}
            >
              <AreaChart
                data={[...ANALYTICS_RATING_TRENDS]}
                color="#F59E0B"
                suffix=" ★"
                height={220}
              />
            </AnalyticsCard>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <AnalyticsCard
              title="Top Skills"
              subtitle="Share of booked sessions by skill"
              icon={<InsightsOutlinedIcon />}
              iconColor="#6D5DF6"
            >
              <Stack spacing={2} sx={{ pt: 0.5 }}>
                {ANALYTICS_TOP_SKILLS.map((skill, index) => (
                  <Box key={skill.label}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {skill.label}
                      </Typography>
                      <Typography variant="body2" fontWeight={800}>
                        {skill.value}%
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        height: 10,
                        borderRadius: 999,
                        bgcolor: 'action.hover',
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.value}%` }}
                        transition={{ duration: 0.9, delay: 0.1 + index * 0.08, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          borderRadius: 999,
                          background: `linear-gradient(90deg, ${skill.color}, ${skill.color}99)`,
                          boxShadow: `0 2px 8px ${skill.color}50`,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </AnalyticsCard>
          </motion.div>
        </Grid>
      </Grid>

      {/* ================= Performance ================= */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <AnalyticsCard
              title="Performance Metrics"
              subtitle="Operational KPIs for your studio"
              icon={<AutoGraphOutlinedIcon />}
              iconColor="#14B8A6"
            >
              <Grid container spacing={2}>
                {performanceMetrics.map((metric) => (
                  <Grid key={metric.label} size={{ xs: 12, sm: 6 }}>
                    <MetricCard
                      label={metric.label}
                      value={metric.value}
                      suffix={metric.suffix}
                      color={metric.color}
                      hoverable={false}
                    />
                  </Grid>
                ))}
              </Grid>
            </AnalyticsCard>
          </motion.div>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            style={{ height: '100%' }}
          >
            <Stack spacing={2} sx={{ height: '100%' }}>
              <ProgressCard
                label="Session completion"
                value={completionRate}
                sublabel="Completed vs. total sessions"
                color="#6D5DF6"
              />
              <ProgressCard
                label="Booking acceptance"
                value={stats?.responseRate ?? 0}
                sublabel="Requests you respond to"
                color="#14B8A6"
              />
            </Stack>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MentorAnalyticsPage;
