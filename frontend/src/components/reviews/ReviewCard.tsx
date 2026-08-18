import { Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { Avatar, Card } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { StarRating } from './StarRating';
import { REVIEW_DIMENSION_LABELS } from '@/features/reviews/constants';
import { formatDate } from '@/utils';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
}

/** Review card showing the rating, comment and verification badge. */
export const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const dimensions = review.dimensionRatings
    ? Object.entries(review.dimensionRatings).filter(([, value]) => typeof value === 'number')
    : [];

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card sx={{ p: { xs: 2, md: 2.5 }, transition: 'box-shadow 0.2s ease, transform 0.2s ease', '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' } }}>
        <Stack direction="row" alignItems="flex-start" gap={1.5}>
          <Avatar name={review.learnerName ?? 'Anonymous'} size={40} />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
              <Typography variant="subtitle2" fontWeight={800}>
                {review.anonymous || !review.learnerName ? 'Anonymous learner' : review.learnerName}
              </Typography>
              {review.anonymous && (
                <Chip icon={<ShieldOutlinedIcon sx={{ fontSize: 13 }} />} label="Anonymous" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800 }} />
              )}
              {review.verified && (
                <Chip
                  icon={<VerifiedIcon sx={{ fontSize: 13 }} />}
                  label="Verified session"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800 }}
                />
              )}
              <Box sx={{ flexGrow: 1 }} />
              <StarRating value={review.rating} size={17} readOnly />
            </Stack>

            <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                {review.title ?? 'Review'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                · {formatDate(review.createdAt)}
              </Typography>
            </Stack>

            {review.content && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.7 }}>
                “{review.content}”
              </Typography>
            )}

            {/* Dimension ratings */}
            {dimensions.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1.25 }}>
                {dimensions.map(([key, value]) => (
                  <Box
                    key={key}
                    sx={{
                      px: 1.25,
                      py: 0.5,
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                    }}
                  >
                    <Typography fontSize="0.72rem" fontWeight={700} color="text.secondary">
                      {REVIEW_DIMENSION_LABELS[key] ?? key}
                    </Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', color: '#F59E0B' }}>
                      <StarRating value={value as number} size={13} readOnly />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Stack>
      </Card>
    </motion.div>
  );
};

export default ReviewCard;
