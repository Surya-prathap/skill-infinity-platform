import { motion } from 'framer-motion';
import { Box, Tooltip } from '@mui/material';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { LikeBurst } from './LikeBurst';

interface ReactionBarProps {
  likeCount: number;
  commentCount?: number;
  bookmarkCount?: number;
  liked: boolean;
  bookmarked?: boolean;
  onLike?: (liked: boolean) => void;
  onComment?: () => void;
  onBookmark?: (bookmarked: boolean) => void;
  onShare?: () => void;
  compact?: boolean;
}

interface ReactionButtonProps {
  label: string;
  onClick?: () => void;
  active?: boolean;
  activeColor?: string;
  children: React.ReactNode;
}

const ReactionButton: React.FC<ReactionButtonProps> = ({
  label,
  onClick,
  active = false,
  activeColor = 'primary.main',
  children,
}) => (
  <Tooltip title={label} arrow>
    <Box
      component="button"
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        border: 'none',
        background: 'transparent',
        borderRadius: 2,
        px: 1.25,
        py: 0.75,
        cursor: onClick ? 'pointer' : 'default',
        color: active ? activeColor : 'text.secondary',
        fontWeight: 700,
        fontSize: '0.82rem',
        transition: 'background-color 0.15s ease, transform 0.15s ease, color 0.15s ease',
        '&:hover': {
          bgcolor: 'action.hover',
          transform: 'translateY(-1px)',
        },
        '&:active': { transform: 'scale(0.94)' },
      }}
    >
      {children}
    </Box>
  </Tooltip>
);

/** Premium reaction bar — like with burst animation, comment, bookmark, share. */
export const ReactionBar: React.FC<ReactionBarProps> = ({
  likeCount,
  commentCount = 0,
  bookmarkCount = 0,
  liked,
  bookmarked = false,
  onLike,
  onComment,
  onBookmark,
  onShare,
  compact = false,
}) => {
  const handleLike = () => {
    onLike?.(!liked);
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        pt: 1.25,
        mt: 1.25,
        borderTop: 1,
        borderColor: 'divider',
        flexWrap: 'wrap',
        gap: compact ? 0 : 0.5,
      }}
    >
      <motion.div whileTap={liked ? { scale: 1.15 } : { scale: 0.9 }} style={{ display: 'inline-flex' }}>
        <ReactionButton
          label={liked ? 'Unlike' : 'Like'}
          onClick={onLike ? handleLike : undefined}
          active={liked}
          activeColor="#F43F5E"
        >
          <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              {liked ? (
                <ThumbUpAltIcon sx={{ fontSize: compact ? 16 : 18 }} />
              ) : (
                <ThumbUpOffAltIcon sx={{ fontSize: compact ? 16 : 18 }} />
              )}
              <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <LikeBurst active={liked} size={compact ? 16 : 18} />
              </Box>
            </Box>
          </Box>
          <AnimatedCount count={likeCount} />
        </ReactionButton>
      </motion.div>

      <ReactionButton label="Comment" onClick={onComment} activeColor="primary.main">
        <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: compact ? 16 : 18 }} />
        <AnimatedCount count={commentCount} />
      </ReactionButton>

      <ReactionButton
        label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
        onClick={onBookmark ? () => onBookmark(!bookmarked) : undefined}
        active={bookmarked}
        activeColor="#F59E0B"
      >
        {bookmarked ? (
          <BookmarkIcon sx={{ fontSize: compact ? 16 : 18 }} />
        ) : (
          <BookmarkBorderIcon sx={{ fontSize: compact ? 16 : 18 }} />
        )}
        {!compact && <AnimatedCount count={bookmarkCount} />}
      </ReactionButton>

      <Box sx={{ flexGrow: 1 }} />
      <ReactionButton label="Share" onClick={onShare} activeColor="secondary.main">
        <ShareOutlinedIcon sx={{ fontSize: compact ? 16 : 18 }} />
      </ReactionButton>
    </Stack>
  );
};

const AnimatedCount: React.FC<{ count: number }> = ({ count }) => (
  <Box component="span" sx={{ minWidth: 14, textAlign: 'center' }}>
    {count > 0 ? (
      <motion.span
        key={count}
        initial={{ scale: 0.6, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        style={{ display: 'inline-block' }}
      >
        {count.toLocaleString('en-US')}
      </motion.span>
    ) : (
      <Typography component="span" fontSize="0.82rem">
        0
      </Typography>
    )}
  </Box>
);

export default ReactionBar;
