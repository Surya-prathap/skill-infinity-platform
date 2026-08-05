import { Box, Chip, LinearProgress } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Card } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { ACHIEVEMENT_RARITY } from '@/features/community/constants';
import { formatDate } from '@/utils';
import type { Achievement } from '@/types';

interface AchievementCardProps {
  achievement: Achievement;
  /** Triggers the celebratory unlock animation. */
  justUnlocked?: boolean;
}

const RARITY_GLOW: Record<string, string> = {
  COMMON: '0 0 0 1px rgba(148,163,184,0.25)',
  RARE: '0 0 0 1px rgba(59,130,246,0.3), 0 8px 28px rgba(59,130,246,0.18)',
  EPIC: '0 0 0 1px rgba(139,92,246,0.35), 0 8px 32px rgba(139,92,246,0.22)',
  LEGENDARY: '0 0 0 1px rgba(245,158,11,0.4), 0 8px 36px rgba(245,158,11,0.28)',
};

/** Premium achievement/badge card with rarity glow and animated unlock. */
export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, justUnlocked = false }) => {
  const rarity = ACHIEVEMENT_RARITY[achievement.rarity];
  const progress = achievement.total
    ? Math.min(100, Math.round(((achievement.progress ?? 0) / achievement.total) * 100))
    : achievement.unlocked
      ? 100
      : 0;

  return (
    <motion.div
      layout
      initial={justUnlocked ? { scale: 0.6, rotate: -6, opacity: 0 } : { opacity: 0, y: 14 }}
      animate={justUnlocked ? { scale: 1, rotate: 0, opacity: 1 } : { opacity: 1, y: 0 }}
      transition={justUnlocked ? { type: 'spring', stiffness: 260, damping: 14 } : { duration: 0.35 }}
      style={{ height: '100%' }}
    >
      <Card
        hoverable
        sx={{
          height: '100%',
          p: 2.25,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          ...(achievement.unlocked && { boxShadow: RARITY_GLOW[achievement.rarity] }),
          ...(justUnlocked && { borderColor: rarity.color }),
        }}
      >
        {/* Animated unlock glow */}
        <AnimatePresence>
          {justUnlocked && (
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.6 }}
              style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 50% 30%, ${rarity.color}44, transparent 70%)`,
                pointerEvents: 'none',
              }}
            />
          )}
        </AnimatePresence>

        <motion.div
          animate={justUnlocked ? { y: [0, -8, 0] } : {}}
          transition={{ duration: 0.6, repeat: justUnlocked ? 2 : 0 }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              mx: 'auto',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              mb: 1,
              background: achievement.unlocked
                ? `linear-gradient(135deg, ${rarity.color}33, ${rarity.color}11)`
                : 'action.hover',
              border: `2px solid ${achievement.unlocked ? rarity.color : 'divider'}`,
              filter: achievement.unlocked ? 'none' : 'grayscale(0.7)',
              transition: 'filter 0.3s ease',
            }}
          >
            {achievement.unlocked ? achievement.emoji : <LockOutlinedIcon sx={{ fontSize: 24, color: 'text.disabled' }} />}
          </Box>
        </motion.div>

        <Chip
          label={rarity.label}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            height: 20,
            fontSize: '0.62rem',
            fontWeight: 800,
            color: rarity.color,
            borderColor: `${rarity.color}66`,
            bgcolor: `${rarity.color}14`,
          }}
          variant="outlined"
        />

        <Typography variant="subtitle2" fontWeight={800}>
          {achievement.title}
        </Typography>
        {achievement.description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.5, lineHeight: 1.5, minHeight: 30 }}
          >
            {achievement.description}
          </Typography>
        )}

        <Stack direction="row" alignItems="center" justifyContent="center" gap={0.75} sx={{ mt: 1 }}>
          <Typography fontSize="0.8rem" fontWeight={800} color="primary.main">
            +{achievement.points} pts
          </Typography>
          {achievement.unlocked && achievement.unlockedAt && (
            <Typography variant="caption" color="text.disabled">
              · {formatDate(achievement.unlockedAt)}
            </Typography>
          )}
        </Stack>

        {!achievement.unlocked && achievement.total && (
          <Box sx={{ mt: 1.25 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 999,
                '& .MuiLinearProgress-bar': { background: `linear-gradient(90deg, ${rarity.color}, #FBBF24)` },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {achievement.progress ?? 0} / {achievement.total}
            </Typography>
          </Box>
        )}
      </Card>
    </motion.div>
  );
};

export default AchievementCard;
