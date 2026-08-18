import { Box, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import VideoCallOutlinedIcon from '@mui/icons-material/VideoCallOutlined';
import StarIcon from '@mui/icons-material/Star';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Avatar } from '@/components/ui/Avatar';
import { formatDateTime } from '@/utils';
import { ROUTES } from '@/constants';
import { getJoinButtonLabel, getSessionJoinState, getSessionMeetingUrl, joinSessionMeeting } from '@/features/sessions';
import type { Session } from '@/types';

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

const statusLabel = (status: string): string =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

interface SessionCardProps {
  session: Session;
  index?: number;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, index = 0 }) => {
  const navigate = useNavigate();
  // Joinability comes from the backend's start/end timestamps — an approved
  // session stays visible and joinable until its end time.
  const joinState = getSessionJoinState(session);
  const isUpcoming = ['CONFIRMED', 'SCHEDULED', 'APPROVED', 'PENDING', 'PENDING_APPROVAL', 'IN_PROGRESS'].includes(
    session.status,
  );
  // The Join button is present whenever the join window is open — it must
  // never be removed. When no real invite is configured the button still
  // shows, and clicking answers "Meeting link is not available yet." (the
  // backend never fabricates a URL, the frontend never opens Discord Home).
  const canJoin = joinState.eligible;
  const hasMeetingLink = Boolean(getSessionMeetingUrl(session));
  const joinHint =
    joinState.message ?? (joinState.eligible && !hasMeetingLink ? 'Meeting link is not available yet.' : undefined);
  const [mentorFirst, mentorLast] = (session.mentorName ?? 'Mentor').split(' ');

  const open = () => navigate(ROUTES.SESSION_DETAILS.replace(':sessionId', session.id));

  /** Opens the session's Discord invite — backend-validated, window-gated. */
  const openJoin = () => {
    void joinSessionMeeting(session.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25) }}
      whileHover={{ y: -4 }}
      style={{ height: '100%' }}
    >
      <Card hoverable sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" gap={1.25}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                background: isUpcoming
                  ? 'linear-gradient(135deg, #6D5DF6, #5443D4)'
                  : 'linear-gradient(135deg, #10B981, #059669)',
              }}
            >
              <EventAvailableOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <StatusBadge label={statusLabel(session.status)} color={STATUS_COLOR[session.status] ?? 'default'} />
          </Stack>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {formatDateTime(session.startTime)}
          </Typography>
        </Stack>

        <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5, cursor: 'pointer' }} onClick={open}>
          {session.topic ?? session.title ?? 'Mentoring session'}
        </Typography>
        {session.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {session.description}
          </Typography>
        )}

        <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 1.5 }}>
          <Avatar firstName={mentorFirst} lastName={mentorLast} name={session.mentorName} size={26} />
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {session.mentorName ?? 'Mentor'}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }}>
          <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: 'text.secondary' }}>
            <AccessTimeOutlinedIcon sx={{ fontSize: 15 }} />
            <Typography variant="caption" fontWeight={600}>
              {session.durationMinutes} min
            </Typography>
          </Stack>
          {canJoin && hasMeetingLink && (
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: 'success.main' }}>
              <VideoCallOutlinedIcon sx={{ fontSize: 15 }} />
              <Typography variant="caption" fontWeight={600}>
                Meeting ready
              </Typography>
            </Stack>
          )}
          {isUpcoming && joinHint && (
            <Typography variant="caption" fontWeight={600} sx={{ color: 'text.secondary' }}>
              {joinHint}
            </Typography>
          )}
          {session.rating !== undefined && (
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: '#F59E0B' }}>
              <StarIcon sx={{ fontSize: 15 }} />
              <Typography variant="caption" fontWeight={700}>
                {session.rating}.0
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Community session cost + seats — real backend values, never fabricated. */}
        {session.community && (
          <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
            <Chip
              label={(session.price ?? 0) === 0 ? 'FREE' : `${session.price} credit${(session.price ?? 0) > 1 ? 's' : ''}`}
              size="small"
              color={(session.price ?? 0) === 0 ? 'success' : 'primary'}
              variant={(session.price ?? 0) === 0 ? 'filled' : 'outlined'}
              sx={{ fontWeight: 800 }}
            />
            {session.maxParticipants !== undefined && (
              <Typography
                variant="caption"
                fontWeight={700}
                color={(session.remainingSeats ?? 0) === 0 ? 'error.main' : 'text.secondary'}
              >
                {(session.remainingSeats ?? 0) === 0
                  ? 'Full'
                  : `${session.remainingSeats} seat${(session.remainingSeats ?? 0) === 1 ? '' : 's'} left`}
              </Typography>
            )}
          </Stack>
        )}

        <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5 }}>
          <Button fullWidth variant="contained" size="small" onClick={open}>
            {isUpcoming ? 'View details' : 'View summary'}
          </Button>
          {canJoin && (
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={openJoin}
              startIcon={<VideoCallOutlinedIcon />}
            >
              {getJoinButtonLabel(session)}
            </Button>
          )}
        </Box>

        {session.price !== undefined && session.price > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5 }}>
            {session.price} credits
          </Typography>
        )}
      </Card>
    </motion.div>
  );
};

export default SessionCard;
