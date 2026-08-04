import { Box, Chip, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import { Typography } from '@/components/ui/Typography';
import { gradients } from '@/theme';
import { formatRelativeTime } from '@/utils';
import type { Announcement, AnnouncementCategory } from '@/types';

interface AnnouncementCardProps {
  announcement: Announcement;
  featured?: boolean;
  onOpen?: (announcement: Announcement) => void;
}

const CATEGORY_META: Record<AnnouncementCategory, { label: string; color: string; emoji: string }> = {
  SYSTEM: { label: 'System', color: '#3B82F6', emoji: '⚙️' },
  MAINTENANCE: { label: 'Maintenance', color: '#F59E0B', emoji: '🔧' },
  PLATFORM: { label: 'Platform', color: '#6D5DF6', emoji: '✨' },
  PROMOTION: { label: 'Promotion', color: '#EF4444', emoji: '🏷️' },
  EVENT: { label: 'Event', color: '#10B981', emoji: '🎤' },
};

/** Premium announcement card — category chip, pinned ribbon, hover lift. */
export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, featured = false, onOpen }) => {
  const meta = CATEGORY_META[announcement.category] ?? CATEGORY_META.SYSTEM;

  const body = (
    <Box
      onClick={() => onOpen?.(announcement)}
      sx={{
        position: 'relative',
        p: 2.5,
        borderRadius: 4,
        cursor: onOpen ? 'pointer' : 'default',
        overflow: 'hidden',
        border: 1,
        borderColor: 'divider',
        background: featured
          ? (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(109,93,246,0.2), rgba(67,198,192,0.08))'
                : 'linear-gradient(135deg, rgba(109,93,246,0.1), rgba(67,198,192,0.05))'
          : 'background.paper',
        transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
        '&:hover': onOpen
          ? {
              transform: 'translateY(-3px)',
              boxShadow: (theme) => theme.shadows[6] as string,
              borderColor: 'primary.main',
            }
          : {},
      }}
    >
      {featured && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            px: 1.25,
            py: 0.5,
            borderBottomLeftRadius: 12,
            background: gradients.brand,
            color: '#fff',
            fontSize: '0.66rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Featured
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Chip
          label={`${meta.emoji} ${meta.label}`}
          size="small"
          sx={{
            height: 24,
            fontSize: '0.7rem',
            fontWeight: 700,
            color: meta.color,
            background: `${meta.color}1A`,
            border: `1px solid ${meta.color}40`,
          }}
        />
        {announcement.pinned && (
          <Chip
            icon={<PushPinOutlinedIcon sx={{ fontSize: 13 }} />}
            label="Pinned"
            size="small"
            variant="outlined"
            sx={{ height: 24, fontSize: '0.7rem', fontWeight: 700 }}
          />
        )}
        <Box sx={{ flexGrow: 1 }} />
        <IconButton size="small" aria-label="More announcement options" sx={{ width: 26, height: 26 }}>
          <MoreHorizOutlinedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 0.75 }}>
        {announcement.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
        {announcement.body}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
        <Typography variant="caption" fontWeight={600}>
          {announcement.author}
        </Typography>
        <Box component="span" sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
        <Typography variant="caption" color="text.disabled">
          {formatRelativeTime(announcement.publishedAt)}
        </Typography>
      </Box>
    </Box>
  );

  return featured ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
    >
      {body}
    </motion.div>
  ) : (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
    >
      {body}
    </motion.div>
  );
};

export default AnnouncementCard;
