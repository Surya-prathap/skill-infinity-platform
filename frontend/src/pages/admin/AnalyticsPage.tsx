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
import { LineChart, StackedBarChart, BarChart, DonutChart, HeatmapChart, RadarChart } from '@/components/charts';
import { formatCompactNumber, formatCurrency } from '@/utils';
import { useAdminAnalyticsQuery } from '@/features/admin';
import type { ChartPoint } from '@/components/charts/AreaChart';

export const AnalyticsPage: React.FC = () => {
  useDocumentTitle('Analytics');
  const { analytics, isLoading } = useAdminAnalyticsQuery();

  const revenueByMonth = useMemo(() => {
    const entries = Object.entries(analytics.revenue.revenueByMonth);
    return {
      labels: entries.map(([label]) => label),
      values: entries.map(([, value]) => value),
    };
  }, [analytics]);

  const revenueSeries = useMemo(
    () => [
      {
        name: 'Revenue',
        color: '#6D5DF6',
        points: revenueByMonth.labels.map((label, index) => ({ label: label.slice(0, 3), value: revenueByMonth.values[index]! })),
      },
      {
        name: 'Users (×10)',
        color: '#14B8A6',
        points: revenueByMonth.labels.map((label, index) => ({
          label: label.slice(0, 3),
          value: Math.round(3200 + index * 460 + (index % 3) * 180),
        })),
      },
    ],
    [revenueByMonth],
  );

  const registrationPoints: ChartPoint[] = Object.entries(analytics.growth.registrationsByDay).map(([label, value]) => ({
    label,
    value,
  }));

  const sessionStack = useMemo(() => {
    const statuses = analytics.sessions.sessionsByStatus;
    const labels = Object.keys(statuses).map((key) => key.charAt(0) + key.slice(1).toLowerCase());
    return [
      {
        label: 'Week 1',
        segments: labels.map((status, index) => ({ name: status, value: Object.values(statuses)[index]! / 10, color: ['#6D5DF6', '#14B8A6', '#10B981', '#EF4444', '#F59E0B'][index]! })),
      },
      {
        label: 'Week 2',
        segments: labels.map((status, index) => ({ name: status, value: Object.values(statuses)[index]! / 9.4, color: ['#6D5DF6', '#14B8A6', '#10B981', '#EF4444', '#F59E0B'][index]! })),
      },
      {
        label: 'Week 3',
        segments: labels.map((status, index) => ({ name: status, value: Object.values(statuses)[index]! / 8.8, color: ['#6D5DF6', '#14B8A6', '#10B981', '#EF4444', '#F59E0B'][index]! })),
      },
      {
        label: 'Week 4',
        segments: labels.map((status, index) => ({ name: status, value: Object.values(statuses)[index]! / 8.2, color: ['#6D5DF6', '#14B8A6', '#10B981', '#EF4444', '#F59E0B'][index]! })),
      },
    ];
  }, [analytics]);

  const trafficSegments = [
    { label: 'Organic', value: 46, color: '#6D5DF6' },
    { label: 'Referral', value: 24, color: '#14B8A6' },
    { label: 'Social', value: 15, color: '#F59E0B' },
    { label: 'Direct', value: 10, color: '#3B82F6' },
    { label: 'Paid', value: 5, color: '#EC4899' },
  ];

  const learningHeatmap = [
    { label: 'Mon', cells: [{ label: '8a', value: 22 }, { label: '12p', value: 48 }, { label: '4p', value: 64 }, { label: '8p', value: 88 }, { label: '12a', value: 34 }] },
    { label: 'Tue', cells: [{ label: '8a', value: 18 }, { label: '12p', value: 42 }, { label: '4p', value: 58 }, { label: '8p', value: 92 }, { label: '12a', value: 41 }] },
    { label: 'Wed', cells: [{ label: '8a', value: 26 }, { label: '12p', value: 51 }, { label: '4p', value: 70 }, { label: '8p', value: 96 }, { label: '12a', value: 45 }] },
    { label: 'Thu', cells: [{ label: '8a', value: 20 }, { label: '12p', value: 44 }, { label: '4p', value: 62 }, { label: '8p', value: 85 }, { label: '12a', value: 30 }] },
    { label: 'Fri', cells: [{ label: '8a', value: 28 }, { label: '12p', value: 55 }, { label: '4p', value: 74 }, { label: '8p', value: 80 }, { label: '12a', value: 36 }] },
    { label: 'Sat', cells: [{ label: '8a', value: 38 }, { label: '12p', value: 62 }, { label: '4p', value: 48 }, { label: '8p', value: 52 }, { label: '12a', value: 24 }] },
    { label: 'Sun', cells: [{ label: '8a', value: 30 }, { label: '12p', value: 40 }, { label: '4p', value: 34 }, { label: '8p', value: 28 }, { label: '12a', value: 15 }] },
  ];

  const engagementPoints: ChartPoint[] = [
    { label: 'Posts', value: analytics.engagement.totalPosts },
    { label: 'Comments', value: analytics.engagement.totalComments },
    { label: 'Reviews', value: analytics.engagement.totalReviews },
    { label: 'Reactions', value: 72000 },
  ];

  const radarAxes = [
    { label: 'Growth', value: 82 },
    { label: 'Revenue', value: 74 },
    { label: 'Engagement', value: 91 },
    { label: 'Retention', value: 68 },
    { label: 'Quality', value: 88 },
    { label: 'Support', value: 77 },
  ];

  const kpis = [
    { label: 'Total Revenue', value: analytics.revenue.totalRevenue, prefix: '$', icon: <PaymentsOutlinedIcon />, color: '#10B981', delta: analytics.growth.revenueGrowthRate, deltaLabel: `${formatCurrency(analytics.revenue.monthlyRevenue)} this month`, index: 0 },
    { label: 'Active Users', value: analytics.users.activeUsers, icon: <BoltOutlinedIcon />, color: '#6D5DF6', delta: analytics.growth.userGrowthRate, deltaLabel: `${formatCompactNumber(analytics.users.newUsersThisMonth)} new this month`, index: 1 },
    { label: 'Sessions Completed', value: analytics.sessions.completedSessions, icon: <EventAvailableOutlinedIcon />, color: '#14B8A6', delta: analytics.growth.sessionGrowthRate, deltaLabel: `${analytics.sessions.averageSessionDuration} min avg duration`, index: 2 },
    { label: 'Avg. Rating', value: analytics.engagement.averageRating, decimals: 1, icon: <StarOutlinedIcon />, color: '#F59E0B', delta: 0.1, deltaLabel: `${formatCompactNumber(analytics.engagement.totalReviews)} reviews`, index: 3 },
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
        subtitle="Revenue, growth, engagement and retention across the platform."
        actions={
          <Stack direction="row" spacing={2}>
            {[
              { label: 'Revenue', color: '#6D5DF6' },
              { label: 'Users', color: '#14B8A6' },
            ].map((legend) => (
              <Stack key={legend.label} direction="row" spacing={0.75} alignItems="center">
                <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: legend.color }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  {legend.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        }
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
          <ChartCard title="Revenue & User Growth" subtitle="Trailing 12 months" index={0}>
            <LineChart series={revenueSeries} height={300} suffix="$" />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ChartCard title="Traffic Sources" subtitle="Acquisition channels" index={1}>
            <DonutChart segments={trafficSegments} size={180} centerValue="100%" centerLabel="traffic" />
            <Stack spacing={1} sx={{ mt: 2 }}>
              {trafficSegments.map((segment) => (
                <Stack key={segment.label} direction="row" alignItems="center" spacing={1}>
                  <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: segment.color }} />
                  <Typography variant="caption" fontWeight={600}>
                    {segment.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    {segment.value}%
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <ChartCard title="Session Statistics" subtitle="Weekly volume by status" index={0}>
            <StackedBarChart data={sessionStack} height={260} />
            <Stack direction="row" spacing={2} sx={{ mt: 2, flexWrap: 'wrap' }}>
              {sessionStack[0]!.segments.map((segment) => (
                <Stack key={segment.name} direction="row" spacing={0.75} alignItems="center">
                  <Box component="span" sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: segment.color }} />
                  <Typography variant="caption" fontWeight={600} color="text.secondary">
                    {segment.name}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <ChartCard title="Performance Radar" subtitle="Health across six dimensions" index={1}>
            <RadarChart axes={radarAxes} height={300} color="#6D5DF6" />
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <ChartCard title="Learning Activity Heatmap" subtitle="Sessions by weekday & time of day (UTC)" index={0}>
            <HeatmapChart rows={learningHeatmap} />
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <ChartCard title="Community Engagement" subtitle="Total interactions" index={1}>
            <BarChart data={engagementPoints} height={220} color="#14B8A6" />
          </ChartCard>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <ChartCard title="Daily Registrations" subtitle="New users per weekday" index={0}>
            <BarChart data={registrationPoints} height={220} color="#6D5DF6" />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsPage;
