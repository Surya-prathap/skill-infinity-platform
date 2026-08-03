import { Box, Chip } from '@mui/material';
import { Stack } from '@/components/ui/Stack';
import { motion } from 'framer-motion';
import StarIcon from '@mui/icons-material/Star';
import VerifiedIcon from '@mui/icons-material/Verified';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Avatar } from '@/components/ui/Avatar';
import { formatCompactNumber } from '@/utils';
import type { Mentor } from '@/types';

interface MentorCardProps {
  mentor: Mentor;
  /** Display name (e.g. from the user profile) — falls back to headline initials. */
  name?: string;
  featured?: boolean;
  onAction?: () => void;
  actionLabel?: string;
}

const sessionTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    ONE_ON_ONE: '1:1 Mentoring',
    GROUP_SESSION: 'Group Session',
    INTERVIEW_PREP: 'Interview Prep',
    CODE_REVIEW: 'Code Review',
    RESUME_REVIEW: 'Resume Review',
    PORTFOLIO_REVIEW: 'Portfolio Review',
    CAREER_COACHING: 'Career Coaching',
    PROJECT_SUPPORT: 'Project Support',
  };
  return map[type] ?? type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
};

export const MentorCard: React.FC<MentorCardProps> = ({
  mentor,
  name,
  featured = false,
  onAction,
  actionLabel = 'View Profile',
}) => {
  const profile = mentor.profile;
  const stats = mentor.statistics;
  const expertise = (mentor.expertiseList ?? []).slice(0, 3);
  const [firstName, lastName] = name?.split(' ') ?? ['', ''];

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      style={{ height: '100%' }}
    >
      <Card
        hoverable
        sx={{
          height: '100%',
          overflow: 'visible',
          position: 'relative',
          ...(featured && {
            border: '1.5px solid rgba(109,93,246,0.5)',
            boxShadow: '0 12px 36px rgba(109,93,246,0.18)',
          }),
        }}
      >
        {/* Cover strip */}
        <Box
          sx={{
            height: 88,
            borderRadius: '16px 16px 0 0',
            background: 'linear-gradient(120deg, #6D5DF6 0%, #43C6C0 120%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            className="dot-grid"
            sx={{ position: 'absolute', inset: 0, opacity: 0.25 }}
          />
          {mentor.verified && (
            <Chip
              size="small"
              icon={<VerifiedIcon sx={{ fontSize: 14 }} />}
              label="Verified"
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                bgcolor: 'rgba(255,255,255,0.92)',
                color: '#059669',
                fontWeight: 700,
              }}
            />
          )}
        </Box>

        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 2, mt: -6 }}>
            <Box
              sx={{
                p: 0.5,
                borderRadius: '50%',
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.background.paper})`,
                boxShadow: '0 6px 18px rgba(15,23,42,0.18)',
              }}
            >
              <Avatar name={`${firstName} ${lastName}`.trim() || profile?.headline || 'M'} size={64} />
            </Box>
            <Box sx={{ flexGrow: 1, pb: 0.25, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="h6" fontWeight={800} noWrap>
                  {name || profile?.headline || 'Your Mentor Profile'}
                </Typography>
              </Stack>
              {(profile?.city || profile?.country) && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  <LocationOnOutlinedIcon sx={{ fontSize: 13, verticalAlign: 'middle', mr: 0.25 }} />
                  {[profile.city, profile.country].filter(Boolean).join(', ')}
                </Typography>
              )}
            </Box>
          </Box>

          {profile?.aboutMe && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1.5, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            >
              {profile.aboutMe}
            </Typography>
          )}

          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.5 }}>
            {expertise.map((item) => (
              <Chip
                key={item.id ?? item.skillName}
                size="small"
                label={item.skillName ?? item.customSkillName}
                sx={{ bgcolor: 'action.selected', color: 'primary.main', fontWeight: 600 }}
              />
            ))}
            {expertise.length === 0 && (
              <Chip size="small" label="Expertise pending" sx={{ bgcolor: 'action.hover', fontWeight: 600 }} />
            )}
          </Stack>

          {/* Stats row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 2,
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: '#F59E0B' }}>
              <StarIcon sx={{ fontSize: 18 }} />
              <Typography variant="subtitle1" fontWeight={800}>
                {stats?.averageRating ? stats.averageRating.toFixed(1) : '—'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({formatCompactNumber(stats?.totalReviews ?? 0)} reviews)
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: 'text.secondary' }}>
              <SchoolOutlinedIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" fontWeight={600}>
                {formatCompactNumber(stats?.totalStudents ?? 0)} students
              </Typography>
            </Stack>
          </Box>

          {mentor.pricingList && mentor.pricingList.length > 0 && (
            <Box sx={{ mt: 1.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                From{' '}
                <Box component="span" sx={{ color: 'primary.main', fontWeight: 800, fontSize: '0.95rem' }}>
                  {mentor.pricingList[0].currency ?? 'USD'} {mentor.pricingList[0].price}
                </Box>{' '}
                · {sessionTypeLabel(mentor.pricingList[0].sessionType)}
              </Typography>
            </Box>
          )}

          {onAction && (
            <Box
              component="button"
              onClick={onAction}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && onAction) onAction();
              }}
              sx={{
                mt: 2,
                width: '100%',
                py: 1.25,
                borderRadius: 2,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#fff',
                background: 'linear-gradient(135deg, #6D5DF6, #5443D4)',
                boxShadow: '0 6px 16px rgba(109,93,246,0.3)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 24px rgba(109,93,246,0.4)' },
                '&:active': { transform: 'translateY(0)' },
                '&:focus-visible': { outline: '3px solid rgba(109,93,246,0.4)', outlineOffset: 2 },
              }}
            >
              {actionLabel}
            </Box>
          )}
        </Box>
      </Card>
    </motion.div>
  );
};

export default MentorCard;
