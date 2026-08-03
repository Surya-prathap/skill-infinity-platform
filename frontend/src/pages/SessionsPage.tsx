import { Box, Button, Chip, Grid, Tab, Tabs } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { Card, PageHeader } from '@/components';
import { useDocumentTitle } from '@/hooks';
import { showInfo } from '@/utils';

const SESSIONS = [
  { id: '1', topic: 'System Design Deep Dive', mentor: 'Alex Rivera', date: 'Aug 8 · 4:00 PM', status: 'Upcoming' },
  { id: '2', topic: 'React Performance Patterns', mentor: 'Emily Watson', date: 'Aug 12 · 6:30 PM', status: 'Upcoming' },
  { id: '3', topic: 'Behavioral Interview Prep', mentor: 'David Kim', date: 'Aug 15 · 11:00 AM', status: 'Upcoming' },
  { id: '4', topic: 'Cloud Fundamentals', mentor: 'Priya Sharma', date: 'Jul 28 · 3:00 PM', status: 'Completed' },
  { id: '5', topic: 'Backend Architecture Review', mentor: 'Sarah Chen', date: 'Jul 21 · 5:30 PM', status: 'Completed' },
];

export const SessionsPage: React.FC = () => {
  useDocumentTitle('Sessions');
  const [tab, setTab] = useState(0);
  const filtered = SESSIONS.filter((session) =>
    tab === 0 ? session.status === 'Upcoming' : session.status === 'Completed',
  );

  return (
    <Box>
      <PageHeader
        title="Sessions"
        subtitle="Book, manage and attend your learning sessions."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => showInfo('Session booking ships with the Booking feature.')}>
            Book Session
          </Button>
        }
      />

      <Card sx={{ p: 3 }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value as number)} sx={{ mb: 3 }}>
          <Tab label={`Upcoming (${SESSIONS.filter((s) => s.status === 'Upcoming').length})`} />
          <Tab label={`Completed (${SESSIONS.filter((s) => s.status === 'Completed').length})`} />
        </Tabs>

        <Grid container spacing={2}>
          {filtered.map((session) => (
            <Grid key={session.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card hoverable sx={{ p: 3, height: '100%' }}>
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <EventAvailableOutlinedIcon color="primary" />
                    <Chip
                      size="small"
                      label={session.status}
                      color={session.status === 'Upcoming' ? 'info' : 'success'}
                      variant="outlined"
                    />
                  </Stack>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {session.topic}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mentor: {session.mentor}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {session.date}
                  </Typography>
                  <Button
                    variant={session.status === 'Upcoming' ? 'contained' : 'outlined'}
                    size="small"
                    fullWidth
                    onClick={() => showInfo('Session management ships with the Booking feature.')}
                  >
                    {session.status === 'Upcoming' ? 'Join Session' : 'View Recording'}
                  </Button>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Card>
    </Box>
  );
};

export default SessionsPage;
