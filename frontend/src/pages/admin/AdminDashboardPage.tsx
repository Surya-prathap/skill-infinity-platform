import { useState } from 'react';
import { Box, Button, Grid, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Stack, Typography } from '@/components/ui';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KpiCard, ChartCard, DashboardWidget, ActivityFeed, AnimatedProgress, AdminDashboardSkeleton } from '@/components/admin';
import { AreaChart, DonutChart } from '@/components/charts';
import { formatCompactNumber, formatCurrency, showSuccess } from '@/utils';
import { useAdminDashboardQuery, useAdminAnalyticsQuery } from '@/features/admin';
import { ROUTES } from '@/constants';

export const AdminDashboardPage: React.FC = () => {
  useDocumentTitle('Executive Dashboard');
  const navigate = useNavigate();
  const [range, setRange] = useState<'7D' | '30D' | '12M'>('12M');

  const { dashboard, isLoading, isOffline } = useAdminDashboardQuery();
  const { analytics } = useAdminAnalyticsQuery();

  if (isLoading) return <AdminDashboardSkeleton />;

  const { userStats, mentorStats, sessionStats, revenueStats, communityStats, reviewStats, recentActivities, systemHealth } = dashboard;
  const growth = analytics.growth;
  const engagement = analytics.engagement;

  const revenuePoints = Object.entries(analytics.revenue.revenueByMonth).map(([label, value]) => ({
    label: label.slice(0, 3),
    value,
  }));

  const roleSegments = Object.entries(analytics.users.usersByRole).map(([role, value]) => ({
    label: role.replace('ROLE_', '').toLowerCase(),
    value,
    color:
      role === 'ROLE_LEARNER' ? '#6D5DF6' : role === 'ROLE_MENTOR' ? '#14B8A6' : role === 'ROLE_ADMIN' ? '#F59E0B' : '#94A3B8',
  }));

  const weeklyRegistration = Object.values(growth.registrationsByDay);

  const kpis = [
    { label: 'Total Users', value: userStats.totalUsers, icon: <PeopleAltOutlinedIcon />, color: '#6D5DF6', delta: growth.userGrowthRate, deltaLabel: `vs previous period · ${formatCompactNumber(userStats.dailyRegistrations)} new today`, sparkline: weeklyRegistration, index: 0 },
    { label: 'Active Users', value: userStats.activeUsersToday, icon: <BoltOutlinedIcon />, color: '#3B82F6', deltaLabel: 'active in the last 24h', index: 1 },
    { label: 'Mentors', value: mentorStats.totalMentors, icon: <SchoolOutlinedIcon />, color: '#14B8A6', delta: growth.mentorGrowthRate, deltaLabel: `${mentorStats.pendingApprovals} awaiting approval`, index: 2 },
    { label: 'Total Sessions', value: sessionStats.totalSessions, icon: <EventAvailableOutlinedIcon />, color: '#F59E0B', delta: growth.sessionGrowthRate, deltaLabel: `${formatCompactNumber(sessionStats.activeSessions)} live right now`, index: 3 },
    { label: 'Monthly Revenue', value: revenueStats.monthlyRevenue, prefix: '₹', icon: <PaymentsOutlinedIcon />, color: '#10B981', delta: growth.revenueGrowthRate, deltaLabel: `${formatCurrency(revenueStats.totalRevenue)} all-time`, sparkline: revenuePoints.slice(-12).map((p) => p.value / 1000), index: 4 },
    { label: 'Communities', value: communityStats.totalCommunities, icon: <ForumOutlinedIcon />, color: '#0EA5E9', deltaLabel: `${formatCompactNumber(communityStats.totalPosts)} posts published`, index: 5 },
    { label: 'Reviews', value: reviewStats.totalReviews, icon: <StarOutlinedIcon />, color: '#EC4899', deltaLabel: `${reviewStats.pendingReviews} pending moderation`, index: 6 },
    { label: 'Avg. Rating', value: engagement.averageRating, decimals: 1, icon: <StarOutlinedIcon />, color: '#F59E0B', deltaLabel: `${formatCompactNumber(engagement.totalReviews)} reviews`, index: 7 },
  ];

  const quickActions = [
    { label: 'New announcement', icon: <AddCircleOutlineOutlinedIcon />, path: ROUTES.ADMIN_ANNOUNCEMENTS },
    { label: 'Review mentors', icon: <SchoolOutlinedIcon />, path: ROUTES.ADMIN_MENTORS },
    { label: 'Review moderation', icon: <GroupsOutlinedIcon />, path: ROUTES.ADMIN_REVIEWS },
    { label: 'Generate report', icon: <FileDownloadOutlinedIcon />, path: ROUTES.ADMIN_REPORTS },
  ];

  return (
    <Box>
      <PageHeader
        title="Executive Dashboard"
        subtitle={isOffline ? 'Showing cached platform data — live connection unavailable.' : 'Platform health, growth and moderation at a glance.'}
        actions={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ToggleButtonGroup
              size="small"
              exclusive
              value={range}
              onChange={(_, next) => next && setRange(next)}
              aria-label="Date range"
            >
              {(['7D', '30D', '12M'] as const).map((option) => (
                <ToggleButton key={option} value={option} sx={{ fontWeight: 700 }}>
                  {option}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Button
              variant="outlined"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() => showSuccess('Executive report export queued')}
            >
              Export
            </Button>
          </Stack>
        }
      />

      {/* KPI grid */}
      <Grid container spacing={3}>
        {kpis.map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard {...kpi} />
          </Grid>
        ))}
      </Grid>

      {/* Charts row */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ChartCard
            title="Revenue Trend"
            subtitle={`Monthly gross revenue · ${range} view`}
            index={0}
            actions={
              <Stack direction="row" spacing={2}>
                {[{ color: '#6D5DF6', label: 'Revenue' }].map((legend) => (
                  <Stack key={legend.label} direction="row" spacing={0.75} alignItems="center">
                    <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: legend.color }} />
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      {legend.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            }
          >
            <AreaChart data={revenuePoints} height={280} color="#6D5DF6" />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ChartCard title="User Mix" subtitle="Distribution by role" index={1}>
            <DonutChart
              segments={roleSegments}
              size={190}
              centerValue={formatCompactNumber(userStats.totalUsers)}
              centerLabel="users"
            />
            <Stack spacing={1} sx={{ mt: 2 }}>
              {roleSegments.map((segment) => (
                <Stack key={segment.label} direction="row" alignItems="center" spacing={1}>
                  <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: segment.color }} />
                  <Typography variant="caption" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                    {segment.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    {formatCompactNumber(segment.value)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Health + activity */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardWidget
            title="Platform Health"
            subtitle="All systems"
            icon={<HealthAndSafetyOutlinedIcon />}
            index={0}
          >
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Services
                </Typography>
                <Typography variant="body2" fontWeight={800}>
                  {systemHealth.activeServices}/{systemHealth.totalServices} online
                </Typography>
              </Stack>
              <AnimatedProgress value={systemHealth.activeServices} max={systemHealth.totalServices} label="Uptime" suffix="% of 12" />
              <AnimatedProgress value={100 - systemHealth.averageResponseTime / 5} label="Response time" suffix={`ms avg (${systemHealth.averageResponseTime}ms)`} color="#6D5DF6" />
              <AnimatedProgress value={systemHealth.uptime} label="Availability" color="#10B981" />
              <Box sx={{ mt: 0.5 }}>
                <StatusBadge label={systemHealth.status === 'UP' ? 'All systems operational' : 'Degraded'} color={systemHealth.status === 'UP' ? 'success' : 'warning'} withDot />
              </Box>
            </Stack>
          </DashboardWidget>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardWidget title="Quick Actions" subtitle="Common admin tasks" icon={<BoltOutlinedIcon />} index={1}>
            <Stack spacing={1}>
              {quickActions.map((action) => (
                <Tooltip key={action.label} title={`Open ${action.label.toLowerCase()}`}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    startIcon={action.icon}
                    onClick={() => navigate(action.path)}
                    sx={{ justifyContent: 'flex-start', color: 'text.primary', borderColor: 'divider' }}
                  >
                    {action.label}
                  </Button>
                </Tooltip>
              ))}
            </Stack>
          </DashboardWidget>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardWidget title="Recent Activity" subtitle="Live admin feed" icon={<BoltOutlinedIcon />} index={2}>
            <ActivityFeed items={recentActivities} limit={6} />
          </DashboardWidget>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;
