import { useState } from 'react';
import { Box, Chip, Divider, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import VerifiedIcon from '@mui/icons-material/Verified';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import ReplyOutlinedIcon from '@mui/icons-material/ReplyOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { Avatar, Card } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { StarRating } from './StarRating';
import { REVIEW_DIMENSION_LABELS } from '@/features/reviews/constants';
import { useReportReviewMutation, useReviewVoteMutation } from '@/features/reviews';
import { formatDate, showInfo } from '@/utils';
import type { Review } from '@/types';

interface ReviewCardProps {
  review: Review;
  mentorId: string;
}

/** Premium review card with dimension ratings, helpful votes and reporting. */
export const ReviewCard: React.FC<ReviewCardProps> = ({ review, mentorId }) => {
  const voteMutation = useReviewVoteMutation(mentorId, review.id);
  const reportMutation = useReportReviewMutation();
  const [voted, setVoted] = useState(review.votedByMe ?? false);

  const dimensions = review.dimensionRatings
    ? Object.entries(review.dimensionRatings).filter(([, value]) => typeof value === 'number')
    : [];

  const handleVote = (voteType: 'HELPFUL' | 'NOT_HELPFUL') => {
    voteMutation.mutate(voteType);
    setVoted((current) => !current);
  };

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
                <Tooltip title="Identity hidden by request">
                  <Chip icon={<ShieldOutlinedIcon sx={{ fontSize: 13 }} />} label="Anonymous" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.66rem', fontWeight: 800 }} />
                </Tooltip>
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

            {/* Helpful votes */}
            <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1.5, pt: 1.25, borderTop: 1, borderColor: 'divider' }}>
              <Box
                component="button"
                type="button"
                onClick={() => handleVote('HELPFUL')}
                aria-pressed={review.myVoteType === 'HELPFUL'}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  border: 1,
                  borderColor: review.myVoteType === 'HELPFUL' ? 'success.main' : 'divider',
                  borderRadius: 999,
                  px: 1.25,
                  py: 0.4,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: review.myVoteType === 'HELPFUL' ? 'success.main' : 'text.secondary',
                  bgcolor: review.myVoteType === 'HELPFUL' ? 'action.selected' : 'transparent',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                  '&:hover': { transform: 'scale(1.04)' },
                }}
              >
                <ThumbUpOutlinedIcon sx={{ fontSize: 15 }} />
                Helpful ({review.helpfulCount ?? 0})
              </Box>
              <Box
                component="button"
                type="button"
                onClick={() => handleVote('NOT_HELPFUL')}
                aria-pressed={review.myVoteType === 'NOT_HELPFUL'}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 999,
                  px: 1.25,
                  py: 0.4,
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: 'text.secondary',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease',
                  '&:hover': { transform: 'scale(1.04)' },
                }}
              >
                <ThumbDownOutlinedIcon sx={{ fontSize: 15 }} />
                ({review.notHelpfulCount ?? 0})
              </Box>

              <Tooltip title="Report review">
                <IconButton
                  size="small"
                  onClick={() =>
                    reportMutation.mutate({ reviewId: review.id, reason: 'Inappropriate content' })
                  }
                  aria-label="Report review"
                >
                  <FlagOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Mentor reply">
                <IconButton size="small" onClick={() => showInfo('Reply composer opens for mentors')} aria-label="Reply to review">
                  <ReplyOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              <Box sx={{ flexGrow: 1 }} />
              {voted && (
                <Typography variant="caption" color="success.main" fontWeight={700}>
                  ✓ Thanks for your feedback
                </Typography>
              )}
            </Stack>

            {/* Mentor replies */}
            {review.replies && review.replies.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Divider sx={{ mb: 1.5 }} />
                {review.replies.map((reply) => (
                  <Box key={reply.id} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Avatar name="Mentor" size={28} />
                    <Box
                      sx={{
                        flexGrow: 1,
                        p: 1.25,
                        borderRadius: 2.5,
                        bgcolor: 'action.hover',
                        borderLeft: 3,
                        borderColor: 'primary.main',
                      }}
                    >
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Typography fontSize="0.78rem" fontWeight={800}>
                          Mentor response
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          · {formatDate(reply.createdAt)}
                        </Typography>
                      </Stack>
                      <Typography fontSize="0.84rem" sx={{ mt: 0.25, lineHeight: 1.6 }}>
                        {reply.content}
                      </Typography>
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
