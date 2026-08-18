/**
 * Review domain types — mirror the review-service DTOs
 * (ReviewResponse, RatingResponse, ReviewRequest).
 */

export type ReviewDimensionKey = 'skill' | 'communication' | 'knowledge' | 'professionalism';

export interface ReviewReply {
  id: string;
  mentorId?: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewDimensionRatings {
  skill?: number;
  communication?: number;
  knowledge?: number;
  professionalism?: number;
}

export interface Review {
  id: string;
  sessionId?: string;
  mentorId: string;
  learnerId?: string;
  learnerName?: string;
  rating: number;
  title?: string;
  content?: string;
  status?: string;
  verified?: boolean;
  /** When true the learner's identity is hidden on public pages. */
  anonymous?: boolean;
  /** Per-criterion scores: skill, communication, knowledge, professionalism. */
  dimensionRatings?: ReviewDimensionRatings;
  helpfulCount?: number;
  notHelpfulCount?: number;
  replyCount?: number;
  votedByMe?: boolean;
  myVoteType?: string;
  replies?: ReviewReply[];
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RatingBreakdown {
  mentorId: string;
  averageRating: number;
  medianRating?: number;
  totalReviews: number;
  ratingBreakdown?: Record<string, number>;
  ratingPercentageBreakdown?: Record<string, number>;
  fiveStarPercentage?: number;
  fourStarPercentage?: number;
  threeStarPercentage?: number;
  twoStarPercentage?: number;
  oneStarPercentage?: number;
}

export interface ReviewStatistics {
  mentorId: string;
  averageRating: number;
  medianRating?: number;
  totalReviews: number;
  totalReplies?: number;
  totalHelpfulVotes?: number;
  reviewGrowthRate?: number;
  engagementScore?: number;
}

/* ---------------- Request payloads (mirror backend) ---------------- */

export interface ReviewRequest {
  sessionId: string;
  mentorId: string;
  rating: number;
  title?: string;
  content?: string;
}

export interface ReplyRequest {
  reviewId: string;
  content: string;
}

export interface ReviewRequestOptions {
  /** Hides the learner identity on public review pages. */
  anonymous?: boolean;
  dimensionRatings?: ReviewDimensionRatings;
}

/* ---------------- Search & moderation payloads (mirror backend) ---------------- */

export interface ReportRequest {
  targetType: 'POST' | 'COMMENT' | 'REVIEW';
  targetId: string;
  reason: string;
}

export interface ReviewSearchHit {
  id: string;
  mentorId: string;
  mentorName: string;
  learnerName?: string;
  rating: number;
  content?: string;
  createdAt?: string;
}

export interface ReviewVoteRequest {
  reviewId: string;
  voteType: 'HELPFUL' | 'NOT_HELPFUL';
}

export interface ReviewReplyRequest {
  reviewId: string;
  content: string;
}
