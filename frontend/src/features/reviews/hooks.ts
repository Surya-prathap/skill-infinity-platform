import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services';
import { getErrorMessage, showError, showSuccess } from '@/utils';
import { reviewKeys } from './queryKeys';
import type {
  RatingBreakdown,
  Review,
  ReviewDimensionRatings,
  ReviewRequest,
} from '@/types';

const EMPTY_REVIEWS = (): Review[] => [];

const EMPTY_BREAKDOWN = (mentorId: string): RatingBreakdown => ({
  mentorId,
  averageRating: 0,
  totalReviews: 0,
  ratingBreakdown: {},
  fiveStarPercentage: 0,
  fourStarPercentage: 0,
  threeStarPercentage: 0,
  twoStarPercentage: 0,
  oneStarPercentage: 0,
});

/* ============================================================
   Reviews & ratings (mentor review page)
   ============================================================ */

export const useMentorReviewsQuery = (
  mentorId?: string,
  rating?: number,
  sort: 'RECENT' | 'HELPFUL' | 'RATING' = 'RECENT',
) => {
  const result = useQuery({
    queryKey: reviewKeys.mentor(mentorId ?? 'none', rating, sort),
    queryFn: async () => {
      const response = await reviewService.getReviewsByMentor(mentorId!, 0, 30, rating, sort);
      return response.data.data.content;
    },
    enabled: Boolean(mentorId),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  return { ...result, reviews: (result.data ?? EMPTY_REVIEWS()) as Review[], isOffline: result.isError };
};

export const useMentorRatingSummaryQuery = (mentorId?: string) => {
  const result = useQuery({
    queryKey: reviewKeys.summary(mentorId ?? 'none'),
    queryFn: async () => {
      const breakdown = await reviewService.getRatingBreakdown(mentorId!);
      const stats = await reviewService.getStatistics(mentorId!);
      return { breakdown: breakdown.data.data, stats: stats.data.data };
    },
    enabled: Boolean(mentorId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const fallback = useMemo(
    () => ({ breakdown: EMPTY_BREAKDOWN(mentorId ?? ''), stats: { averageRating: 0, totalReviews: 0 } }),
    [mentorId],
  );

  const data = result.data ?? fallback;
  return { ...result, breakdown: data.breakdown, stats: data.stats, isOffline: result.isError };
};

export const useSubmitReviewMutation = (mentorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReviewRequest & { anonymous?: boolean; dimensionRatings?: ReviewDimensionRatings }) =>
      reviewService.createReview(payload).then((r) => r.data.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewKeys.mentor(mentorId) });
      void queryClient.invalidateQueries({ queryKey: reviewKeys.summary(mentorId) });
      showSuccess('Review submitted — thank you! ⭐');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useReviewVoteMutation = (mentorId: string, reviewId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (voteType: 'HELPFUL' | 'NOT_HELPFUL') =>
      reviewService.voteReview({ reviewId, voteType }).then((r) => r.data.data),
    onMutate: (voteType) => {
      queryClient.setQueriesData<unknown>({ queryKey: reviewKeys.mentor(mentorId) }, (oldData: unknown) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map((item) => {
          const review = item as Review;
          if (review.id !== reviewId) return review;
          const alreadyVoted = review.votedByMe;
          const helpfulDelta = voteType === 'HELPFUL' ? (alreadyVoted ? -1 : 1) : 0;
          const notHelpfulDelta = voteType === 'NOT_HELPFUL' ? (alreadyVoted ? -1 : 1) : 0;
          return {
            ...review,
            helpfulCount: Math.max(0, (review.helpfulCount ?? 0) + helpfulDelta),
            notHelpfulCount: Math.max(0, (review.notHelpfulCount ?? 0) + notHelpfulDelta),
            votedByMe: !alreadyVoted,
            myVoteType: alreadyVoted ? undefined : voteType,
          };
        });
      });
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

export const useReplyToReviewMutation = (mentorId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, content }: { reviewId: string; content: string }) =>
      reviewService.replyToReview({ reviewId, content }).then((r) => r.data.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewKeys.mentor(mentorId) });
      showSuccess('Reply posted');
    },
    onError: (error) => showError(getErrorMessage(error)),
  });
};

/** Reports a review to the review-service moderation queue. */
export const useReportReviewMutation = () =>
  useMutation({
    mutationFn: (payload: { reviewId: string; reason: string }) =>
      reviewService.reportReview({ targetType: 'REVIEW', targetId: payload.reviewId, reason: payload.reason }).then(() => undefined),
    onSuccess: () => showSuccess('Report submitted — our moderators will review it'),
    onError: (error) => showError(getErrorMessage(error)),
  });
