import { Box, Grid } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { Card, DataTable, PageHeader, StatusBadge } from '@/components';
import { useDocumentTitle } from '@/hooks';
import { formatCurrency } from '@/utils';

const ADMIN_STATS = [
  { title: 'Total Users', value: '48,203', change: '+1.2% this week', icon: <PeopleAltOutlinedIcon />, color: '#6D5DF6' },
  { title: 'Verified Mentors', value: '2,541', change: '+18 this week', icon: <VerifiedUserOutlinedIcon />, color: '#14B8A6' },
  { title: 'Platform Revenue', value: formatCurrency(38200), change: '+8.4% this month', icon: <PaymentsOutlinedIcon />, color: '#F59E0B' },
  { title: 'Open Reports', value: '14', change: '3 urgent', icon: <ReportProblemOutlinedIcon />, color: '#EF4444' },
];

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Suspended' | 'Pending';
}

const USERS: UserRow[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@example.com', role: 'Learner', status: 'Active' },
  { id: '2', name: 'Alex Rivera', email: 'alex@example.com', role: 'Mentor', status: 'Active' },
  { id: '3', name: 'Marcus Reid', email: 'marcus@example.com', role: 'Learner', status: 'Pending' },
  { id: '4', name: 'Priya Sharma', email: 'priya@example.com', role: 'Mentor', status: 'Suspended' },
];

const WEEKLY_BARS = [42, 58, 35, 72, 64, 88, 76];

export const AdminDashboardPage: React.FC = () => {
  useDocumentTitle('Admin Dashboard');

  return (
    <Box>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform health, growth and moderation at a glance."
        actions={<StatusBadge label="All systems operational" color="success" />}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {ADMIN_STATS.map((stat) => (
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
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {stat.title}
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
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
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
              Recently Registered Users
            </Typography>
            <DataTable<UserRow>
              columns={[
                { id: 'name', label: 'Name' },
                { id: 'email', label: 'Email' },
                { id: 'role', label: 'Role' },
                {
                  id: 'status',
                  label: 'Status',
                  align: 'center',
                  render: (row) => (
                    <StatusBadge
                      label={row.status}
                      color={row.status === 'Active' ? 'success' : row.status === 'Pending' ? 'warning' : 'error'}
                    />
                  ),
                },
              ]}
              rows={USERS}
              keyExtractor={(row) => row.id}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
              New Sign-ups (7 days)
            </Typography>
            <Stack direction="row" alignItems="flex-end" spacing={1.5} sx={{ height: 180 }}>
              {WEEKLY_BARS.map((value, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    height: `${value}%`,
                    borderRadius: 2,
                    background: 'linear-gradient(180deg, #6D5DF6, #43C6C0)',
                    opacity: 0.7 + index * 0.05,
                    transition: 'transform 0.2s ease',
                    '&:hover': { transform: 'scaleY(1.03)' },
                  }}
                />
              ))}
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <Typography key={index} variant="caption" color="text.secondary">
                  {day}
                </Typography>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboardPage;
