import type {
  Category,
  DashboardData,
  Mentor,
  MentorAchievement,
  MentorAvailability,
  MentorCertification,
  MentorPreference,
  MentorPricing,
} from '@/types';

/* ============================================================
   Demo content for the premium mentor dashboard.
   These widgets preview data that streams from the session /
   wallet / review services once connected.
   ============================================================ */

export const MENTOR_REVENUE_SERIES = [
  { label: 'Jan', value: 420 },
  { label: 'Feb', value: 610 },
  { label: 'Mar', value: 540 },
  { label: 'Apr', value: 780 },
  { label: 'May', value: 690 },
  { label: 'Jun', value: 940 },
  { label: 'Jul', value: 1240 },
] as const;

export const MENTOR_WEEKLY_ACTIVITY = [
  { label: 'Mon', value: 4 },
  { label: 'Tue', value: 6 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 7 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 2 },
  { label: 'Sun', value: 1 },
] as const;

export const MENTOR_SESSION_MIX = [
  { label: '1:1 Mentoring', value: 42, color: '#6D5DF6' },
  { label: 'Interview Prep', value: 26, color: '#14B8A6' },
  { label: 'Code Review', value: 18, color: '#F59E0B' },
  { label: 'Group Sessions', value: 14, color: '#EC4899' },
] as const;

export const MENTOR_TODAY_SESSIONS = [
  {
    id: 't1',
    student: 'Sarah Chen',
    topic: 'System Design Deep Dive',
    time: '4:00 PM',
    status: 'Confirmed',
    color: '#6D5DF6',
  },
  {
    id: 't2',
    student: 'Marcus Reid',
    topic: 'Backend Architecture Review',
    time: '6:30 PM',
    status: 'Confirmed',
    color: '#14B8A6',
  },
] as const;

export const MENTOR_UPCOMING_SESSIONS = [
  {
    id: 'u1',
    student: 'Priya Sharma',
    topic: 'Cloud Fundamentals',
    date: 'Aug 10',
    time: '2:00 PM',
    status: 'Pending',
    color: '#F59E0B',
  },
  {
    id: 'u2',
    student: 'Daniel Ortiz',
    topic: 'System Design Review',
    date: 'Aug 12',
    time: '11:00 AM',
    status: 'Confirmed',
    color: '#6D5DF6',
  },
  {
    id: 'u3',
    student: 'Amara Okafor',
    topic: 'ML Career Strategy',
    date: 'Aug 14',
    time: '5:00 PM',
    status: 'Pending',
    color: '#EC4899',
  },
  {
    id: 'u4',
    student: 'Jon Bell',
    topic: 'Frontend Performance',
    date: 'Aug 16',
    time: '9:30 AM',
    status: 'Confirmed',
    color: '#14B8A6',
  },
] as const;

export const MENTOR_REVIEWS = [
  {
    id: 'r1',
    author: 'Sarah Chen',
    rating: 5,
    text: 'Alex broke down system design better than any course I have taken. The mock interviews were game-changing.',
    time: '2 days ago',
  },
  {
    id: 'r2',
    author: 'Marcus Reid',
    rating: 5,
    text: 'Extremely structured sessions with actionable feedback. Worth every credit.',
    time: '1 week ago',
  },
  {
    id: 'r3',
    author: 'Priya Sharma',
    rating: 4,
    text: 'Great depth on cloud architecture. Would love more hands-on labs next time.',
    time: '2 weeks ago',
  },
  {
    id: 'r4',
    author: 'Daniel Ortiz',
    rating: 5,
    text: 'Patient, precise and incredibly generous with resources.',
    time: '3 weeks ago',
  },
] as const;

export const MENTOR_MESSAGES = [
  {
    id: 'm1',
    from: 'Sarah Chen',
    preview: 'Can we extend tomorrow session to cover caching strategies?',
    time: '10m',
    unread: true,
  },
  {
    id: 'm2',
    from: 'Marcus Reid',
    preview: 'Thanks again for the architecture feedback!',
    time: '1h',
    unread: true,
  },
  {
    id: 'm3',
    from: 'Priya Sharma',
    preview: 'I uploaded my resume for the review.',
    time: '3h',
    unread: false,
  },
] as const;

export const MENTOR_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'New booking request from Amara Okafor',
    time: 'Just now',
    unread: true,
    tone: 'info',
  },
  {
    id: 'n2',
    title: 'Payment received — $40.00 from Sarah Chen',
    time: '2 hours ago',
    unread: true,
    tone: 'success',
  },
  {
    id: 'n3',
    title: 'Review posted: 5 stars from Marcus Reid',
    time: 'Yesterday',
    unread: false,
    tone: 'warning',
  },
  {
    id: 'n4',
    title: 'Profile completion at 85%',
    time: '2 days ago',
    unread: false,
    tone: 'default',
  },
] as const;

export const MENTOR_ACTIVITY = [
  {
    title: 'Session completed with Sarah Chen',
    description: 'System Design Deep Dive — 60 min · +$40.00',
    time: '2 hours ago',
    color: '#6D5DF6',
  },
  {
    title: 'New 5★ review from Marcus Reid',
    description: '“Extremely structured sessions…”',
    time: 'Yesterday',
    color: '#F59E0B',
  },
  {
    title: 'Booking confirmed — Priya Sharma',
    description: 'Cloud Fundamentals · Aug 10 at 2:00 PM',
    time: '2 days ago',
    color: '#14B8A6',
  },
  {
    title: 'Monthly payout transferred',
    description: '$1,240.00 to your wallet',
    time: '4 days ago',
    color: '#3B82F6',
  },
] as const;

/* ============================================================
   Certificates, achievements & preferences seed — offline preview.
   ============================================================ */

export const seedCertifications: MentorCertification[] = [
  {
    id: 'c1',
    title: 'AWS Solutions Architect — Professional',
    issuingOrganization: 'Amazon Web Services',
    credentialId: 'AWS-SAP-2022-4481',
    credentialUrl: 'https://www.credly.com/badges/example',
    issueDate: '2022-06-01',
    doesNotExpire: false,
    description: 'Advanced proficiency in designing distributed systems on AWS.',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'c2',
    title: 'Google Cloud Professional Cloud Architect',
    issuingOrganization: 'Google',
    credentialId: 'GCP-PCA-2021-9910',
    issueDate: '2021-03-15',
    doesNotExpire: false,
    description: 'Expertise in cloud architecture and Google Cloud Platform.',
    verificationStatus: 'PENDING',
  },
  {
    id: 'c3',
    title: 'Certified Kubernetes Administrator',
    issuingOrganization: 'CNCF',
    credentialId: 'CKA-2020-5537',
    issueDate: '2020-09-20',
    doesNotExpire: false,
    description: 'Hands-on Kubernetes administration and cluster operations.',
    verificationStatus: 'VERIFIED',
  },
  {
    id: 'c4',
    title: 'TOEFL iBT — 118/120',
    issuingOrganization: 'ETS',
    issueDate: '2019-05-30',
    doesNotExpire: true,
    description: 'English language proficiency certification.',
    verificationStatus: 'REJECTED',
  },
];

export const seedAchievements: MentorAchievement[] = [
  {
    id: 'a1',
    title: 'Top 1% Mentor on Skill Infinity',
    description:
      'Ranked among the top 1% of mentors by learner satisfaction and session volume in 2025.',
    type: 'AWARD',
    dateAchieved: '2025-11-20',
    issuer: 'Skill Infinity',
    sortOrder: 1,
  },
  {
    id: 'a2',
    title: '200+ Learners Mentored',
    description: 'Reached the 200-session milestone with an average rating of 4.9.',
    type: 'MILESTONE',
    dateAchieved: '2025-08-02',
    issuer: 'Skill Infinity',
    sortOrder: 2,
  },
  {
    id: 'a3',
    title: 'Featured Speaker — DevCon 2025',
    description:
      'Invited speaker on “Scaling System Design Mentorship” at the annual developer conference.',
    type: 'HIGHLIGHT',
    dateAchieved: '2025-06-14',
    issuer: 'DevCon',
    url: 'https://devcon.example.com/speakers',
    sortOrder: 3,
  },
  {
    id: 'a4',
    title: '5.0 Rating Streak — 6 Months',
    description: 'Maintained a perfect 5.0 learner rating across 6 consecutive months.',
    type: 'BADGE',
    dateAchieved: '2025-04-01',
    issuer: 'Skill Infinity',
    sortOrder: 4,
  },
  {
    id: 'a5',
    title: 'AWS Community Builder',
    description: 'Recognized contributor to the AWS community program for cloud education content.',
    type: 'BADGE',
    dateAchieved: '2024-10-10',
    issuer: 'Amazon Web Services',
    sortOrder: 5,
  },
  {
    id: 'a6',
    title: 'Mentor of the Month — March',
    description: 'Selected as mentor of the month for outstanding learner outcomes.',
    type: 'AWARD',
    dateAchieved: '2024-03-25',
    issuer: 'Skill Infinity',
    sortOrder: 6,
  },
];

export const seedPreferences: MentorPreference = {
  id: 'pref-1',
  autoApproveSessions: false,
  advanceBookingDays: 14,
  cancellationHours: 24,
  maxStudentsPerSession: 1,
  sessionPreparationMinutes: 10,
  bufferMinutesBetweenSessions: 15,
  notificationOnBooking: true,
  notificationOnCancellation: true,
};

/* ============================================================
   Analytics demo series — powers the premium analytics dashboard.
   ============================================================ */

export const ANALYTICS_SESSION_TREND = [
  { label: 'Jan', value: 18 },
  { label: 'Feb', value: 24 },
  { label: 'Mar', value: 21 },
  { label: 'Apr', value: 30 },
  { label: 'May', value: 27 },
  { label: 'Jun', value: 36 },
  { label: 'Jul', value: 42 },
] as const;

export const ANALYTICS_STUDENT_GROWTH = [
  { label: 'Jan', value: 4 },
  { label: 'Feb', value: 7 },
  { label: 'Mar', value: 9 },
  { label: 'Apr', value: 13 },
  { label: 'May', value: 16 },
  { label: 'Jun', value: 21 },
  { label: 'Jul', value: 28 },
] as const;

export const ANALYTICS_BOOKING_TRENDS = [
  { label: 'Week 1', value: 8 },
  { label: 'Week 2', value: 12 },
  { label: 'Week 3', value: 10 },
  { label: 'Week 4', value: 15 },
  { label: 'Week 5', value: 13 },
  { label: 'Week 6', value: 18 },
  { label: 'Week 7', value: 16 },
  { label: 'Week 8', value: 21 },
] as const;

export const ANALYTICS_RATING_TRENDS = [
  { label: 'Feb', value: 4.6 },
  { label: 'Mar', value: 4.7 },
  { label: 'Apr', value: 4.8 },
  { label: 'May', value: 4.7 },
  { label: 'Jun', value: 4.9 },
  { label: 'Jul', value: 4.9 },
] as const;

export const ANALYTICS_TOP_SKILLS = [
  { label: 'System Design', value: 38, color: '#6D5DF6' },
  { label: 'Cloud Architecture', value: 24, color: '#14B8A6' },
  { label: 'Backend Engineering', value: 18, color: '#F59E0B' },
  { label: 'Career Coaching', value: 12, color: '#EC4899' },
  { label: 'Interview Prep', value: 8, color: '#3B82F6' },
] as const;

export const ANALYTICS_POPULAR_CATEGORIES = [
  { label: 'Software Engineering', value: 46, color: '#6D5DF6' },
  { label: 'Data & AI', value: 22, color: '#14B8A6' },
  { label: 'Product & Career', value: 18, color: '#F59E0B' },
  { label: 'Design & UX', value: 14, color: '#EC4899' },
] as const;

/* ============================================================
   Offline seed — used so the mentor UI remains fully functional
   when the backend is unreachable (mirrors the profile feature).
   ============================================================ */

export const seedAvailability: MentorAvailability[] = [
  {
    id: 'a1',
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 60,
    recurring: true,
    active: true,
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'a2',
    dayOfWeek: 'TUESDAY',
    startTime: '09:00',
    endTime: '17:00',
    slotDurationMinutes: 60,
    recurring: true,
    active: true,
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'a3',
    dayOfWeek: 'WEDNESDAY',
    startTime: '09:00',
    endTime: '13:00',
    slotDurationMinutes: 60,
    recurring: true,
    active: true,
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'a4',
    dayOfWeek: 'THURSDAY',
    startTime: '13:00',
    endTime: '18:00',
    slotDurationMinutes: 60,
    recurring: true,
    active: true,
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'a5',
    dayOfWeek: 'SATURDAY',
    startTime: '10:00',
    endTime: '14:00',
    slotDurationMinutes: 90,
    recurring: true,
    active: false,
    timezone: 'America/Los_Angeles',
  },
];

export const seedPricing: MentorPricing[] = [
  {
    id: 'p1',
    sessionType: 'ONE_ON_ONE',
    price: 60,
    originalPrice: 75,
    currency: 'USD',
    discountPercentage: 20,
    durationMinutes: 60,
    isFree: false,
    description: 'Personalized 1:1 mentoring on any topic in my expertise.',
    active: true,
  },
  {
    id: 'p2',
    sessionType: 'INTERVIEW_PREP',
    price: 80,
    originalPrice: 100,
    currency: 'USD',
    discountPercentage: 20,
    durationMinutes: 60,
    isFree: false,
    description: 'Mock interviews with live feedback and a structured debrief.',
    active: true,
  },
  {
    id: 'p3',
    sessionType: 'CODE_REVIEW',
    price: 45,
    currency: 'USD',
    durationMinutes: 45,
    isFree: false,
    description: 'Deep review of your codebase with a written summary.',
    active: true,
  },
];

export const seedMentor: Mentor = {
  id: 'seed-mentor',
  userId: 'seed-user',
  status: 'ACTIVE',
  verified: true,
  profile: {
    headline: 'Senior Staff Engineer · System Design & Cloud',
    bio: 'I help engineers level up through structured system design mentoring.',
    aboutMe:
      '12+ years building large-scale distributed systems. I have mentored 200+ engineers into senior roles at top companies.',
    country: 'United States',
    city: 'San Francisco',
    timezone: 'America/Los_Angeles',
    yearsOfExperience: 12,
    teachingLevel: 'ALL_LEVELS',
    profileCompletionPercentage: 85,
    profileVisible: true,
    acceptingStudents: true,
    maxStudents: 20,
  },
  expertiseList: [
    {
      id: 'e1',
      categoryName: 'Software Engineering',
      subCategoryName: 'Backend Architecture',
      skillName: 'System Design',
      yearsOfExperience: 10,
      teachingLevel: 'ADVANCED',
      proficiencyLevel: 'EXPERT',
      technologies: 'AWS, Kafka, PostgreSQL, Kubernetes',
    },
  ],
  availabilities: seedAvailability,
  pricingList: seedPricing,
  certifications: seedCertifications,
  achievements: seedAchievements,
  statistics: {
    totalSessions: 186,
    completedSessions: 172,
    cancelledSessions: 4,
    upcomingSessions: 14,
    averageRating: 4.9,
    totalReviews: 52,
    totalStudents: 28,
    totalEarnings: 1240,
    responseRate: 96,
    responseTimeMinutes: 18,
  },
  preference: seedPreferences,
};

export const seedDashboard: DashboardData = {
  profile: seedMentor.profile,
  statistics: seedMentor.statistics,
  preferences: seedMentor.preference,
  upcomingSessions: 14,
  pendingRequests: 2,
  availabilitySummary: seedAvailability,
  missingProfileFields: ['certifications', 'achievements'],
};

/* ============================================================
   Fallback taxonomy — keeps the registration wizard functional
   when the mentor-service category API is unreachable.
   ============================================================ */

export const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'cat-se-1',
    name: 'Software Engineering',
    slug: 'software-engineering',
    description: 'Backend, frontend, system design and engineering craft.',
    subCategories: [
      { id: 'sub-se-1', categoryId: 'cat-se-1', name: 'Backend Architecture' },
      { id: 'sub-se-2', categoryId: 'cat-se-1', name: 'Frontend Engineering' },
      { id: 'sub-se-3', categoryId: 'cat-se-1', name: 'System Design' },
      { id: 'sub-se-4', categoryId: 'cat-se-1', name: 'DevOps & SRE' },
    ],
  },
  {
    id: 'cat-ds-1',
    name: 'Data & AI',
    slug: 'data-ai',
    description: 'Machine learning, data engineering and analytics.',
    subCategories: [
      { id: 'sub-ds-1', categoryId: 'cat-ds-1', name: 'Machine Learning' },
      { id: 'sub-ds-2', categoryId: 'cat-ds-1', name: 'Data Engineering' },
      { id: 'sub-ds-3', categoryId: 'cat-ds-1', name: 'Data Science' },
    ],
  },
  {
    id: 'cat-dsgn-1',
    name: 'Design & UX',
    slug: 'design-ux',
    description: 'Product design, UI/UX and design systems.',
    subCategories: [
      { id: 'sub-dsgn-1', categoryId: 'cat-dsgn-1', name: 'Product Design' },
      { id: 'sub-dsgn-2', categoryId: 'cat-dsgn-1', name: 'UX Research' },
      { id: 'sub-dsgn-3', categoryId: 'cat-dsgn-1', name: 'Design Systems' },
    ],
  },
  {
    id: 'cat-pm-1',
    name: 'Product & Career',
    slug: 'product-career',
    description: 'Product management, leadership and career growth.',
    subCategories: [
      { id: 'sub-pm-1', categoryId: 'cat-pm-1', name: 'Product Management' },
      { id: 'sub-pm-2', categoryId: 'cat-pm-1', name: 'Engineering Leadership' },
      { id: 'sub-pm-3', categoryId: 'cat-pm-1', name: 'Career Coaching' },
    ],
  },
];
