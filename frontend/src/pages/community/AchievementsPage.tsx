import { useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, LinearProgress, Skeleton } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import { PageHeader } from '@/components/common';
import { AchievementCard } from '@/components/community';
import { Card } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { DonutChart } from '@/components/charts';
import { useDocumentTitle } from '@/hooks';
import { useAchievementsQuery, useLearningStatsQuery } from '@/features/community';
import type { AchievementType } from '@/types';

const TYPE_LABELS: Record<string, string> = {
  BADGE: 'Badges',
  CERTIFICATE: 'Certificates',
  MILESTONE: 'Milestones',
  STREAK: 'Streaks',
  CONTRIBUTION: 'Contributions',
};

type TypeFilter = 'ALL' | AchievementType;

export const AchievementsPage: React.FC = () => {
  useDocumentTitle('Achievements');
  const { achievements, isLoading } = useAchievementsQuery();
  const { stats } = useLearningStatsQuery();
  const [filter, setFilter] = useState<TypeFilter>('ALL');
  const [celebrate, setCelebrate] = useState<string | null>(null);

  const unlocked = useMemo(() => achievements.filter((achievement) => achievement.unlocked), [achievements]);
  const locked = useMemo(() => achievements.filter((achievement) => !achievement.unlocked), [achievements]);

  const filteredUnlocked = filter === 'ALL' ? unlocked : unlocked.filter((achievement) => achievement.type === filter);
  const filteredLocked = filter === 'ALL' ? locked : locked.filter((achievement) => achievement.type === filter);

  const totalPoints = unlocked.reduce((sum, achievement) => sum + achievement.points, 0);
  const nextLevelPoints = 5000;
  const progressToLevel = Math.min(100, Math.round((totalPoints / nextLevelPoints) * 100));

  const donutSegments = [
    { label: 'Badges', value: unlocked.filter((a) => a.type === 'BADGE').length, color: '#6D5DF6' },
    { label: 'Certificates', value: unlocked.filter((a) => a.type === 'CERTIFICATE').length, color: '#14B8A6' },
    { label: 'Milestones', value: unlocked.filter((a) => a.type === 'MILESTONE').length, color: '#F59E0B' },
    { label: 'Streaks', value: unlocked.filter((a) => a.type === 'STREAK').length, color: '#EC4899' },
    { label: 'Contributions', value: unlocked.filter((a) => a.type === 'CONTRIBUTION').length, color: '#3B82F6' },
  ];

  const celebrateUnlock = (id: string) => {
    setCelebrate(id);
    window.setTimeout(() => setCelebrate(null), 2200);
  };

  return (
    <Box>
      <PageHeader
        title="Achievements"
        subtitle="Badges, certificates and milestones that mark your journey."
        actions={
          <Button
            variant="contained"
            startIcon={<EmojiEventsOutlinedIcon />}
            onClick={() => {
              const next = locked[0];
              if (next) celebrateUnlock(next.id);
            }}
          >
            Preview unlock
          </Button>
        }
      />

      <Grid container spacing={3}>
        {/* Level card */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            sx={{
              p: 3,
              mb: 3,
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(109,93,246,0.12), rgba(67,198,192,0.08))',
              borderColor: 'rgba(109,93,246,0.3)',
            }}
          >
            <Box sx={{ position: 'absolute', top: -50, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(109,93,246,0.12)', filter: 'blur(6px)' }} />
            <Stack direction="row" alignItems="center" gap={3} flexWrap="wrap" sx={{ position: 'relative' }}>
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY }}
              >
                <Box sx={{ fontSize: 56 }}>🏆</Box>
              </motion.div>
              <Box sx={{ flexGrow: 1, minWidth: 220 }}>
                <Typography variant="h5" fontWeight={900}>
                  Level: Rising Star
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {totalPoints.toLocaleString('en-US')} / {nextLevelPoints.toLocaleString('en-US')} points to the next level
                </Typography>
                <Box sx={{ mt: 1.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progressToLevel}
                    sx={{ height: 10, borderRadius: 999, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #6D5DF6, #43C6C0)', borderRadius: 999 } }}
                  />
                </Box>
              </Box>
              <Stack direction="row" gap={2}>
                <MiniStat label="Unlocked" value={String(unlocked.length)} color="#10B981" />
                <MiniStat label="Streak" value={`${stats?.streakDays ?? 0}d`} color="#F59E0B" />
                <MiniStat label="Points" value={totalPoints.toLocaleString('en-US')} color="#6D5DF6" />
              </Stack>
            </Stack>
          </Card>
        </Grid>

        {/* Donut */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
              Collection
            </Typography>
            <DonutChart
              segments={donutSegments}
              size={170}
              strokeWidth={18}
              centerValue={String(unlocked.length)}
              centerLabel="unlocked"
            />
          </Card>
        </Grid>
      </Grid>

      {/* Type filter */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
        {(['ALL', 'BADGE', 'CERTIFICATE', 'MILESTONE', 'STREAK', 'CONTRIBUTION'] as TypeFilter[]).map((option) => (
          <Chip
            key={option}
            label={option === 'ALL' ? 'All' : TYPE_LABELS[option]}
            onClick={() => setFilter(option)}
            color={filter === option ? 'primary' : 'default'}
            variant={filter === option ? 'filled' : 'outlined'}
            sx={{ fontWeight: 800 }}
          />
        ))}
      </Box>

      {isLoading && achievements.length === 0 ? (
        <Grid container spacing={3}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Skeleton variant="rounded" height={210} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
            <BadgeOutlinedIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={800}>
              Unlocked ({filteredUnlocked.length})
            </Typography>
          </Stack>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <AnimatePresence>
              {filteredUnlocked.map((achievement) => (
                <Grid key={achievement.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <AchievementCard achievement={achievement} justUnlocked={celebrate === achievement.id} />
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>

          {filteredLocked.length > 0 && (
            <>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                <LocalFireDepartmentIcon sx={{ color: 'text.disabled' }} />
                <Typography variant="h6" fontWeight={800} color="text.secondary">
                  Still in progress ({filteredLocked.length})
                </Typography>
              </Stack>
              <Grid container spacing={3}>
                {filteredLocked.map((achievement) => (
                  <Grid key={achievement.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                    <AchievementCard achievement={achievement} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}
    </Box>
  );
};

const MiniStat: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <Box sx={{ textAlign: 'center', px: 1.5 }}>
    <Typography variant="h5" fontWeight={900} sx={{ color }}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary" fontWeight={600}>
      {label}
    </Typography>
  </Box>
);

export default AchievementsPage;
