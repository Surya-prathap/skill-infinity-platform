/**
 * Review domain types — mirror the review-service DTOs
 * (ReviewResponse, RatingResponse, ReviewRequest).
 */

export interface ReviewReply {
  id: string;
  mentorId?: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
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
