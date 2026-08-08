/**
 * Shared test fixtures — realistic, typed data for component and page tests.
 *
 * These are *test-only* fixtures kept out of the app runtime. The production
 * app renders only what the backend returns; tests use these to exercise the
 * UI deterministically without a live API.
 */
import type {
  Achievement,
  ActivityItem,
  Announcement,
  AppNotification,
  Community,
  CommunityComment,
  CommunityPost,
  Conversation,
  LearningStats,
  Mentor,
  PresenceInfo,
  UserProfile,
} from '@/types';

/* ============================================================
   Chat — conversations & presence
   ============================================================ */

const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();

export const testConversations: Conversation[] = [
  {
    id: 'c-sarah',
    type: 'direct',
    participants: [
      { userId: 'user-me', name: 'Alex Morgan' },
      { userId: 'user-sarah', name: 'Sarah Chen', role: 'ROLE_MENTOR', headline: 'Staff Engineer' },
    ],
    lastMessage: {
      id: 'm-sarah-1',
      conversationId: 'c-sarah',
      senderId: 'user-sarah',
      senderName: 'Sarah Chen',
      content: 'Let me review your architecture diagram…',
      kind: 'text',
      attachments: [],
      reactions: [],
      status: 'delivered',
      createdAt: minutesAgo(12),
      replyTo: null,
      readBy: ['user-me', 'user-sarah'],
    },
    unreadCount: 2,
    createdAt: minutesAgo(1440),
    updatedAt: minutesAgo(12),
  },
  {
    id: 'c-maya',
    type: 'direct',
    participants: [
      { userId: 'user-me', name: 'Alex Morgan' },
      { userId: 'user-maya', name: 'Maya Patel', role: 'ROLE_LEARNER' },
    ],
    lastMessage: {
      id: 'm-maya-1',
      conversationId: 'c-maya',
      senderId: 'user-maya',
      senderName: 'Maya Patel',
      content: 'Thanks for the study notes!',
      kind: 'text',
      attachments: [],
      reactions: [],
      status: 'read',
      createdAt: minutesAgo(480),
      replyTo: null,
      readBy: ['user-me', 'user-maya'],
    },
    unreadCount: 0,
    createdAt: minutesAgo(4320),
    updatedAt: minutesAgo(480),
  },
  {
    id: 'c-devops',
    type: 'group',
    title: 'DevOps Study Group',
    participants: [
      { userId: 'user-me', name: 'Alex Morgan' },
      { userId: 'user-sarah', name: 'Sarah Chen' },
      { userId: 'user-marcus', name: 'Marcus Reid' },
      { userId: 'user-priya', name: 'Priya Sharma' },
    ],
    lastMessage: {
      id: 'm-devops-1',
      conversationId: 'c-devops',
      senderId: 'user-marcus',
      senderName: 'Marcus Reid',
      content: 'CI pipeline is green 🎉',
      kind: 'text',
      attachments: [],
      reactions: [],
      status: 'delivered',
      createdAt: minutesAgo(90),
      replyTo: null,
      readBy: ['user-me', 'user-sarah', 'user-marcus', 'user-priya'],
    },
    unreadCount: 5,
    createdAt: minutesAgo(21600),
    updatedAt: minutesAgo(90),
  },
  {
    id: 'c-sd',
    type: 'session',
    title: 'System Design Deep Dive',
    participants: [
      { userId: 'user-me', name: 'Alex Morgan' },
      { userId: 'user-sarah', name: 'Sarah Chen' },
    ],
    lastMessage: {
      id: 'm-sd-1',
      conversationId: 'c-sd',
      senderId: 'user-sarah',
      senderName: 'Sarah Chen',
      content: 'Session starts in 30 minutes',
      kind: 'system',
      attachments: [],
      reactions: [],
      status: 'read',
      createdAt: minutesAgo(35),
      replyTo: null,
      readBy: ['user-me', 'user-sarah'],
    },
    unreadCount: 0,
    pinned: true,
    createdAt: minutesAgo(10080),
    updatedAt: minutesAgo(35),
  },
];

export const testPresence: Record<string, PresenceInfo> = {
  'user-sarah': { userId: 'user-sarah', status: 'online', lastSeen: minutesAgo(2) },
  'user-marcus': { userId: 'user-marcus', status: 'busy', customStatus: 'In a meeting' },
  'user-priya': { userId: 'user-priya', status: 'away', lastSeen: minutesAgo(60) },
};

/* ============================================================
   Announcements
   ============================================================ */

export const testAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Real-time messaging is live',
    body: 'The communication center now supports real-time messaging with presence and typing indicators.',
    category: 'PLATFORM',
    author: 'Skill Infinity Team',
    pinned: true,
    readByMe: true,
    publishedAt: minutesAgo(60 * 24),
  },
  {
    id: 'ann-2',
    title: 'Scheduled maintenance this Sunday',
    body: 'The platform will be briefly unavailable during a scheduled maintenance window.',
    category: 'MAINTENANCE',
    author: 'Skill Infinity Team',
    publishedAt: minutesAgo(60 * 6),
  },
  {
    id: 'ann-3',
    title: 'New mentor events this month',
    body: 'Join live Q&A sessions with top mentors across cloud, AI and system design.',
    category: 'EVENT',
    author: 'Events Team',
    publishedAt: minutesAgo(60 * 3),
  },
  {
    id: 'ann-4',
    title: 'Summer learning promotion',
    body: 'Get 30% off all mentor session bundles for a limited time.',
    category: 'PROMOTION',
    author: 'Growth Team',
    publishedAt: minutesAgo(60),
  },
];

/* ============================================================
   Community — activity, achievements, stats
   ============================================================ */

export const testAchievements: Achievement[] = [
  {
    id: 'ach-1',
    type: 'BADGE',
    title: 'First Steps',
    description: 'Join the Skill Infinity community',
    emoji: '👣',
    points: 100,
    rarity: 'COMMON',
    unlocked: true,
    unlockedAt: minutesAgo(60 * 24 * 3),
    progress: 1,
    total: 1,
  },
  {
    id: 'ach-2',
    type: 'STREAK',
    title: 'Streak Builder',
    description: 'Keep a 7-day learning streak',
    emoji: '🔥',
    points: 250,
    rarity: 'RARE',
    unlocked: true,
    unlockedAt: minutesAgo(60 * 24),
    progress: 7,
    total: 7,
  },
  {
    id: 'ach-3',
    type: 'MILESTONE',
    title: 'Momentum',
    description: 'Complete 30 learning sessions',
    emoji: '🚀',
    points: 500,
    rarity: 'EPIC',
    unlocked: false,
    progress: 18,
    total: 30,
  },
];

export const testActivityItems: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'SESSION_COMPLETED',
    title: 'Completed System Design Deep Dive',
    description: '60-minute session',
    points: 120,
    createdAt: minutesAgo(60 * 2),
  },
  {
    id: 'act-2',
    type: 'ACHIEVEMENT',
    title: 'Unlocked the Streak Builder badge',
    description: '7-day streak',
    points: 250,
    createdAt: minutesAgo(60 * 24),
  },
];

export const testLearningStats: LearningStats = {
  streakDays: 12,
  totalPoints: 4520,
  totalHours: 38,
  sessionsCompleted: 9,
  certificatesCount: 2,
  badgesCount: 3,
  postsCount: 1,
  reviewsCount: 4,
  weeklyProgress: [1, 2, 1, 3, 2, 2, 4],
  monthlyProgress: Array.from({ length: 30 }, (_, index) => (index % 5 === 0 ? 1 : 0)),
  contribution: { '2026-08-01': 3, '2026-08-02': 0, '2026-08-03': 2 },
};

/* ============================================================
   Community — communities, posts, comments
   ============================================================ */

export const testCommunities: Community[] = [
  {
    id: 'comm-sd',
    name: 'System Design',
    slug: 'system-design',
    description: 'Architecture, scalability and design trade-offs.',
    category: 'Engineering',
    tags: ['architecture', 'scalability'],
    emoji: '🏗️',
    coverIndex: 0,
    memberCount: 1240,
    postCount: 320,
    onlineCount: 45,
    joined: true,
    createdAt: minutesAgo(60 * 24 * 60),
  },
  {
    id: 'comm-java',
    name: 'Java & Spring',
    slug: 'java-spring',
    description: 'Backend engineering with Java and Spring Boot.',
    category: 'Backend',
    tags: ['java', 'spring'],
    emoji: '☕',
    coverIndex: 1,
    memberCount: 980,
    postCount: 210,
    onlineCount: 30,
    joined: false,
    createdAt: minutesAgo(60 * 24 * 45),
  },
  {
    id: 'comm-ml',
    name: 'Machine Learning',
    slug: 'machine-learning',
    description: 'ML engineering, MLOps and applied AI.',
    category: 'Data & AI',
    tags: ['ml', 'ai'],
    emoji: '🤖',
    coverIndex: 2,
    memberCount: 1540,
    postCount: 410,
    onlineCount: 60,
    joined: false,
    createdAt: minutesAgo(60 * 24 * 30),
  },
];

export const testPosts: CommunityPost[] = [
  {
    id: 'post-sd-1',
    communityId: 'comm-sd',
    communityName: 'System Design',
    communitySlug: 'system-design',
    authorId: 'user-alex-rivera',
    authorName: 'Alex Rivera',
    authorTitle: 'Staff Engineer',
    authorIsMentor: true,
    authorVerified: true,
    title: 'Designing a URL shortener',
    content: 'Let us design a URL shortener that handles 100M requests per day.',
    contentType: 'TEXT',
    tags: ['system-design', 'scalability'],
    createdAt: minutesAgo(60 * 5),
    likeCount: 42,
    commentCount: 8,
    bookmarkCount: 15,
    shareCount: 6,
    viewCount: 1200,
    liked: true,
    bookmarked: true,
    following: true,
    pinned: false,
  },
  {
    id: 'post-sd-2',
    communityId: 'comm-sd',
    communityName: 'System Design',
    communitySlug: 'system-design',
    authorId: 'user-maya',
    authorName: 'Maya Patel',
    authorTitle: 'Backend Engineer',
    content: 'Which collaborative editor would you pick for a real-time whiteboard?',
    contentType: 'POLL',
    poll: {
      id: 'poll-sd-2',
      question: 'Which collaborative editor do you prefer?',
      options: [
        { id: 'opt-1', text: 'Figma Jam', votes: 720 },
        { id: 'opt-2', text: 'Miro', votes: 584 },
      ],
      totalVotes: 1304,
      votedOptionId: 'opt-1',
    },
    tags: ['poll'],
    createdAt: minutesAgo(60 * 3),
    likeCount: 18,
    commentCount: 5,
    bookmarkCount: 4,
    shareCount: 2,
    viewCount: 640,
    liked: false,
    bookmarked: false,
    pinned: false,
  },
  {
    id: 'post-react-1',
    authorId: 'user-emily',
    authorName: 'Emily Watson',
    authorTitle: 'Frontend Engineer',
    content: 'A minimal virtualized list component for React.',
    contentType: 'CODE',
    attachments: [
      {
        id: 'att-react-1',
        type: 'CODE',
        language: 'tsx',
        code: 'const FeedList = ({ items }) => (\n  <div>{items.map((item) => <FeedCard key={item.id} item={item} />)}</div>\n);',
        title: 'FeedList.tsx',
      },
    ],
    tags: ['react', 'performance'],
    createdAt: minutesAgo(60 * 8),
    likeCount: 27,
    commentCount: 3,
    bookmarkCount: 9,
    shareCount: 4,
    viewCount: 810,
    liked: false,
    bookmarked: false,
    pinned: false,
  },
  {
    id: 'post-career-2',
    communityId: 'comm-sd',
    communityName: 'System Design',
    communitySlug: 'system-design',
    authorId: 'user-priya',
    authorName: 'Priya Sharma',
    authorTitle: 'Engineering Manager',
    authorIsMentor: true,
    content: 'How I navigated my first senior engineering interview loop.',
    contentType: 'TEXT',
    tags: ['career'],
    createdAt: minutesAgo(60 * 24 * 2),
    likeCount: 63,
    commentCount: 12,
    bookmarkCount: 21,
    shareCount: 9,
    viewCount: 2100,
    liked: false,
    bookmarked: false,
    pinned: false,
  },
  {
    id: 'post-java-1',
    communityId: 'comm-java',
    communityName: 'Java & Spring',
    communitySlug: 'java-spring',
    authorId: 'user-marcus',
    authorName: 'Marcus Reid',
    authorTitle: 'Backend Engineer',
    content: 'Virtual threads in Spring Boot 3.2 — a quick benchmark.',
    contentType: 'TEXT',
    tags: ['java', 'spring'],
    createdAt: minutesAgo(60 * 24),
    likeCount: 11,
    commentCount: 0,
    bookmarkCount: 2,
    shareCount: 1,
    viewCount: 350,
    liked: false,
    bookmarked: false,
    pinned: false,
  },
];

export const testCommentsByPost: Record<string, CommunityComment[]> = {
  'post-sd-1': [
    {
      id: 'cm-sd-1',
      postId: 'post-sd-1',
      parentId: null,
      authorId: 'user-sarah',
      authorName: 'Sarah Chen',
      authorTitle: 'Staff Engineer',
      authorIsMentor: true,
      content: 'Great breakdown! The read path is the trickiest part.',
      likeCount: 3,
      liked: false,
      replyCount: 1,
      createdAt: minutesAgo(60 * 4),
    },
    {
      id: 'cm-sd-2',
      postId: 'post-sd-1',
      parentId: 'cm-sd-1',
      authorId: 'user-alex-rivera',
      authorName: 'Alex Rivera',
      authorTitle: 'Staff Engineer',
      authorIsMentor: true,
      content: 'Agreed on UUIDv7 for the ID strategy — no collisions under sharding.',
      likeCount: 2,
      liked: false,
      replyCount: 0,
      createdAt: minutesAgo(60 * 3),
    },
  ],
  'post-career-2': [
    {
      id: 'cm-career-1',
      postId: 'post-career-2',
      parentId: null,
      authorId: 'user-alex-morgan',
      authorName: 'Alex Morgan',
      authorTitle: 'Frontend Engineer',
      content: 'This is so helpful, thank you for sharing!',
      likeCount: 1,
      liked: false,
      replyCount: 0,
      createdAt: minutesAgo(60 * 24),
    },
  ],
  'post-java-1': [],
};

/* ============================================================
   Marketplace — mentor (booking wizard)
   ============================================================ */

export const testMentor: Mentor = {
  id: 'mentor-1',
  userId: 'user-mentor-1',
  status: 'APPROVED',
  verified: true,
  profile: {
    headline: 'Senior Frontend Engineer · Design Systems & Performance',
    yearsOfExperience: 8,
    teachingLevel: 'ADVANCED',
    country: 'United States',
    city: 'Austin',
    bio: 'I help engineers master React, TypeScript and system design.',
  },
  statistics: {
    totalSessions: 120,
    completedSessions: 110,
    cancelledSessions: 4,
    upcomingSessions: 6,
    averageRating: 4.9,
    totalReviews: 67,
    totalStudents: 45,
    totalEarnings: 32000,
    responseRate: 98,
  },
  pricingList: [
    {
      id: 'price-1',
      sessionType: 'ONE_ON_ONE',
      price: 120,
      originalPrice: 150,
      currency: 'USD',
      discountPercentage: 20,
      durationMinutes: 60,
      isFree: false,
      description: '1-on-1 mentoring session',
      active: true,
    },
    {
      id: 'price-2',
      sessionType: 'GROUP',
      price: 45,
      currency: 'USD',
      durationMinutes: 90,
      isFree: false,
      description: 'Small group workshop',
      active: true,
    },
  ],
};

/* ============================================================
   Notifications
   ============================================================ */

export const testNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Session reminder',
    message: 'Your session with Sarah Chen starts in 15 minutes.',
    type: 'info',
    read: false,
    createdAt: minutesAgo(20),
    category: 'Sessions',
    emoji: '⏰',
  },
  {
    id: 'notif-2',
    title: 'Booking confirmed',
    message: 'Your booking was confirmed successfully.',
    type: 'success',
    read: false,
    createdAt: minutesAgo(60 * 2),
    category: 'Bookings',
    emoji: '📅',
  },
  {
    id: 'notif-3',
    title: 'New follower',
    message: 'Marcus Reid started following you.',
    type: 'info',
    read: false,
    createdAt: minutesAgo(60 * 24),
    category: 'Community',
    emoji: '👋',
  },
  {
    id: 'notif-4',
    title: 'Payment successful',
    message: 'Your credit pack purchase was processed.',
    type: 'success',
    read: true,
    createdAt: minutesAgo(60 * 24 * 3),
    category: 'Wallet',
    emoji: '💳',
  },
];

/* ============================================================
   Profile
   ============================================================ */

export const testProfile: UserProfile = {
  id: 'profile-1',
  userId: 'user-1',
  email: 'alex.morgan@example.com',
  firstName: 'Alex',
  lastName: 'Morgan',
  headline: 'Senior Frontend Engineer · Design Systems & Performance',
  bio: 'I build design systems and care deeply about web performance.',
  city: 'Austin',
  country: 'United States',
  timezone: 'America/Chicago',
  profileCompletionPercentage: 85,
  educations: [
    {
      id: 'edu-1',
      institution: 'University of Texas at Austin',
      degree: 'B.Sc.',
      fieldOfStudy: 'Computer Science',
      startDate: '2014-08-01',
      endDate: '2018-05-01',
      currentlyStudying: false,
    },
  ],
  experiences: [
    {
      id: 'exp-1',
      company: 'Lumina Labs',
      title: 'Senior Frontend Engineer',
      location: 'Austin, TX',
      employmentType: 'Full-time',
      startDate: '2020-01-01',
      currentlyWorking: true,
      description: 'Own the design system and performance budget.',
    },
  ],
  skills: [
    { id: 'skill-1', name: 'React', proficiencyLevel: 'EXPERT' },
    { id: 'skill-2', name: 'TypeScript', proficiencyLevel: 'EXPERT' },
  ],
  languages: [{ id: 'lang-1', name: 'English', proficiencyLevel: 'Native', isNative: true }],
  certifications: ['AWS Certified Solutions Architect'],
  createdAt: minutesAgo(60 * 24 * 90),
  updatedAt: minutesAgo(60 * 24 * 2),
};
