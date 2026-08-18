import { useRef, useState } from 'react';
import { Button, Chip, Grid, MenuItem, TextField } from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useCreateCommunitySessionMutation } from '@/features/sessions';
import dayjs from 'dayjs';

/** Cost options: 0 (TRUE FREE) through the 3-credit ceiling. */
const COST_OPTIONS = [0, 1, 2, 3];

/** Recommended capacity options within the 1–20 enforced range. */
const CAPACITY_OPTIONS = [5, 10, 15, 20];

/**
 * Lets a mentor schedule a community mentoring session. The mentor picks a
 * cost between 0 and 3 credits (0 = TRUE FREE, counts toward free-session
 * benefits; 1–3 = paid community session) and a learner capacity of 1–20.
 * The backend re-validates both limits — the UI never bypasses them.
 */
export const ScheduleCommunitySessionCard: React.FC = () => {
  const create = useCreateCommunitySessionMutation();
  // Guards against a double-click firing the mutation twice before React
  // re-renders with `isPending` — two rapid submissions would otherwise race
  // the backend (which now also rejects duplicate slots) and produce a
  // confusing timeout/duplicate error.
  const submittingRef = useRef(false);
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationMin, setDurationMin] = useState(60);
  const [cost, setCost] = useState(0);
  const [capacity, setCapacity] = useState(20);

  const start = startTime ? dayjs(startTime) : null;
  const end = start ? start.add(durationMin, 'minute') : null;
  const isFree = cost === 0;
  const canSubmit =
    topic.trim().length >= 3 &&
    Boolean(startTime) &&
    Boolean(start && start.isAfter(dayjs())) &&
    !create.isPending;

  const submit = () => {
    if (!start || !end) return;
    if (submittingRef.current) return;
    submittingRef.current = true;
    create.mutate(
      {
        topic: topic.trim(),
        description: description.trim() || undefined,
        startTime: start.format('YYYY-MM-DDTHH:mm:ss'),
        endTime: end.format('YYYY-MM-DDTHH:mm:ss'),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cost,
        maxParticipants: capacity,
      },
      {
        onSuccess: () => {
          submittingRef.current = false;
          setTopic('');
          setDescription('');
          setStartTime('');
          setDurationMin(60);
          setCost(0);
          setCapacity(20);
        },
        onError: () => {
          submittingRef.current = false;
        },
        onSettled: () => {
          // Safety net: never leave the guard latched.
          submittingRef.current = false;
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
        subtitle="0 credits is FREE — 1–3 credits is a paid group session"
      />
      <Stack spacing={2} sx={{ mt: 2.5 }}>
        <TextField
          label="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Java Resume Screening"
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
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Cost per learner"
              select
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              size="small"
              fullWidth
              helperText="Max 3 credits — 0 credits is FREE"
            >
              {COST_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option === 0 ? '0 credits (FREE)' : `${option} credit${option > 1 ? 's' : ''}`}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Max learners"
              select
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              size="small"
              fullWidth
              helperText="Up to 20 learners per session"
            >
              {CAPACITY_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option} learners
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip
            label={isFree ? 'TRUE FREE session' : `${cost} credit${cost > 1 ? 's' : ''} per learner`}
            size="small"
            color={isFree ? 'success' : 'primary'}
            variant={isFree ? 'filled' : 'outlined'}
            sx={{ fontWeight: 800 }}
          />
          <Chip
            label={`Capacity ${capacity} learners`}
            size="small"
            color="default"
            variant="outlined"
            sx={{ fontWeight: 800 }}
          />
        </Stack>

        <Button
          variant="contained"
          color="success"
          disabled={!canSubmit}
          onClick={submit}
          sx={{ fontWeight: 800, py: 1.25 }}
        >
          {create.isPending ? 'Scheduling…' : isFree ? 'Schedule FREE session' : `Schedule session (${cost} credits)`}
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          {isFree
            ? 'FREE sessions count toward your community benefits — every completed free session grows your recognition.'
            : 'Learners are charged credits only after the session is successfully completed.'}
        </Typography>
      </Stack>
    </Card>
  );
};

export default ScheduleCommunitySessionCard;
