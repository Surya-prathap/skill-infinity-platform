import { Box, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { Card } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { communityCover } from '@/features/community/constants';
import { formatCompactNumber } from '@/utils';
import type { Community } from '@/types';

interface CommunityCardProps {
  community: Community;
  onOpen?: (community: Community) => void;
  onToggleJoin?: (community: Community) => void;
  joining?: boolean;
}

/** Premium community card with gradient cover, membership and hover lift. */
export const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  onOpen,
  onToggleJoin,
  joining = false,
}) => {
  const cover = communityCover(community.coverIndex);

  const open = () => onOpen?.(community);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      style={{ height: '100%' }}
    >
      <Card
        hoverable
        onClick={open}
        sx={{ height: '100%', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
      >
        {/* Cover strip */}
        <Box
          sx={{
            height: 74,
            background: cover,
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            px: 2,
          }}
        >
          <Box sx={{ position: 'absolute', top: -24, right: -20, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.16)' }} />
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.1 }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                background: 'rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                mb: -3,
                boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {community.emoji}
            </Box>
          </motion.div>
        </Box>

        <Box sx={{ p: 2.25, pt: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ flexGrow: 1 }}>
              {community.name}
            </Typography>
            {community.isOfficial && (
              <Chip label="Official" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800 }} />
            )}
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.75,
              fontSize: '0.82rem',
              lineHeight: 1.55,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flexGrow: 1,
            }}
          >
            {community.description}
          </Typography>

          <Stack direction="row" alignItems="center" gap={1.5} sx={{ mt: 1.25 }}>
            <Stat icon={<GroupsOutlinedIcon sx={{ fontSize: 15 }} />} label={formatCompactNumber(community.memberCount)} />
            <Stat icon={<ArticleOutlinedIcon sx={{ fontSize: 15 }} />} label={formatCompactNumber(community.postCount)} />
            <Chip
              size="small"
              label={community.category}
              variant="outlined"
              sx={{ ml: 'auto', height: 22, fontSize: '0.68rem', fontWeight: 700, color: 'primary.main' }}
            />
          </Stack>

          <Button
            fullWidth
            size="small"
            variant={community.joined ? 'outlined' : 'contained'}
            disabled={joining}
            onClick={(event) => {
              event.stopPropagation();
              onToggleJoin?.(community);
            }}
            sx={{ mt: 1.5, fontWeight: 800 }}
          >
            {community.joined ? 'Joined ✓' : 'Join'}
          </Button>
        </Box>
      </Card>
    </motion.div>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: 'text.secondary', fontSize: '0.78rem', fontWeight: 700 }}>
    {icon}
    {label}
  </Stack>
);

export default CommunityCard;
