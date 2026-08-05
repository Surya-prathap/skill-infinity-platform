import { useMemo } from 'react';
import { Box, Chip, Grid, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import { PageHeader } from '@/components/common';
import { ActivityCard, ContributionGraph } from '@/components/community';
import { Card } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { AreaChart, BarChart, type ChartPoint } from '@/components/charts';
import { useDocumentTitle } from '@/hooks';
import { useActivityQuery, useLearningStatsQuery } from '@/features/community';
import { formatCompactNumber } from '@/utils';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = Array.from({ length: 30 }, (_, index) => `${index + 1}`);

export const ActivityPage: React.FC = () => {
  useDocumentTitle('Learning Activity');
  const { items, isLoading: activityLoading } = useActivityQuery(30);
  const { stats, isLoading: statsLoading } = useLearningStatsQuery();

  const weeklyData = useMemo<ChartPoint[]>(
    () => WEEK_DAYS.map((day, index) => ({ label: day, value: stats?.weeklyProgress[index] ?? 0 })),
    [stats],
  );

  const monthlyData = useMemo<ChartPoint[]>(
    () => MONTH_LABELS.map((label, index) => ({ label, value: stats?.monthlyProgress[index] ?? 0 })),
    [stats],
  );

  if (statsLoading && !stats) {
    return (
      <Box>
        <Skeleton variant="text" width={260} height={40} />
        <Skeleton variant="rounded" height={180} sx={{ mt: 2 }} />
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {[0, 1, 2, 3].map((index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Skeleton variant="rounded" height={110} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const statCards = [
    { icon: <LocalFireDepartmentIcon />, color: '#F59E0B', label: 'Day streak', value: `${stats?.streakDays ?? 0} days` },
    { icon: <TimerOutlinedIcon />, color: '#6D5DF6', label: 'Hours learned', value: `${stats?.totalHours ?? 0}h` },
    { icon: <EmojiEventsOutlinedIcon />, color: '#EC4899', label: 'Total points', value: formatCompactNumber(stats?.totalPoints ?? 0) },
    { icon: <WorkspacePremiumOutlinedIcon />, color: '#14B8A6', label: 'Sessions completed', value: String(stats?.sessionsCompleted ?? 0) },
  ];

  return (
    <Box>
      <PageHeader
        title="Learning Activity"
        subtitle="Your journey across sessions, community contributions and milestones."
        actions={
          <Chip
            icon={<LocalFireDepartmentIcon sx={{ color: '#F59E0B' }} />}
            label={`${stats?.streakDays ?? 0}-day streak`}
            sx={{ fontWeight: 800, borderColor: 'rgba(245,158,11,0.5)', color: '#F59E0B' }}
            variant="outlined"
          />
        }
      />

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((stat, index) => (
          <Grid key={stat.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07, duration: 0.35 }}>
              <Card hoverable sx={{ p: 2.25, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    background: `linear-gradient(135deg, ${stat.color}, ${stat.color}99)`,
                    boxShadow: `0 8px 20px ${stat.color}40`,
                    flexShrink: 0,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={900}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {stat.label}
                  </Typography>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Progress charts */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
              Weekly progress
            </Typography>
            <BarChart data={weeklyData} height={180} color="#6D5DF6" suffix=" sessions" />
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
              Monthly progress
            </Typography>
            <AreaChart data={monthlyData} height={180} color="#14B8A6" suffix=" sessions" />
          </Card>
        </Grid>

        {/* Contribution graph */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 2.5 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
              <TimelineOutlinedIcon sx={{ color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={800}>
                Contribution graph
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Last 16 weeks of learning activity
              </Typography>
            </Stack>
            <ContributionGraph data={stats?.contribution ?? {}} />
          </Card>
        </Grid>

        {/* Activity timeline */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 2.5 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
              Recent activity
            </Typography>
            <Stack divider={<Box sx={{ height: 1, bgcolor: 'divider', mx: 2 }} />}>
              {activityLoading && items.length === 0
                ? [0, 1, 2].map((index) => <Skeleton key={index} variant="rounded" height={52} sx={{ mx: 2 }} />)
                : items.map((item, index) => <ActivityCard key={item.id} item={item} index={index} />)}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActivityPage;
