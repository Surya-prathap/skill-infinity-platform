import { useState } from 'react';
import { Box, Button, Chip, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { PageHeader } from '@/components/common';
import { LeaderboardPodium, LeaderboardRow } from '@/components/community';
import { Card } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { useDocumentTitle } from '@/hooks';
import { useLeaderboardQuery } from '@/features/community';
import { LEADERBOARD_CATEGORY_LABELS, LEADERBOARD_RANGE_LABELS } from '@/features/community/constants';
import type { LeaderboardCategory, LeaderboardRange } from '@/types';

const CATEGORIES: LeaderboardCategory[] = ['LEARNERS', 'MENTORS', 'CONTRIBUTORS', 'CHAMPIONS', 'HELPFUL'];
const RANGES: LeaderboardRange[] = ['WEEKLY', 'MONTHLY', 'ALL_TIME'];

export const LeaderboardPage: React.FC = () => {
  useDocumentTitle('Leaderboard');
  const [category, setCategory] = useState<LeaderboardCategory>('LEARNERS');
  const [range, setRange] = useState<LeaderboardRange>('WEEKLY');
  const { entries, isLoading } = useLeaderboardQuery(category, range);

  const topThree = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <Box>
      <PageHeader
        title="Leaderboard"
        subtitle="Celebrate the learners, mentors and contributors shaping the community."
        actions={
          <Chip
            icon={<LeaderboardOutlinedIcon />}
            label={`${entries.length} ranked this ${range.toLowerCase().replace('_', ' ')}`}
            variant="outlined"
            sx={{ fontWeight: 800 }}
          />
        }
      />

      {/* Range tabs */}
      <Stack direction="row" gap={0.75} sx={{ mb: 1.5 }}>
        {RANGES.map((option) => (
          <Button
            key={option}
            size="small"
            variant={range === option ? 'contained' : 'outlined'}
            onClick={() => setRange(option)}
            sx={{ fontWeight: 800, minWidth: 0, px: 2 }}
          >
            {LEADERBOARD_RANGE_LABELS[option]}
          </Button>
        ))}
      </Stack>

      {/* Category tabs */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        {CATEGORIES.map((option) => (
          <Chip
            key={option}
            icon={option === 'LEARNERS' ? <SchoolOutlinedIcon /> : undefined}
            label={LEADERBOARD_CATEGORY_LABELS[option]}
            onClick={() => setCategory(option)}
            color={category === option ? 'primary' : 'default'}
            variant={category === option ? 'filled' : 'outlined'}
            sx={{ fontWeight: 800 }}
          />
        ))}
      </Box>

      {isLoading && entries.length === 0 ? (
        <Stack spacing={1.5}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Skeleton key={index} variant="rounded" height={56} />
          ))}
        </Stack>
      ) : (
        <>
          {topThree.length === 3 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <LeaderboardPodium entries={topThree} />
            </motion.div>
          )}

          <Card sx={{ p: { xs: 1.5, md: 2.5 } }}>
            {rest.length === 0 && topThree.length === 0 && (
              <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
                <Typography variant="h6" fontWeight={700}>
                  No rankings yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rankings update as the community grows.
                </Typography>
              </Stack>
            )}
            {rest.map((entry, index) => (
              <LeaderboardRow key={entry.id} entry={entry} rank={index + 4} highlight={entry.isCurrentUser} />
            ))}
          </Card>
        </>
      )}
    </Box>
  );
};

export default LeaderboardPage;
