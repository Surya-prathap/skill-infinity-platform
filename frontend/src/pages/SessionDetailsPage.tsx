import { useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { Card } from '@/components/ui/Card';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { PageHeader } from '@/components/common';
import { CountdownTimer } from '@/components/session';
import { EmptyState, ErrorState } from '@/components/feedback';
import { useDocumentTitle } from '@/hooks';
import { ROUTES } from '@/constants';
import {
  getJoinButtonLabel,
  getSessionJoinState,
  getSessionMeetingUrl,
  joinSessionMeeting,
  useCancelSessionMutation,
  useRescheduleSessionMutation,
  useSessionQuery,
} from '@/features/sessions';
import dayjs from 'dayjs';
import { formatDateTime, parseApiTime, toAppZoneString } from '@/utils';

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  CONFIRMED: 'success',
  SCHEDULED: 'info',
  APPROVED: 'success',
  PENDING_APPROVAL: 'warning',
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
  REJECTED: 'error',
  RESCHEDULED: 'warning',
  NO_SHOW: 'error',
  EXPIRED: 'error',
};

export const SessionDetailsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { session, isOffline } = useSessionQuery(sessionId);
  useDocumentTitle(session?.topic ?? 'Session details');

  const cancelMutation = useCancelSessionMutation();
  const rescheduleMutation = useRescheduleSessionMutation();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  if (isOffline && !session) {
    return (
      <ErrorState
        title="Session not found"
        message="We couldn't find this session. It may have been removed."
        actionLabel="Back to sessions"
        onAction={() => navigate(ROUTES.SESSIONS)}
      />
    );
  }

  if (!session) {
    return (
      <Box sx={{ py: 6 }}>
        <EmptyState title="Loading session…" />
      </Box>
    );
  }

  // Joinability comes from the backend's start/end timestamps — a session
  // that has started but not ended stays visible and joinable.
  const joinState = getSessionJoinState(session);
  const isUpcoming = [
    'CONFIRMED',
    'SCHEDULED',
    'APPROVED',
    'PENDING',
    'PENDING_APPROVAL',
    'IN_PROGRESS',
  ].includes(session.status);
  const [mentorFirst, mentorLast] = (session.mentorName ?? 'Mentor').split(' ');

  /**
   * Sessions meet over Discord: the backend validates the join window and
   * returns the session's stored invite, then we open it in a new tab. If the
   * invite is missing or the window is closed we show a clear message instead
   * of opening Discord Home.
   */
  const openJoin = () => {
    void joinSessionMeeting(session.id);
  };

  const handleCancel = async () => {
    await cancelMutation.mutateAsync({
      sessionId: session.id,
      reason: cancelReason || undefined,
      cancellationType: 'VOLUNTARY',
    });
    setCancelOpen(false);
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) return;
    // Send Asia/Kolkata wall-clock (the backend stores LocalDateTime in IST).
    const start = toAppZoneString(`${rescheduleDate}T${rescheduleTime}`);
    const end = toAppZoneString(
      dayjs(`${rescheduleDate}T${rescheduleTime}`).add(session.durationMinutes, 'minute').format('YYYY-MM-DDTHH:mm:ss'),
    );
    await rescheduleMutation.mutateAsync({
      sessionId: session.id,
      proposedStartTime: start,
      proposedEndTime: end,
      reason: 'Learner requested reschedule',
    });
    setRescheduleOpen(false);
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.SESSIONS)} sx={{ mb: 2.5 }}>
        Back to sessions
      </Button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <PageHeader
          title={session.topic ?? session.title ?? 'Mentoring session'}
          subtitle={session.description}
          actions={
            <StatusBadge label={session.status.replace(/_/g, ' ')} color={STATUS_COLOR[session.status] ?? 'default'} size="medium" />
          }
        />

        <Grid container spacing={3}>
          {/* ================= Main column ================= */}
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card sx={{ p: { xs: 2.5, md: 3.5 }, mb: 3 }}>
              <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 3 }}>
                <Avatar firstName={mentorFirst} lastName={mentorLast} name={session.mentorName} size={56} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {session.mentorName ?? 'Mentor'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Mentor
                  </Typography>
                </Box>
                {isUpcoming && joinState.eligible && (
                  <Button
                    variant="contained"
                    startIcon={<VideoCallOutlinedIcon />}
                    onClick={openJoin}
                  >
                    {getJoinButtonLabel(session)}
                  </Button>
                )}
                {isUpcoming && !joinState.eligible && joinState.message && (
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {joinState.message}
                  </Typography>
                )}
              </Stack>

              {isUpcoming && session.startTime && (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    mb: 3,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, rgba(109,93,246,0.1), rgba(67,198,192,0.1))',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 1.5 }}>
                    Session starts in
                  </Typography>
                  <Box sx={{ display: 'inline-block' }}>
                    <CountdownTimer target={session.startTime} />
                  </Box>
                </Box>
              )}

              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <AccessTimeOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Schedule</Typography>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {formatDateTime(session.startTime)} – {session.endTime ? parseApiTime(session.endTime)?.format('h:mm A') : ''} · {session.durationMinutes} min
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <PersonOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Participant</Typography>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {session.learnerName ?? 'You'}
                    </Typography>
                  </Box>
                </Stack>
                {isUpcoming && (
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <VideoCallOutlinedIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary">Meeting</Typography>
                      <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ color: 'primary.main' }}>
                        {getSessionMeetingUrl(session)
                          ? 'Discord — join when the session starts'
                          : 'Meeting link is not available yet'}
                      </Typography>
                    </Box>
                  </Stack>
                )}
                {session.recordingUrl && (
                  <Stack direction="row" alignItems="center" gap={1.5}>
                    <CheckCircleOutlineOutlinedIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" color="text.secondary">Recording</Typography>
                      <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ color: 'primary.main' }}>
                        <a
                          href={session.recordingUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          Watch recording
                        </a>
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </Stack>
            </Card>

            {session.notes && (
              <Card sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 1.5 }}>
                  <NotesOutlinedIcon sx={{ color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={800}>
                    Session notes
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {session.notes}
                </Typography>
              </Card>
            )}
          </Grid>

          {/* ================= Sidebar ================= */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                Session info
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" fontWeight={600}>
                    {formatDateTime(session.startTime)}
                  </Typography>
                </Stack>
                {session.cancellationReason && (
                  <Typography variant="body2" color="error.main" fontWeight={600}>
                    Reason: {session.cancellationReason}
                  </Typography>
                )}
                {session.rescheduleCount !== undefined && session.rescheduleCount > 0 && (
                  <Chip
                    size="small"
                    icon={<ReplayOutlinedIcon />}
                    label={`Rescheduled ${session.rescheduleCount}×`}
                    color="info"
                    variant="outlined"
                  />
                )}
              </Stack>

              {isUpcoming && (
                <Stack spacing={1.5} sx={{ mt: 3 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ReplayOutlinedIcon />}
                    onClick={() => setRescheduleOpen(true)}
                  >
                    Reschedule
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<CancelOutlinedIcon />}
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancel session
                  </Button>
                </Stack>
              )}
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Cancel dialog */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Cancel this session?</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={2}
            label="Reason (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCancelOpen(false)}>Keep session</Button>
          <Button color="error" variant="contained" onClick={() => void handleCancel()}>
            Cancel session
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reschedule dialog */}
      <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Reschedule session</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="New date"
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              fullWidth
            />
            <TextField
              label="New time"
              type="time"
              value={rescheduleTime}
              onChange={(e) => setRescheduleTime(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setRescheduleOpen(false)}>Close</Button>
          <Button
            variant="contained"
            disabled={!rescheduleDate || !rescheduleTime}
            onClick={() => void handleReschedule()}
          >
            Confirm reschedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionDetailsPage;
