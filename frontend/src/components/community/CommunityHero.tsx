import { Box, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { communityCover } from '@/features/community/constants';
import { formatCompactNumber } from '@/utils';
import type { Community } from '@/types';

interface CommunityHeroProps {
  community: Community;
  joined: boolean;
  onToggleJoin: () => void;
  joining?: boolean;
}

/** Gradient hero banner for community pages with membership and stats. */
export const CommunityHero: React.FC<CommunityHeroProps> = ({
  community,
  joined,
  onToggleJoin,
  joining = false,
}) => {
  const cover = communityCover(community.coverIndex);

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        background: cover,
        color: '#fff',
        boxShadow: (theme) => `0 20px 60px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(109,93,246,0.25)'}`,
      }}
    >
      {/* Decorative orbs */}
      <Box sx={{ position: 'absolute', top: -60, right: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', filter: 'blur(8px)' }} />
      <Box sx={{ position: 'absolute', bottom: -80, left: 80, width: 260, height: 260, borderRadius: '50%', background: 'rgba(0,0,0,0.12)', filter: 'blur(10px)' }} />

      <Box sx={{ position: 'relative', p: { xs: 3, md: 4 } }}>
        <Stack direction="row" alignItems="center" gap={2.5} flexWrap="wrap">
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <Box
              sx={{
                width: { xs: 68, md: 84 },
                height: { xs: 68, md: 84 },
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: { xs: 34, md: 42 },
                background: 'rgba(255,255,255,0.22)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.35)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                flexShrink: 0,
              }}
            >
              {community.emoji}
            </Box>
          </motion.div>

          <Box sx={{ flexGrow: 1, minWidth: 220 }}>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                {community.name}
              </Typography>
              {community.isOfficial && (
                <Chip
                  label="Official"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontWeight: 800, backdropFilter: 'blur(4px)' }}
                />
              )}
            </Stack>
            <Typography sx={{ mt: 0.5, opacity: 0.92, maxWidth: 640, lineHeight: 1.6 }}>
              {community.description}
            </Typography>
            <Stack direction="row" gap={1.5} flexWrap="wrap" sx={{ mt: 1.5 }}>
              <HeroStat icon={<GroupsOutlinedIcon sx={{ fontSize: 15 }} />} label={`${formatCompactNumber(community.memberCount)} members`} />
              <HeroStat icon={<ArticleOutlinedIcon sx={{ fontSize: 15 }} />} label={`${formatCompactNumber(community.postCount)} posts`} />
              <HeroStat icon={<PublicOutlinedIcon sx={{ fontSize: 15 }} />} label={`${formatCompactNumber(community.onlineCount)} online`} />
            </Stack>
          </Box>

          <Stack direction="row" gap={1}>
            <Button
              variant={joined ? 'outlined' : 'contained'}
              onClick={onToggleJoin}
              disabled={joining}
              startIcon={joined ? <GroupsOutlinedIcon /> : <GroupAddOutlinedIcon />}
              sx={{
                bgcolor: joined ? 'rgba(255,255,255,0.9)' : '#fff',
                color: joined ? '#0F172A' : '#6D5DF6',
                fontWeight: 800,
                '&:hover': { bgcolor: joined ? '#fff' : 'rgba(255,255,255,0.92)' },
              }}
            >
              {joined ? 'Joined ✓' : 'Join community'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href).catch(() => undefined);
              }}
              startIcon={<ShareOutlinedIcon />}
              sx={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Share
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

const HeroStat: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <Stack direction="row" alignItems="center" gap={0.5} sx={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.95 }}>
    {icon}
    {label}
  </Stack>
);

export default CommunityHero;
