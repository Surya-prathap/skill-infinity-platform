import { Box, Button } from '@mui/material';
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
import { formatCurrency, formatDateTime } from '@/utils';
import { ROUTES } from '@/constants';
import type { Session } from '@/types';

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  CONFIRMED: 'success',
  SCHEDULED: 'info',
  PENDING: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
  RESCHEDULED: 'warning',
  NO_SHOW: 'error',
};

const statusLabel = (status: string): string =>
  status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

interface SessionCardProps {
  session: Session;
  index?: number;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, index = 0 }) => {
  const navigate = useNavigate();
  const isUpcoming = ['CONFIRMED', 'SCHEDULED', 'PENDING', 'IN_PROGRESS'].includes(session.status);
  const [mentorFirst, mentorLast] = (session.mentorName ?? 'Mentor').split(' ');

  const open = () => navigate(ROUTES.SESSION_DETAILS.replace(':sessionId', session.id));

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
          {session.meetingLink?.active && (
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: 'success.main' }}>
              <VideoCallOutlinedIcon sx={{ fontSize: 15 }} />
              <Typography variant="caption" fontWeight={600}>
                Meeting ready
              </Typography>
            </Stack>
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

        <Box sx={{ mt: 'auto', display: 'flex', gap: 1.5 }}>
          <Button fullWidth variant="contained" size="small" onClick={open}>
            {isUpcoming ? 'View details' : 'View summary'}
          </Button>
          {isUpcoming && session.meetingLink?.active && (
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => window.open(session.meetingLink?.joinUrl, '_blank')}
              startIcon={<VideoCallOutlinedIcon />}
            >
              Join
            </Button>
          )}
        </Box>

        {session.price !== undefined && session.price > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5 }}>
            {formatCurrency(session.price)}
          </Typography>
        )}
      </Card>
    </motion.div>
  );
};

export default SessionCard;
