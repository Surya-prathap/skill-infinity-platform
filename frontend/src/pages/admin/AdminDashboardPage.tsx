import { Box, Grid, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import { useDocumentTitle } from '@/hooks';
import { PageHeader } from '@/components/common';
import { Stack, Typography } from '@/components/ui';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KpiCard, DashboardWidget, ActivityFeed, AdminDashboardSkeleton } from '@/components/admin';
import { formatCompactNumber } from '@/utils';
import { useAdminDashboardQuery } from '@/features/admin';
import { ROUTES } from '@/constants';

export const AdminDashboardPage: React.FC = () => {
  useDocumentTitle('Admin Dashboard');
  const navigate = useNavigate();

  const { dashboard, isLoading, isOffline } = useAdminDashboardQuery();

  if (isLoading) return <AdminDashboardSkeleton />;

  const { totalUsers, totalMentors, totalLearners, recentActivities, systemHealth } = dashboard;

  const kpis = [
    { label: 'Total Users', value: totalUsers, icon: <PeopleAltOutlinedIcon />, color: '#6D5DF6', deltaLabel: 'all registered accounts', index: 0 },
    { label: 'Learners', value: totalLearners, icon: <GroupsOutlinedIcon />, color: '#3B82F6', deltaLabel: 'learning via the platform', index: 1 },
    { label: 'Mentors', value: totalMentors, icon: <SchoolOutlinedIcon />, color: '#14B8A6', deltaLabel: 'verified mentors', index: 2 },
  ];

  const quickActions = [
    { label: 'Review mentors', icon: <SchoolOutlinedIcon />, path: ROUTES.ADMIN_MENTORS },
  ];

  return (
    <Box>
      <PageHeader
        title="Admin Dashboard"
        subtitle={isOffline ? 'Showing cached platform data — live connection unavailable.' : 'Platform overview at a glance.'}
      />

      {/* KPI grid */}
      <Grid container spacing={3}>
        {kpis.map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard {...kpi} />
          </Grid>
        ))}
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
                  Status
                </Typography>
                <StatusBadge
                  label={systemHealth.status === 'UP' ? 'All systems operational' : 'Degraded'}
                  color={systemHealth.status === 'UP' ? 'success' : 'warning'}
                  withDot
                />
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Uptime
                </Typography>
                <Typography variant="body2" fontWeight={800}>
                  {formatCompactNumber(systemHealth.uptime)}%
                </Typography>
              </Stack>
            </Stack>
          </DashboardWidget>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardWidget title="Quick Actions" subtitle="Common admin tasks" icon={<BoltOutlinedIcon />} index={1}>
            <Stack spacing={1}>
              {quickActions.map((action) => (
                <Tooltip key={action.label} title={`Open ${action.label.toLowerCase()}`}>
                  <Box
                    component="button"
                    onClick={() => navigate(action.path)}
                    sx={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.25,
                      py: 1.25,
                      px: 1.5,
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    {action.icon}
                    {action.label}
                  </Box>
                </Tooltip>
              ))}
            </Stack>
          </DashboardWidget>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardWidget title="Recent Activity" subtitle="Admin actions" icon={<BoltOutlinedIcon />} index={2}>
            <ActivityFeed items={recentActivities} limit={6} />
          </DashboardWidget>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;
