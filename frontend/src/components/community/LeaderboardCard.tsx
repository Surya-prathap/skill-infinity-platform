import { Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';
import { Avatar, Card } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import type { LeaderboardEntry } from '@/types';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
  highlight?: boolean;
}

/** A single leaderboard row with rank, points and movement. */
export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({ entry, rank, highlight = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.25,
          borderRadius: 2.5,
          transition: 'background-color 0.15s ease, transform 0.15s ease',
          '&:hover': { bgcolor: 'action.hover', transform: 'translateX(4px)' },
          ...(highlight && { bgcolor: 'action.selected' }),
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '0.9rem',
            flexShrink: 0,
            color: rank <= 3 ? '#fff' : 'text.secondary',
            background: rank === 1 ? 'linear-gradient(135deg, #F59E0B, #FBBF24)' : rank === 2 ? 'linear-gradient(135deg, #94A3B8, #CBD5E1)' : rank === 3 ? 'linear-gradient(135deg, #B45309, #D97706)' : 'action.hover',
            boxShadow: rank <= 3 ? '0 4px 12px rgba(245,158,11,0.3)' : 'none',
          }}
        >
          {entry.badge ?? rank}
        </Box>

        <Avatar name={entry.name} size={38} />
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Stack direction="row" alignItems="center" gap={0.75}>
            <Typography variant="subtitle2" fontWeight={800} noWrap>
              {entry.name}
            </Typography>
            {entry.isCurrentUser && (
              <Chip label="You" size="small" color="primary" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800 }} />
            )}
          </Stack>
          <Typography variant="caption" color="text.secondary" noWrap>
            {entry.title}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
          <Typography variant="subtitle2" fontWeight={800} color="primary.main">
            {entry.points.toLocaleString('en-US')} pts
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {entry.metric}
          </Typography>
        </Box>

        <Box sx={{ width: 30, flexShrink: 0, textAlign: 'center' }}>
          {entry.change > 0 ? (
            <Stack direction="row" alignItems="center" sx={{ color: 'success.main' }}>
              <ArrowUpwardIcon sx={{ fontSize: 14 }} />
              <Typography fontSize="0.72rem" fontWeight={800}>
                {entry.change}
              </Typography>
            </Stack>
          ) : entry.change < 0 ? (
            <Stack direction="row" alignItems="center" sx={{ color: 'error.main' }}>
              <ArrowDownwardIcon sx={{ fontSize: 14 }} />
              <Typography fontSize="0.72rem" fontWeight={800}>
                {Math.abs(entry.change)}
              </Typography>
            </Stack>
          ) : (
            <RemoveIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
}

/** Top-3 podium with elevated cards. */
export const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({ entries }) => {
  const order = [1, 0, 2]; // 2nd, 1st, 3rd
  const heights = ['88px', '112px', '72px'];

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, justifyContent: 'center', mb: 1 }}>
      {order.map((index, position) => {
        const entry = entries[index];
        if (!entry) return null;
        const rank = index + 1;
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: position * 0.12, type: 'spring', stiffness: 200, damping: 20 }}
            style={{ flex: 1, maxWidth: 200 }}
          >
            <Card
              sx={{
                p: 2,
                textAlign: 'center',
                background: rank === 1
                  ? 'linear-gradient(160deg, rgba(245,158,11,0.14), rgba(251,191,36,0.05))'
                  : rank === 2
                    ? 'linear-gradient(160deg, rgba(148,163,184,0.14), rgba(203,213,225,0.04))'
                    : 'linear-gradient(160deg, rgba(180,83,9,0.14), rgba(217,119,6,0.04))',
                borderColor: rank === 1 ? 'rgba(245,158,11,0.4)' : 'divider',
                height: heights[position],
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + position * 0.1, type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Box sx={{ fontSize: '1.8rem', lineHeight: 1 }}>{entry.badge ?? `${rank}${rank === 1 ? 'st' : rank === 2 ? 'nd' : 'rd'}`}</Box>
              </motion.div>
              <Typography fontSize="0.82rem" fontWeight={800} noWrap sx={{ maxWidth: 130 }}>
                {entry.name}
              </Typography>
              <Typography fontSize="0.72rem" fontWeight={800} color="primary.main">
                {entry.points.toLocaleString('en-US')} pts
              </Typography>
            </Card>
          </motion.div>
        );
      })}
    </Box>
  );
};

export default LeaderboardRow;
