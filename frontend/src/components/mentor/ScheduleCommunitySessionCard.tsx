import { useState } from 'react';
import { Button, Grid, TextField } from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useCreateCommunitySessionMutation } from '@/features/sessions';
import dayjs from 'dayjs';

/**
 * Lets a mentor schedule a free community mentoring session. Learners join it
 * at no credit cost (3/month allowance) and it feeds the mentor's community
 * recognition.
 */
export const ScheduleCommunitySessionCard: React.FC = () => {
  const create = useCreateCommunitySessionMutation();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationMin, setDurationMin] = useState(60);

  const start = startTime ? dayjs(startTime) : null;
  const end = start ? start.add(durationMin, 'minute') : null;
  const canSubmit =
    topic.trim().length >= 3 &&
    Boolean(startTime) &&
    Boolean(start && start.isAfter(dayjs())) &&
    !create.isPending;

  const submit = () => {
    if (!start || !end) return;
    create.mutate(
      {
        topic: topic.trim(),
        description: description.trim() || undefined,
        startTime: start.format('YYYY-MM-DDTHH:mm:ss'),
        endTime: end.format('YYYY-MM-DDTHH:mm:ss'),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      {
        onSuccess: () => {
          setTopic('');
          setDescription('');
          setStartTime('');
          setDurationMin(60);
        },
      },
    );
  };

  return (
    <Card sx={{ p: 3.5, height: '100%' }}>
      <SectionHeader
        icon={<GroupsOutlinedIcon />}
        iconColor="#10B981"
        title="Schedule a community session"
        subtitle="Free for learners — grows your community recognition"
      />
      <Stack spacing={2} sx={{ mt: 2.5 }}>
        <TextField
          label="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Java Streams Crash Course"
          size="small"
          fullWidth
        />
        <TextField
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What learners will take away"
          size="small"
          fullWidth
          multiline
          minRows={2}
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <TextField
              label="Start time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              size="small"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <TextField
              label="Duration"
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(Number(e.target.value) || 30)}
              size="small"
              fullWidth
              helperText="minutes"
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="success"
          disabled={!canSubmit}
          onClick={submit}
          sx={{ fontWeight: 800, py: 1.25 }}
        >
          {create.isPending ? 'Scheduling…' : 'Schedule free session'}
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          Learners can join for free (3 per month) — every completed session adds to your
          community contribution score.
        </Typography>
      </Stack>
    </Card>
  );
};

export default ScheduleCommunitySessionCard;
