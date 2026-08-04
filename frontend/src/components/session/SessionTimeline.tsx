import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import StarIcon from '@mui/icons-material/Star';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { formatDateTime } from '@/utils';
import { ROUTES } from '@/constants';
import type { Session } from '@/types';

const STATUS_ICON: Record<string, React.ReactNode> = {
  COMPLETED: <CheckCircleOutlineRoundedIcon sx={{ fontSize: 18 }} />,
  CANCELLED: <CancelOutlinedIcon sx={{ fontSize: 18 }} />,
  NO_SHOW: <EventBusyOutlinedIcon sx={{ fontSize: 18 }} />,
  RESCHEDULED: <ReplayOutlinedIcon sx={{ fontSize: 18 }} />,
};

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: '#10B981',
  CANCELLED: '#EF4444',
  NO_SHOW: '#F59E0B',
  RESCHEDULED: '#3B82F6',
};

interface SessionTimelineProps {
  sessions: Session[];
}

export const SessionTimeline: React.FC<SessionTimelineProps> = ({ sessions }) => {
  const navigate = useNavigate();

  return (
    <Box>
      {sessions.map((session, index) => {
        const color = STATUS_COLOR[session.status] ?? '#94A3B8';
        const isLast = index === sessions.length - 1;

        return (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
          >
            <Stack direction="row" gap={2} sx={{ position: 'relative' }}>
              {/* Node */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    background: `linear-gradient(135deg, ${color}, ${color}AA)`,
                    boxShadow: `0 4px 12px ${color}40`,
                    zIndex: 1,
                  }}
                >
                  {STATUS_ICON[session.status] ?? <StarIcon sx={{ fontSize: 16 }} />}
                </Box>
                {!isLast && (
                  <Box
                    sx={{
                      width: 2,
                      flexGrow: 1,
                      minHeight: 26,
                      background: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.1)'
                          : 'rgba(15,23,42,0.08)',
                    }}
                  />
                )}
              </Box>

              {/* Content */}
              <Box
                sx={{
                  pb: isLast ? 0 : 2.5,
                  flexGrow: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    flexGrow: 1,
                    p: 1.75,
                    borderRadius: 2.5,
                    border: 1,
                    borderColor: 'divider',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                    '&:hover': { borderColor: color, bgcolor: 'action.hover' },
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                    <Typography variant="subtitle2" fontWeight={700} noWrap>
                      {session.topic ?? session.title ?? 'Mentoring session'}
                    </Typography>
                    <Chip
                      size="small"
                      label={session.status.replace(/_/g, ' ')}
                      sx={{ color, borderColor: `${color}66`, fontWeight: 700, bgcolor: `${color}14` }}
                      variant="outlined"
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    with {session.mentorName ?? 'Mentor'} · {formatDateTime(session.startTime)}
                  </Typography>
                  {session.cancellationReason && (
                    <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5 }}>
                      {session.cancellationReason}
                    </Typography>
                  )}
                  {session.rating !== undefined && (
                    <Stack direction="row" alignItems="center" gap={0.5} sx={{ mt: 0.75, color: '#F59E0B' }}>
                      <StarIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption" fontWeight={800}>
                        {session.rating}.0
                      </Typography>
                      {session.feedback && (
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ ml: 0.5 }}>
                          “{session.feedback}”
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Box>
                <Tooltip title="Open session">
                  <IconButton
                    size="small"
                    aria-label="Open session details"
                    onClick={() =>
                      navigate(ROUTES.SESSION_DETAILS.replace(':sessionId', session.id))
                    }
                  >
                    <ChevronRightIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          </motion.div>
        );
      })}
    </Box>
  );
};

export default SessionTimeline;
