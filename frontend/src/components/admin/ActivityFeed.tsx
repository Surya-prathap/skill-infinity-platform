import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { Stack, Typography } from '@/components/ui';
import { formatRelativeTime } from '@/utils';
import type { AdminActivityItem } from '@/types';

const ACTION_ICONS: Record<string, { emoji: string; color: string }> = {
  MENTOR_APPROVED: { emoji: '✅', color: '#10B981' },
  USER_SUSPENDED: { emoji: '🚫', color: '#EF4444' },
  PAYMENT_REFUNDED: { emoji: '💸', color: '#F59E0B' },
  ANNOUNCEMENT: { emoji: '📣', color: '#6D5DF6' },
  FLAG_UPDATED: { emoji: '🚩', color: '#3B82F6' },
  REVIEW_APPROVED: { emoji: '⭐', color: '#A855F7' },
  SETTING_UPDATED: { emoji: '⚙️', color: '#14B8A6' },
  TICKET_RESOLVED: { emoji: '🎧', color: '#0EA5E9' },
};

interface ActivityFeedProps {
  items: AdminActivityItem[];
  limit?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ items, limit = 8 }) => {
  const list = items.slice(0, limit);

  if (list.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
        No recent activity.
      </Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      {list.map((item, index) => {
        const meta = ACTION_ICONS[item.action] ?? { emoji: '📌', color: '#64748B' };
        return (
          <motion.div
            key={`${item.action}-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.18) }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  bgcolor: `${meta.color}1A`,
                  border: 1,
                  borderColor: `${meta.color}33`,
                }}
                role="img"
                aria-label={item.action.replace(/_/g, ' ').toLowerCase()}
              >
                {meta.emoji}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                  {item.description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatRelativeTime(item.timestamp)}
                </Typography>
              </Box>
            </Stack>
          </motion.div>
        );
      })}
    </Stack>
  );
};

export default ActivityFeed;
