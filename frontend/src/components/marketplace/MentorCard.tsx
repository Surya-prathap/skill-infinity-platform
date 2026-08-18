import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Stack } from '@/components/ui/Stack';
import { Avatar } from '@/components/ui/Avatar';
import { formatCompactNumber } from '@/utils';
import { ROUTES } from '@/constants';
import type { Mentor, MentorSummary } from '@/types';

export interface MarketplaceMentorCardProps {
  mentor: Mentor | MentorSummary;
  /** Full mentor profile (enables pricing/price display). */
  detail?: Mentor;
  saved?: boolean;
  onToggleSave?: () => void;
  index?: number;
}

const sessionTypeLabel = (type?: string): string => {
  if (!type) return '1:1 Mentoring';
  const map: Record<string, string> = {
    ONE_ON_ONE: '1:1 Mentoring',
    GROUP_SESSION: 'Group Session',
    INTERVIEW_PREP: 'Interview Prep',
    CODE_REVIEW: 'Code Review',
    RESUME_REVIEW: 'Resume Review',
    CAREER_COACHING: 'Career Coaching',
    PROJECT_SUPPORT: 'Project Support',
  };
  return map[type] ?? type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

export const MarketplaceMentorCard: React.FC<MarketplaceMentorCardProps> = ({
  mentor,
  detail,
  saved = false,
  onToggleSave,
  index = 0,
}) => {
  const navigate = useNavigate();
  const id = mentor.id;
  const summary = mentor as MentorSummary;
  const full = detail ?? (mentor as Mentor);
  const headline = summary.headline ?? full.profile?.headline ?? 'Mentor';
  const profile = full.profile;
  const stats = full.statistics;
  const verified = 'verified' in mentor ? mentor.verified : full.verified;
  const skills = (full.expertiseList ?? []).slice(0, 3);
  const price = full.pricingList?.[0]?.price;
  const priceType = full.pricingList?.[0]?.sessionType;
  const name = profile?.headline?.split('·')[0]?.trim() || 'Mentor';
  const [firstName, lastName] = name.split(' ');

  const openProfile = () => navigate(ROUTES.MENTOR_DETAILS.replace(':mentorId', id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3), ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      style={{ height: '100%' }}
    >
      <Card
        hoverable
        sx={{ height: '100%', position: 'relative', overflow: 'visible', display: 'flex', flexDirection: 'column' }}
      >
        {/* Cover strip */}
        <Box
          sx={{
            height: 92,
            borderRadius: '16px 16px 0 0',
            background: 'linear-gradient(120deg, #6D5DF6 0%, #43C6C0 130%)',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <Box className="dot-grid" sx={{ position: 'absolute', inset: 0, opacity: 0.22 }} />
          {verified && (
            <Chip
              size="small"
              icon={<VerifiedIcon sx={{ fontSize: 13 }} />}
              label="Verified"
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                bgcolor: 'rgba(255,255,255,0.92)',
                color: '#059669',
                fontWeight: 700,
                height: 24,
              }}
            />
          )}
          <IconButton
            aria-label={saved ? 'Remove from saved mentors' : 'Save mentor'}
            onClick={(event) => {
              event.stopPropagation();
              onToggleSave?.();
            }}
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              bgcolor: 'rgba(255,255,255,0.85)',
              '&:hover': { bgcolor: '#fff' },
            }}
            size="small"
          >
            {saved ? <FavoriteIcon sx={{ fontSize: 18, color: '#EF4444' }} /> : <FavoriteBorderIcon sx={{ fontSize: 18, color: 'text.secondary' }} />}
          </IconButton>
        </Box>

        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {/* Avatar row */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, mt: -6, mb: 1.5 }}>
            <Box
              sx={{
                p: 0.5,
                borderRadius: '50%',
                background: (theme) => theme.palette.background.paper,
                boxShadow: '0 6px 18px rgba(15,23,42,0.18)',
                cursor: 'pointer',
              }}
              onClick={openProfile}
            >
              <Avatar
                firstName={firstName}
                lastName={lastName}
                name={name}
                src={profile?.profilePictureUrl}
                size={60}
              />
            </Box>
            <Tooltip title={verified ? 'Verified mentor' : 'Not yet verified'}>
              <Box sx={{ pb: 0.5 }}>
                <Typography variant="caption" color={verified ? 'success.main' : 'text.secondary'} fontWeight={700}>
                  {verified ? 'Verified' : 'Verification pending'}
                </Typography>
              </Box>
            </Tooltip>
          </Box>

          <Typography variant="subtitle1" fontWeight={800} sx={{ cursor: 'pointer' }} onClick={openProfile}>
            {name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ mb: 1 }}>
            {headline}
          </Typography>

          {/* Location */}
          {(profile?.city || profile?.country) && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              <LocationOnOutlinedIcon sx={{ fontSize: 13, verticalAlign: 'middle', mr: 0.25 }} />
              {[profile.city, profile.country].filter(Boolean).join(', ')}
            </Typography>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 1.5 }}>
              {skills.map((skill) => (
                <Chip
                  key={skill.id ?? skill.skillName}
                  size="small"
                  label={skill.skillName ?? skill.customSkillName}
                  sx={{ bgcolor: 'action.selected', color: 'primary.main', fontWeight: 600, height: 24 }}
                />
              ))}
            </Stack>
          )}

          {/* Stats */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 'auto',
              pt: 1.5,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: '#F59E0B' }}>
              <StarIcon sx={{ fontSize: 17 }} />
              <Typography variant="subtitle2" fontWeight={800}>
                {(summary.averageRating || stats?.averageRating || 0).toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({formatCompactNumber(summary.totalReviews || stats?.totalReviews || 0)})
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: 'text.secondary' }}>
              <SchoolOutlinedIcon sx={{ fontSize: 15 }} />
              <Typography variant="caption" fontWeight={600}>
                {formatCompactNumber(summary.totalStudents || stats?.totalStudents || 0)}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: 'text.secondary' }}>
              <EventAvailableOutlinedIcon sx={{ fontSize: 15 }} />
              <Typography variant="caption" fontWeight={600}>
                {formatCompactNumber(summary.totalSessions || stats?.totalSessions || 0)}
              </Typography>
            </Stack>
          </Box>

          {/* Price + CTA */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
            <Box>
              {price !== undefined && (
                <Typography variant="h6" fontWeight={800} sx={{ color: 'primary.main' }}>
                  {price} credits
                  <Typography component="span" variant="caption" color="text.secondary" fontWeight={500}>
                    {' '}/ {sessionTypeLabel(priceType)}
                  </Typography>
                </Typography>
              )}
            </Box>
            <Box
              component="button"
              onClick={openProfile}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter') openProfile();
              }}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                py: 1,
                px: 2,
                borderRadius: 2,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.82rem',
                color: '#fff',
                background: 'linear-gradient(135deg, #6D5DF6, #5443D4)',
                boxShadow: '0 6px 16px rgba(109,93,246,0.3)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 24px rgba(109,93,246,0.4)' },
                '&:focus-visible': { outline: '3px solid rgba(109,93,246,0.4)', outlineOffset: 2 },
              }}
            >
              Book
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>
        </Box>
      </Card>
    </motion.div>
  );
};

export default MarketplaceMentorCard;
