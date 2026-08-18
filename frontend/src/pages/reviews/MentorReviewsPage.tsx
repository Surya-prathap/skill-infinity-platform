import { useState } from 'react';
import { Box, Button, Chip, Grid, Skeleton } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import { PageHeader } from '@/components/common';
import { RatingDistribution, ReviewCard, StarRating, ReviewComposerModal } from '@/components/reviews';
import { EmptyState, ErrorState } from '@/components/feedback';
import { Card } from '@/components/ui';
import { Stack } from '@/components/ui/Stack';
import { Typography } from '@/components/ui/Typography';
import { useDocumentTitle } from '@/hooks';
import { useMentorProfile } from '@/features/marketplace';
import { useMentorRatingSummaryQuery, useMentorReviewsQuery } from '@/features/reviews';
import { formatCompactNumber } from '@/utils';
import { ROUTES } from '@/constants';
import type { Review } from '@/types';

type ReviewSort = 'RECENT' | 'HELPFUL' | 'RATING';

export const MentorReviewsPage: React.FC = () => {
  const { mentorId } = useParams<{ mentorId: string }>();
  const navigate = useNavigate();
  const { mentor, isOffline: mentorOffline } = useMentorProfile(mentorId);
  const { breakdown, stats } = useMentorRatingSummaryQuery(mentorId);
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined);
  const [sort, setSort] = useState<ReviewSort>('RECENT');
  const { reviews, isLoading } = useMentorReviewsQuery(mentorId, ratingFilter, sort);
  const [composerOpen, setComposerOpen] = useState(false);

  useDocumentTitle(`Reviews · ${mentor?.profile?.headline ?? 'Mentor'}`);

  const mentorName = mentor?.profile?.headline?.split('·')[0]?.trim() ?? 'Mentor';

  if (mentorOffline && !mentor) {
    return (
      <ErrorState
        title="Mentor not found"
        message="We couldn't load this mentor's reviews."
        actionLabel="Back to mentors"
        onAction={() => navigate(ROUTES.MENTORS)}
      />
    );
  }

  const sortBy = (key: ReviewSort) => {
    setSort(key);
  };

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <PageHeader
        title={mentor ? `Reviews for ${mentorName}` : 'Reviews'}
        subtitle="Honest feedback from verified sessions with this mentor."
        actions={
          <Button variant="contained" startIcon={<RateReviewOutlinedIcon />} onClick={() => setComposerOpen(true)}>
            Write a review
          </Button>
        }
      />

      <Grid container spacing={3}>
        {/* ============ Rating summary ============ */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h2" fontWeight={900} sx={{ lineHeight: 1 }}>
                  {stats.averageRating.toFixed(1)}
                </Typography>
                <StarRating value={stats.averageRating} size={16} readOnly showValue={false} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={800}>
                  {formatCompactNumber(stats.totalReviews)} reviews
                </Typography>
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <VerifiedOutlinedIcon sx={{ fontSize: 15, color: 'success.main' }} />
                  <Typography variant="caption" color="text.secondary">
                    Reviews linked to completed sessions
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {formatCompactNumber(mentor?.statistics?.totalSessions ?? 0)} sessions completed
                </Typography>
              </Box>
            </Stack>

            <RatingDistribution
              breakdown={breakdown.ratingBreakdown ?? {}}
              total={breakdown.totalReviews}
              onSelect={(star) => setRatingFilter(ratingFilter === star ? undefined : star)}
              selected={ratingFilter}
            />

            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 2 }}>
              {[undefined, 5, 4, 3, 2, 1].map((star) => (
                <Chip
                  key={String(star ?? 'all')}
                  label={star ? `${star}★` : 'All'}
                  size="small"
                  onClick={() => setRatingFilter(star)}
                  color={ratingFilter === star ? 'primary' : 'default'}
                  variant={ratingFilter === star ? 'filled' : 'outlined'}
                  sx={{ fontWeight: 800 }}
                />
              ))}
            </Box>
          </Card>
        </Grid>

        {/* ============ Reviews list ============ */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="caption" fontWeight={800} color="text.secondary">
              Sort by:
            </Typography>
            {(['RECENT', 'HELPFUL', 'RATING'] as ReviewSort[]).map((option) => (
              <Chip
                key={option}
                label={option === 'RECENT' ? 'Most recent' : option === 'HELPFUL' ? 'Most helpful' : 'Highest rating'}
                size="small"
                onClick={() => sortBy(option)}
                color={sort === option ? 'primary' : 'default'}
                variant={sort === option ? 'filled' : 'outlined'}
                sx={{ fontWeight: 800 }}
              />
            ))}
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" alignItems="center" gap={0.5}>
              <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
              <Typography variant="caption" fontWeight={700}>
                {reviews.length} shown
              </Typography>
            </Stack>
          </Stack>

          {isLoading && reviews.length === 0 ? (
            <Stack spacing={2}>
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} variant="rounded" height={150} />
              ))}
            </Stack>
          ) : reviews.length === 0 ? (
            <EmptyState
              icon={<StarIcon />}
              title={ratingFilter ? `No ${ratingFilter}-star reviews yet` : 'No reviews yet'}
              description={ratingFilter ? 'Try a different filter.' : 'Be the first to share your session experience.'}
              actionLabel={ratingFilter ? 'Clear filter' : undefined}
              onAction={ratingFilter ? () => setRatingFilter(undefined) : undefined}
            />
          ) : (
            <Stack spacing={2.5}>
              {reviews.map((review: Review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </Stack>
          )}
        </Grid>
      </Grid>

      <ReviewComposerModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        mentorId={mentorId ?? ''}
        mentorName={mentorName}
      />
    </Box>
  );
};

export default MentorReviewsPage;
