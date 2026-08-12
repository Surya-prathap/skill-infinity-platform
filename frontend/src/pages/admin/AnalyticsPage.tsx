import { useMemo } from 'react';
import { Box, Grid } from '@mui/material';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Stack, Typography } from '@/components/ui';
import { KpiCard, ChartCard, AdminKpiSkeleton, AdminChartSkeleton } from '@/components/admin';
import { LineChart, BarChart, DonutChart } from '@/components/charts';
import { formatCompactNumber, formatCurrency } from '@/utils';
import { useAdminAnalyticsQuery } from '@/features/admin';
import type { ChartPoint } from '@/components/charts/AreaChart';

export const AnalyticsPage: React.FC = () => {
  useDocumentTitle('Analytics');
  const { analytics, isLoading } = useAdminAnalyticsQuery();

  const revenueByMonth = useMemo(() => {
    const entries = Object.entries(analytics.revenue.revenueByMonth);
    return entries.map(([label, value]) => ({ label: label.slice(0, 3), value }));
  }, [analytics]);

  const revenueSeries = useMemo(
    () => [
      {
        name: 'Revenue',
        color: '#6D5DF6',
        points: revenueByMonth,
      },
    ],
    [revenueByMonth],
  );

  const registrationPoints: ChartPoint[] = Object.entries(analytics.growth.registrationsByDay).map(
    ([label, value]) => ({ label, value }),
  );

  const sessionPoints: ChartPoint[] = Object.entries(analytics.sessions.sessionsByStatus).map(
    ([status, value]) => ({ label: status.charAt(0) + status.slice(1).toLowerCase(), value }),
  );

  const engagementSegments = [
    { label: 'Reviews', value: analytics.engagement.totalReviews, color: '#F59E0B' },
    { label: 'Posts', value: analytics.engagement.totalPosts, color: '#6D5DF6' },
    { label: 'Comments', value: analytics.engagement.totalComments, color: '#14B8A6' },
  ];

  const kpis = [
    { label: 'Total Revenue', value: analytics.revenue.totalRevenue, prefix: '₹', icon: <PaymentsOutlinedIcon />, color: '#10B981', delta: analytics.growth.revenueGrowthRate, deltaLabel: `${formatCurrency(analytics.revenue.monthlyRevenue)} this month`, index: 0 },
    { label: 'Active Users', value: analytics.users.activeUsers, icon: <BoltOutlinedIcon />, color: '#6D5DF6', delta: analytics.growth.userGrowthRate, deltaLabel: `${formatCompactNumber(analytics.users.newUsersThisMonth)} new this month`, index: 1 },
    { label: 'Sessions Completed', value: analytics.sessions.completedSessions, icon: <EventAvailableOutlinedIcon />, color: '#14B8A6', delta: analytics.growth.sessionGrowthRate, deltaLabel: `${analytics.sessions.averageSessionDuration} min avg duration`, index: 2 },
    { label: 'Avg. Rating', value: analytics.engagement.averageRating, decimals: 1, icon: <StarOutlinedIcon />, color: '#F59E0B', deltaLabel: `${formatCompactNumber(analytics.engagement.totalReviews)} reviews`, index: 3 },
  ];

  if (isLoading) {
    return (
      <Box>
        <PageHeader title="Analytics" subtitle="Deep-dive into platform performance." />
        <AdminKpiSkeleton />
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, lg: 8 }}><AdminChartSkeleton height={360} /></Grid>
          <Grid size={{ xs: 12, lg: 4 }}><AdminChartSkeleton height={360} /></Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Platform Analytics"
        subtitle="Revenue, growth and engagement across the platform."
      />

      <Grid container spacing={3}>
        {kpis.map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard {...kpi} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ChartCard title="Revenue Trend" subtitle="Monthly gross revenue" index={0}>
            <LineChart series={revenueSeries} height={300} />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ChartCard title="Engagement Overview" subtitle="Reviews, posts and comments" index={1}>
            <DonutChart
              segments={engagementSegments}
              size={180}
              centerValue={formatCompactNumber(
                analytics.engagement.totalReviews +
                  analytics.engagement.totalPosts +
                  analytics.engagement.totalComments,
              )}
              centerLabel="interactions"
            />
            <Stack spacing={1} sx={{ mt: 2 }}>
              {engagementSegments.map((segment) => (
                <Stack key={segment.label} direction="row" alignItems="center" spacing={1}>
                  <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: segment.color }} />
                  <Typography variant="caption" fontWeight={600}>
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

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <ChartCard title="Session Statistics" subtitle="Total sessions by status" index={0}>
            <BarChart data={sessionPoints} height={260} color="#6D5DF6" suffix=" sessions" />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <ChartCard title="Daily Registrations" subtitle="New users per weekday" index={1}>
            <BarChart data={registrationPoints} height={260} color="#14B8A6" />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
