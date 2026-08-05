import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import BookmarkBorderOutlinedIcon from '@mui/icons-material/BookmarkBorderOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { Typography } from '@/components/ui/Typography';
import { formatRelativeTime } from '@/utils';
import type { ActivityItem as ActivityItemType } from '@/types';

interface ActivityCardProps {
  item: ActivityItemType;
  index?: number;
}

const TYPE_STYLE: Record<string, { icon: React.ReactNode; color: string }> = {
  SESSION_COMPLETED: { icon: <EventAvailableOutlinedIcon sx={{ fontSize: 18 }} />, color: '#10B981' },
  ACHIEVEMENT: { icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 18 }} />, color: '#F59E0B' },
  CERTIFICATE: { icon: <WorkspacePremiumOutlinedIcon sx={{ fontSize: 18 }} />, color: '#8B5CF6' },
  POST: { icon: <ForumOutlinedIcon sx={{ fontSize: 18 }} />, color: '#6D5DF6' },
  COMMENT: { icon: <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 18 }} />, color: '#3B82F6' },
  REVIEW: { icon: <StarBorderIcon sx={{ fontSize: 18 }} />, color: '#EC4899' },
  BOOKMARK: { icon: <BookmarkBorderOutlinedIcon sx={{ fontSize: 18 }} />, color: '#14B8A6' },
  MILESTONE: { icon: <FlagOutlinedIcon sx={{ fontSize: 18 }} />, color: '#F43F5E' },
};

/** Premium timeline activity item. */
export const ActivityCard: React.FC<ActivityCardProps> = ({ item, index = 0 }) => {
  const navigate = useNavigate();
  const style = TYPE_STYLE[item.type] ?? TYPE_STYLE.MILESTONE;

  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.5), duration: 0.3 }}
    >
      <Box
        role={item.link ? 'button' : undefined}
        tabIndex={item.link ? 0 : undefined}
        onClick={() => item.link && navigate(item.link)}
        onKeyDown={(event) => {
          if (item.link && (event.key === 'Enter' || event.key === ' ')) navigate(item.link);
        }}
        sx={{
          display: 'flex',
          gap: 1.5,
          p: 1.5,
          borderRadius: 2.5,
          cursor: item.link ? 'pointer' : 'default',
          transition: 'background-color 0.15s ease, transform 0.15s ease',
          '&:hover': item.link ? { bgcolor: 'action.hover', transform: 'translateX(4px)' } : undefined,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            background: `linear-gradient(135deg, ${style.color}, ${style.color}99)`,
            boxShadow: `0 6px 16px ${style.color}40`,
            flexShrink: 0,
          }}
        >
          {style.icon}
        </Box>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: '0.88rem' }}>
            {item.title}
          </Typography>
          {item.description && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, lineHeight: 1.5 }}>
              {item.description}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            {item.points !== undefined && (
              <Box
                component="span"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: 'primary.main',
                  px: 0.75,
                  py: 0.1,
                  borderRadius: 999,
                  bgcolor: 'action.selected',
                }}
              >
                +{item.points} pts
              </Box>
            )}
            {item.meta && (
              <Typography variant="caption" color="text.disabled">
                {item.meta}
              </Typography>
            )}
            <Box sx={{ flexGrow: 1 }} />
            <Typography variant="caption" color="text.disabled">
              {formatRelativeTime(item.createdAt)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default ActivityCard;
