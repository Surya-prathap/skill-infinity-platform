import { Box, Grid } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import MonetizationOnOutlinedIcon from '@mui/icons-material/MonetizationOnOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import StarOutlineOutlinedIcon from '@mui/icons-material/StarOutlineOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { Card, DataTable, PageHeader, StatusBadge } from '@/components';
import { useDocumentTitle } from '@/hooks';
import { formatCurrency } from '@/utils';

const MENTOR_STATS = [
  { title: 'Total Earnings', value: formatCurrency(1240), change: '+18% vs last month', icon: <MonetizationOnOutlinedIcon />, color: '#10B981' },
  { title: 'Sessions Completed', value: '46', change: '+6 this week', icon: <EventAvailableOutlinedIcon />, color: '#6D5DF6' },
  { title: 'Rating', value: '4.9 ★', change: 'From 52 reviews',    icon: <StarOutlineOutlinedIcon />, color: '#F59E0B' },
  { title: 'Active Students', value: '18', change: '+3 new this month', icon: <GroupOutlinedIcon />, color: '#EC4899' },
];

interface SessionRow {
  id: string;
  student: string;
  topic: string;
  date: string;
  amount: string;
  status: 'Confirmed' | 'Completed' | 'Pending';
}

const SESSIONS: SessionRow[] = [
  { id: '1', student: 'Sarah Chen', topic: 'System Design Deep Dive', date: 'Aug 8, 4:00 PM', amount: formatCurrency(40), status: 'Confirmed' },
  { id: '2', student: 'Marcus Reid', topic: 'Backend Architecture', date: 'Aug 9, 10:30 AM', amount: formatCurrency(35), status: 'Confirmed' },
  { id: '3', student: 'Priya Sharma', topic: 'Cloud Fundamentals', date: 'Aug 10, 2:00 PM', amount: formatCurrency(45), status: 'Pending' },
  { id: '4', student: 'Daniel Ortiz', topic: 'System Design Review', date: 'Aug 5, 6:00 PM', amount: formatCurrency(40), status: 'Completed' },
];

export const MentorDashboardPage: React.FC = () => {
  useDocumentTitle('Mentor Dashboard');

  return (
    <Box>
      <PageHeader
        title="Mentor Dashboard"
        subtitle="Track your earnings, sessions and student engagement."
        actions={<StatusBadge label="Available for bookings" color="success" />}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {MENTOR_STATS.map((stat) => (
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

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2.5 }}>
          Upcoming Sessions
        </Typography>
        <DataTable<SessionRow>
          columns={[
            { id: 'student', label: 'Student' },
            { id: 'topic', label: 'Topic' },
            { id: 'date', label: 'Date' },
            { id: 'amount', label: 'Amount', align: 'right' },
            {
              id: 'status',
              label: 'Status',
              align: 'center',
              render: (row) => (
                <StatusBadge
                  label={row.status}
                  color={row.status === 'Completed' ? 'success' : row.status === 'Pending' ? 'warning' : 'info'}
                />
              ),
            },
          ]}
          rows={SESSIONS}
          keyExtractor={(row) => row.id}
        />
      </Card>
    </Box>
  );
};

export default MentorDashboardPage;
