/**
 * Community platform domain types — mirror the community-service DTOs
 * (CommunityResponse, PostResponse, CommentResponse, PollResponse,
 * LeaderboardResponse, ActivityResponse) plus client-side learning domain
 * types used by the Learning Activity and Achievements modules.
 */

export type CommunityMemberRole = 'OWNER' | 'MODERATOR' | 'MEMBER';

export type PostContentType =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'DOCUMENT'
  | 'CODE'
  | 'LINK'
  | 'POLL';

export type PostAttachmentType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'CODE' | 'LINK';

export type FeedFilter = 'LATEST' | 'TRENDING' | 'FOLLOWING';

export type LeaderboardCategory =
  | 'LEARNERS'
  | 'MENTORS'
  | 'CONTRIBUTORS'
  | 'CHAMPIONS'
  | 'HELPFUL';

export type LeaderboardRange = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

export type ActivityType =
  | 'SESSION_COMPLETED'
  | 'ACHIEVEMENT'
  | 'CERTIFICATE'
  | 'POST'
  | 'COMMENT'
  | 'REVIEW'
  | 'BOOKMARK'
  | 'MILESTONE';

export type AchievementType =
  | 'BADGE'
  | 'CERTIFICATE'
  | 'MILESTONE'
  | 'STREAK'
  | 'CONTRIBUTION';

export type AchievementRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export type ReviewDimensionKey = 'skill' | 'communication' | 'knowledge' | 'professionalism';

/* ============================================================
   Communities
   ============================================================ */

export interface CommunityMember {
  id: string;
  userId: string;
  name: string;
  title?: string;
  role: CommunityMemberRole;
  joinedAt: string;
}

export interface CommunityRule {
  id: string;
  title: string;
  description: string;
}

export interface CommunityStatistics {
  postsThisWeek: number;
  membersGrowth: number;
  questionsAnswered: number;
  activeThisWeek: number;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  category: string;
  tags: string[];
  emoji: string;
  coverIndex: number;
  memberCount: number;
  postCount: number;
  onlineCount: number;
  joined: boolean;
  isOfficial?: boolean;
  pinnedPostIds?: string[];
  members?: CommunityMember[];
  moderators?: CommunityMember[];
  rules?: CommunityRule[];
  statistics?: CommunityStatistics;
  createdAt: string;
}

export interface CommunityCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  communityCount?: number;
}

/* ============================================================
   Posts, attachments, polls
   ============================================================ */

export interface PostAttachment {
  id: string;
  type: PostAttachmentType;
  url?: string;
  thumbnailUrl?: string;
  title?: string;
  fileName?: string;
  fileSize?: number;
  language?: string;
  code?: string;
  provider?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  votedOptionId?: string | null;
  multiple?: boolean;
  expiresAt?: string;
}

export interface CommunityPost {
  id: string;
  communityId?: string;
  communityName?: string;
  communitySlug?: string;
  authorId: string;
  authorName: string;
  authorTitle?: string;
  authorIsMentor?: boolean;
  authorVerified?: boolean;
  title?: string;
  content: string;
  contentType: PostContentType;
  attachments?: PostAttachment[];
  poll?: Poll;
  tags?: string[];
  mentions?: string[];
  createdAt: string;
  updatedAt?: string;
  edited?: boolean;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  shareCount?: number;
  viewCount?: number;
  liked: boolean;
  bookmarked: boolean;
  following?: boolean;
  pinned?: boolean;
  trendingScore?: number;
}

/* ============================================================
   Comments & reactions
   ============================================================ */

export interface CommentReaction {
  emoji: string;
  count: number;
  reacted?: boolean;
}

export interface CommunityComment {
  id: string;
  postId: string;
  parentId?: string | null;
  authorId: string;
  authorName: string;
  authorTitle?: string;
  authorIsMentor?: boolean;
  content: string;
  mentions?: string[];
  reactions?: CommentReaction[];
  likeCount: number;
  liked: boolean;
  replyCount: number;
  replies?: CommunityComment[];
  createdAt: string;
  updatedAt?: string;
  edited?: boolean;
  deleted?: boolean;
}

export interface Tag {
  name: string;
  count: number;
}

/* ============================================================
   Leaderboard, activity, achievements
   ============================================================ */

export interface LeaderboardEntry {
  id: string;
  userId: string;
  name: string;
  title?: string;
  points: number;
  metric: string;
  badge?: string;
  change: number;
  isCurrentUser?: boolean;
}

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  points?: number;
  createdAt: string;
  link?: string;
  meta?: string;
}

export interface Achievement {
  id: string;
  type: AchievementType;
  title: string;
  description?: string;
  emoji: string;
  points: number;
  rarity: AchievementRarity;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  total?: number;
}

export interface LearningStats {
  streakDays: number;
  totalPoints: number;
  totalHours: number;
  sessionsCompleted: number;
  certificatesCount: number;
  badgesCount: number;
  postsCount: number;
  reviewsCount: number;
  weeklyProgress: number[];
  monthlyProgress: number[];
  contribution: Record<string, number>;
}

/* ============================================================
   Search
   ============================================================ */

export interface CommunitySearchResult {
  query: string;
  communities: Community[];
  posts: CommunityPost[];
  tags: Tag[];
  users: Array<{ id: string; name: string; title?: string; isMentor?: boolean }>;
  reviews: ReviewSearchHit[];
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

/* ============================================================
   Request payloads (mirror backend)
   ============================================================ */

export interface CreatePostRequest {
  communityId?: string;
  title?: string;
  content: string;
  contentType: PostContentType;
  attachments?: PostAttachment[];
  poll?: {
    question: string;
    options: string[];
  };
  tags?: string[];
  mentions?: string[];
}

export interface CreateCommentRequest {
  postId: string;
  parentId?: string | null;
  content: string;
  mentions?: string[];
}

export interface PollVoteRequest {
  pollId: string;
  optionIds: string[];
}

export interface ReportRequest {
  targetType: 'POST' | 'COMMENT' | 'REVIEW';
  targetId: string;
  reason: string;
}

export interface ReviewVoteRequest {
  reviewId: string;
  voteType: 'HELPFUL' | 'NOT_HELPFUL';
}

export interface ReviewReplyRequest {
  reviewId: string;
  content: string;
}
