import { Box, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { Avatar } from '@/components/ui/Avatar';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { formatCompactNumber } from '@/utils';
import { ROUTES } from '@/constants';
import type { Mentor } from '@/types';

interface MentorHeroProps {
  mentor: Mentor;
  name?: string;
}

const StatPill: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({
  icon,
  value,
  label,
}) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 1.75,
      py: 1,
      borderRadius: 2.5,
      bgcolor: 'rgba(255,255,255,0.14)',
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.18)',
    }}
  >
    <Box sx={{ color: '#5EEAD4', display: 'flex' }}>{icon}</Box>
    <Box>
      <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.85, lineHeight: 1.1 }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

export const MentorHero: React.FC<MentorHeroProps> = ({ mentor, name }) => {
  const navigate = useNavigate();
  const profile = mentor.profile;
  const stats = mentor.statistics;
  const pricing = mentor.pricingList?.[0];
  const [firstName, lastName] = (name ?? profile?.headline ?? 'Mentor').split(' ');
  const headline = profile?.headline ?? 'Mentor';

  return (
    <Box
      sx={{
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        background: 'linear-gradient(130deg, #4F46E5 0%, #7C3AED 50%, #0EA5E9 125%)',
      }}
    >
      <Box className="dot-grid" sx={{ position: 'absolute', inset: 0, opacity: 0.18, pointerEvents: 'none' }} />
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -24, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', top: -160, right: '8%', background: 'radial-gradient(circle, rgba(255,255,255,0.22), transparent 70%)', pointerEvents: 'none', willChange: 'transform' }}
      />

      <Box sx={{ position: 'relative', p: { xs: 3, md: 4.5 } }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ alignItems: { xs: 'flex-start', md: 'center' } }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <Avatar
              firstName={firstName}
              lastName={lastName}
              name={name}
              src={profile?.profilePictureUrl}
              size={112}
              sx={{ fontSize: 40, border: '3px solid rgba(255,255,255,0.6)' }}
            />
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap" sx={{ mb: 0.75 }}>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                {name ?? headline}
              </Typography>
              {mentor.verified && (
                <Chip
                  size="small"
                  icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
                  label="Verified"
                  sx={{ bgcolor: 'rgba(255,255,255,0.92)', color: '#059669', fontWeight: 700 }}
                />
              )}
            </Stack>
            <Typography variant="subtitle1" sx={{ opacity: 0.92, mb: 1 }}>
              {headline}
            </Typography>
            <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
              <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: '#FCD34D' }}>
                <StarIcon sx={{ fontSize: 18 }} />
                <Typography variant="subtitle2" fontWeight={800}>
                  {(stats?.averageRating ?? 0).toFixed(1)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>
                  ({formatCompactNumber(stats?.totalReviews ?? 0)} reviews)
                </Typography>
              </Stack>
              {(profile?.city || profile?.country) && (
                <Stack direction="row" alignItems="center" gap={0.5} sx={{ opacity: 0.9 }}>
                  <LocationOnOutlinedIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption" fontWeight={600}>
                    {[profile.city, profile.country].filter(Boolean).join(', ')}
                  </Typography>
                </Stack>
              )}
              {profile?.timezone && (
                <Stack direction="row" alignItems="center" gap={0.5} sx={{ opacity: 0.9 }}>
                  <ScheduleOutlinedIcon sx={{ fontSize: 16 }} />
                  <Typography variant="caption" fontWeight={600}>
                    {profile.timezone}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>

          {pricing && (
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>

              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Sessions from
              </Typography>
              <Typography variant="h4" fontWeight={800}>
                {pricing.price} credits
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate(ROUTES.BOOK_SESSION.replace(':mentorId', mentor.id))}
                startIcon={<EventAvailableOutlinedIcon />}
                sx={{
                  mt: 1,
                  bgcolor: '#fff',
                  color: '#5443D4',
                  fontWeight: 800,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
                }}
              >
                Book a session
              </Button>
            </Box>
          )}
        </Stack>

        <Stack direction="row" gap={1.5} flexWrap="wrap" sx={{ mt: 3 }}>
          <StatPill icon={<WorkspacePremiumOutlinedIcon />} value={`${profile?.yearsOfExperience ?? 0}+ yrs`} label="Experience" />
          <StatPill icon={<EventAvailableOutlinedIcon />} value={formatCompactNumber(stats?.totalSessions ?? 0)} label="Sessions" />
          <StatPill icon={<GroupsOutlinedIcon />} value={formatCompactNumber(stats?.totalStudents ?? 0)} label="Students" />
          <StatPill icon={<StarIcon />} value={`${stats?.responseRate ?? 0}%`} label="Response rate" />
        </Stack>
      </Box>
    </Box>
  );
};

export default MentorHero;
