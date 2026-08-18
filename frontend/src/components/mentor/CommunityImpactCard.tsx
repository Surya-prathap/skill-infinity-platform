import { Box, Chip, LinearProgress } from '@mui/material';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/SectionHeader';
import type { CommunityImpact } from '@/types';

/**
 * A mentor's real community contribution — sessions, learners helped, hours,
 * and the earned recognition level. Never fabricated: all values come from the
 * session-service community-impact endpoint.
 */
export const CommunityImpactCard: React.FC<{ impact: CommunityImpact | null; loading?: boolean }> = ({
  impact,
  loading,
}) => {
  if (loading) {
    return (
      <Card sx={{ p: 3.5 }}>
        <SectionHeader icon={<WorkspacePremiumOutlinedIcon />} iconColor="#10B981" title="Your Community Impact" subtitle="Loading your contribution…" />
        <LinearProgress sx={{ mt: 2 }} />
      </Card>
    );
  }

  const completed = impact?.completedSessions ?? 0;
  const levelLabel = impact?.levelLabel ?? 'Community Mentor 🌱 (in progress)';
  const hasLevel = (impact?.level ?? 0) > 0;
  const progressTarget = impact?.nextLevelAt ?? 0;
  const progress = progressTarget > 0 ? Math.min(100, Math.round((completed / progressTarget) * 100)) : 100;

  return (
    <Card sx={{ p: 3.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SectionHeader
        icon={<WorkspacePremiumOutlinedIcon />}
        iconColor="#10B981"
        title="Your Community Impact"
        subtitle="Earned by teaching free community sessions — never purchasable"
        action={
          <Chip
            label={hasLevel ? levelLabel : 'No level yet'}
            size="small"
            color={hasLevel ? 'success' : 'default'}
            variant={hasLevel ? 'filled' : 'outlined'}
            sx={{ fontWeight: 800 }}
          />
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(3, 1fr)' },
          gap: 1.5,
          my: 2.5,
        }}
      >
        {[
          { icon: <EmojiEventsOutlinedIcon />, value: completed, label: 'Community sessions', color: '#10B981' },
          { icon: <GroupsOutlinedIcon />, value: impact?.learnersHelped ?? 0, label: 'Learners helped', color: '#6D5DF6' },
          { icon: <ScheduleOutlinedIcon />, value: impact?.communityHours ?? 0, label: 'Community hours', color: '#F59E0B', decimals: 1 },
        ].map((stat) => (
          <Box
            key={stat.label}
            sx={{
              borderRadius: 2.5,
              p: 1.75,
              border: 1,
              borderColor: 'divider',
              textAlign: 'center',
              transition: 'transform 0.2s ease, border-color 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', borderColor: 'primary.main' },
            }}
          >
            <Box sx={{ color: stat.color, mb: 0.5, display: 'flex', justifyContent: 'center' }}>{stat.icon}</Box>
            <Typography variant="h5" fontWeight={800}>
              {stat.value.toLocaleString('en-IN')}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {stat.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {progressTarget > 0 ? (
        <Box sx={{ mt: 'auto' }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">
              Next level: {impact?.nextLevelLabel}
            </Typography>
            <Typography variant="caption" fontWeight={800} color="success.main">
              {completed} / {progressTarget} sessions
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 999,
              bgcolor: 'action.selected',
              '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #10B981, #34D399)', borderRadius: 999 },
            }}
          />
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 'auto' }}>
          {hasLevel
            ? 'Highest community recognition level reached — keep contributing to grow your impact.'
            : 'Conduct your first community sessions to start earning recognition.'}
        </Typography>
      )}
    </Card>
  );
};

export default CommunityImpactCard;
