import type { ReactNode } from 'react';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import MilitaryTechOutlinedIcon from '@mui/icons-material/MilitaryTechOutlined';
import TrackChangesOutlinedIcon from '@mui/icons-material/TrackChangesOutlined';
import LocalFireDepartmentOutlinedIcon from '@mui/icons-material/LocalFireDepartmentOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Card } from '@/components/ui/Card';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { formatDate } from '@/utils';
import type { MentorAchievement } from '@/types';

interface AchievementCardProps {
  achievement: MentorAchievement;
  featured?: boolean;
  onToggleFeatured?: (achievement: MentorAchievement) => void;
  onEdit?: (achievement: MentorAchievement) => void;
  onDelete?: (achievement: MentorAchievement) => void;
}

const TYPE_META: Record<string, { label: string; icon: ReactNode; color: string }> = {
  BADGE: { label: 'Badge', icon: <MilitaryTechOutlinedIcon />, color: '#8B5CF6' },
  AWARD: { label: 'Award', icon: <EmojiEventsOutlinedIcon />, color: '#F59E0B' },
  MILESTONE: { label: 'Milestone', icon: <TrackChangesOutlinedIcon />, color: '#10B981' },
  HIGHLIGHT: { label: 'Highlight', icon: <LocalFireDepartmentOutlinedIcon />, color: '#EC4899' },
};

const typeMeta = (type?: string) => TYPE_META[type ?? ''] ?? TYPE_META.AWARD;

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  featured = false,
  onToggleFeatured,
  onEdit,
  onDelete,
}) => {
  const meta = typeMeta(achievement.type);

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      style={{ height: '100%' }}
    >
      <Card
        hoverable
        sx={{
          height: '100%',
          p: 2.5,
          position: 'relative',
          overflow: 'hidden',
          ...(featured && {
            border: '1.5px solid rgba(245,158,11,0.6)',
            boxShadow: '0 12px 36px rgba(245,158,11,0.16)',
          }),
        }}
      >
        {featured && (
          <Chip
            size="small"
            label="Featured"
            icon={<StarOutlinedIcon sx={{ fontSize: 14 }} />}
            sx={{
              position: 'absolute',
              top: 14,
              right: 14,
              height: 24,
              fontWeight: 800,
              color: '#fff',
              background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
            }}
          />
        )}

        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              background: `linear-gradient(135deg, ${meta.color}, ${meta.color}AA)`,
              boxShadow: `0 8px 20px ${meta.color}40`,
              flexShrink: 0,
            }}
          >
            {meta.icon}
          </Box>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={800} noWrap>
              {achievement.title}
            </Typography>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.25 }}>
              <Chip
                size="small"
                label={meta.label}
                sx={{
                  height: 20,
                  fontWeight: 700,
                  bgcolor: 'action.selected',
                  color: 'primary.main',
                }}
              />
              {achievement.dateAchieved && (
                <Typography variant="caption" color="text.secondary">
                  {formatDate(achievement.dateAchieved)}
                </Typography>
              )}
            </Stack>
          </Box>
        </Stack>

        {achievement.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1.5,
              lineHeight: 1.6,
              flexGrow: 1,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {achievement.description}
          </Typography>
        )}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            noWrap
            sx={{ maxWidth: 200 }}
          >
            {achievement.issuer ? `Issued by ${achievement.issuer}` : 'Personal achievement'}
          </Typography>
          <Stack direction="row" gap={0.5} sx={{ flexShrink: 0 }}>
            {onToggleFeatured && (
              <Tooltip title={featured ? 'Remove from featured' : 'Feature this achievement'}>
                <IconButton
                  size="small"
                  aria-label={featured ? 'Unfeature achievement' : 'Feature achievement'}
                  onClick={() => onToggleFeatured(achievement)}
                  sx={{ color: featured ? '#F59E0B' : 'text.secondary' }}
                >
                  <StarOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip title="Edit achievement">
                <IconButton
                  size="small"
                  onClick={() => onEdit(achievement)}
                  aria-label={`Edit ${achievement.title}`}
                >
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Delete achievement">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onDelete(achievement)}
                  aria-label={`Delete ${achievement.title}`}
                >
                  <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Card>
    </motion.div>
  );
};

export default AchievementCard;
