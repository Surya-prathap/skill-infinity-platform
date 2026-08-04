import type { Mentor, MentorSummary } from '@/types';

/* ============================================================
   Seed mentor catalog for the discovery marketplace.
   Mirrors the mentor-service MentorResponse shape so the UI works
   fully offline and upgrades seamlessly to live data.
   ============================================================ */

export const seedMentors: Mentor[] = [
  {
    id: 'm-001',
    userId: 'u-001',
    status: 'ACTIVE',
    verified: true,
    profile: {
      headline: 'Staff Engineer · System Design & Cloud Architecture',
      bio: 'Helping engineers crack senior system design rounds at FAANG.',
      aboutMe:
        '12+ years building large-scale distributed systems. Ex-Google, ex-AWS. I have mentored 300+ engineers into senior and staff roles with a structured, whiteboard-first approach.',
      country: 'United States',
      city: 'San Francisco',
      timezone: 'America/Los_Angeles',
      yearsOfExperience: 12,
      teachingLevel: 'ADVANCED',
      profileCompletionPercentage: 100,
      profileVisible: true,
      acceptingStudents: true,
      maxStudents: 15,
      website: 'https://alexrivera.dev',
    },
    expertiseList: [
      { id: 'e-001', categoryName: 'Software Engineering', subCategoryName: 'System Design', skillName: 'System Design', yearsOfExperience: 10, teachingLevel: 'ADVANCED', proficiencyLevel: 'EXPERT', technologies: 'AWS, Kafka, Kubernetes, PostgreSQL' },
      { id: 'e-002', categoryName: 'Software Engineering', subCategoryName: 'Backend Architecture', skillName: 'Distributed Systems', yearsOfExperience: 9, teachingLevel: 'ADVANCED', proficiencyLevel: 'EXPERT', technologies: 'Go, Java, gRPC' },
    ],
    languages: [
      { id: 'l-001', name: 'English', proficiencyLevel: 'NATIVE', isNative: true },
      { id: 'l-002', name: 'Spanish', proficiencyLevel: 'CONVERSATIONAL' },
    ],
    pricingList: [
      { id: 'p-001', sessionType: 'ONE_ON_ONE', price: 75, originalPrice: 95, currency: 'USD', discountPercentage: 21, durationMinutes: 60, isFree: false, description: 'Personalized 1:1 system design mentoring.', active: true },
      { id: 'p-002', sessionType: 'INTERVIEW_PREP', price: 95, originalPrice: 120, currency: 'USD', discountPercentage: 20, durationMinutes: 60, isFree: false, description: 'Full mock interview with structured feedback.', active: true },
    ],
    certifications: [
      { id: 'c-001', title: 'AWS Solutions Architect — Professional', issuingOrganization: 'Amazon Web Services', credentialId: 'AWS-SAP-2023-7712', issueDate: '2023-04-01', doesNotExpire: false, description: 'Advanced cloud architecture certification.', verificationStatus: 'VERIFIED' },
    ],
    achievements: [
      { id: 'a-001', title: 'Top 1% Mentor 2025', description: 'Ranked in the top 1% of mentors by learner satisfaction.', type: 'AWARD', issuer: 'Skill Infinity' },
    ],
    statistics: { totalSessions: 486, completedSessions: 462, cancelledSessions: 8, upcomingSessions: 16, averageRating: 4.9, totalReviews: 312, totalStudents: 210, totalEarnings: 28900, responseRate: 98, responseTimeMinutes: 12 },
  },
  {
    id: 'm-002',
    userId: 'u-002',
    status: 'ACTIVE',
    verified: true,
    profile: {
      headline: 'Principal Engineer · React & Frontend Performance',
      bio: 'React Core contributor turned mentor. Obsessed with 60fps.',
      aboutMe:
        '8 years deep in the React ecosystem — worked on the React team and led performance at a unicorn. I teach rendering internals, memoization strategy, and profiling that actually ships.',
      country: 'United States',
      city: 'New York',
      timezone: 'America/New_York',
      yearsOfExperience: 9,
      teachingLevel: 'ALL_LEVELS',
      profileCompletionPercentage: 100,
      profileVisible: true,
      acceptingStudents: true,
      maxStudents: 20,
    },
    expertiseList: [
      { id: 'e-101', categoryName: 'Software Engineering', subCategoryName: 'Frontend Engineering', skillName: 'React', yearsOfExperience: 8, teachingLevel: 'EXPERT', proficiencyLevel: 'EXPERT', technologies: 'React, TypeScript, Vite' },
      { id: 'e-102', categoryName: 'Software Engineering', subCategoryName: 'Frontend Engineering', skillName: 'Performance', yearsOfExperience: 6, teachingLevel: 'ADVANCED', proficiencyLevel: 'EXPERT', technologies: 'Chrome DevTools, Web Vitals' },
    ],
    languages: [
      { id: 'l-101', name: 'English', proficiencyLevel: 'NATIVE', isNative: true },
      { id: 'l-102', name: 'German', proficiencyLevel: 'CONVERSATIONAL' },
    ],
    pricingList: [
      { id: 'p-101', sessionType: 'ONE_ON_ONE', price: 65, currency: 'USD', durationMinutes: 60, isFree: false, description: 'Deep-dive React & performance mentoring.', active: true },
      { id: 'p-102', sessionType: 'CODE_REVIEW', price: 45, currency: 'USD', durationMinutes: 45, isFree: false, description: 'Async code review with a written report.', active: true },
    ],
    certifications: [
      { id: 'c-101', title: 'Google Developer Expert — Web Technologies', issuingOrganization: 'Google', issueDate: '2022-01-15', doesNotExpire: false, description: 'Recognized expert in web performance.', verificationStatus: 'VERIFIED' },
    ],
    statistics: { totalSessions: 342, completedSessions: 328, cancelledSessions: 5, upcomingSessions: 12, averageRating: 4.8, totalReviews: 214, totalStudents: 158, totalEarnings: 19600, responseRate: 95, responseTimeMinutes: 20 },
  },
  {
    id: 'm-003',
    userId: 'u-003',
    status: 'ACTIVE',
    verified: true,
    profile: {
      headline: 'ML Engineer · Generative AI & Applied LLMs',
      bio: 'From research papers to production. I make LLMs actually work.',
      aboutMe:
        'PhD in ML with 10 years in industry. Built GenAI products at OpenAI-adjacent startups. I mentor on LLM app architecture, RAG, fine-tuning, evals, and ML career strategy.',
      country: 'India',
      city: 'Bengaluru',
      timezone: 'Asia/Kolkata',
      yearsOfExperience: 10,
      teachingLevel: 'ADVANCED',
      profileCompletionPercentage: 95,
      profileVisible: true,
      acceptingStudents: true,
      maxStudents: 12,
    },
    expertiseList: [
      { id: 'e-201', categoryName: 'Data & AI', subCategoryName: 'Machine Learning', skillName: 'Machine Learning', yearsOfExperience: 10, teachingLevel: 'ADVANCED', proficiencyLevel: 'EXPERT', technologies: 'PyTorch, TensorFlow' },
      { id: 'e-202', categoryName: 'Data & AI', subCategoryName: 'Machine Learning', skillName: 'Generative AI', yearsOfExperience: 4, teachingLevel: 'ADVANCED', proficiencyLevel: 'EXPERT', technologies: 'OpenAI, LangChain, RAG' },
    ],
    languages: [
      { id: 'l-201', name: 'English', proficiencyLevel: 'FLUENT' },
      { id: 'l-202', name: 'Hindi', proficiencyLevel: 'NATIVE', isNative: true },
    ],
    pricingList: [
      { id: 'p-201', sessionType: 'ONE_ON_ONE', price: 85, originalPrice: 100, currency: 'USD', discountPercentage: 15, durationMinutes: 60, isFree: false, description: 'Hands-on GenAI & ML engineering mentoring.', active: true },
      { id: 'p-202', sessionType: 'PROJECT_SUPPORT', price: 120, currency: 'USD', durationMinutes: 90, isFree: false, description: 'End-to-end project guidance.', active: true },
    ],
    certifications: [
      { id: 'c-201', title: 'Google Cloud Professional ML Engineer', issuingOrganization: 'Google', issueDate: '2023-08-01', doesNotExpire: false, verificationStatus: 'VERIFIED' },
    ],
    achievements: [
      { id: 'a-201', title: 'Kaggle Grandmaster', description: 'Top 0.1% on Kaggle competitions.', type: 'BADGE' },
    ],
    statistics: { totalSessions: 258, completedSessions: 240, cancelledSessions: 6, upcomingSessions: 9, averageRating: 5.0, totalReviews: 186, totalStudents: 120, totalEarnings: 21400, responseRate: 92, responseTimeMinutes: 25 },
  },
  {
    id: 'm-004',
    userId: 'u-004',
    status: 'ACTIVE',
    verified: true,
    profile: {
      headline: 'Engineering Manager · Career & Leadership Coaching',
      bio: 'Ex-Meta EM. I turn ICs into managers and managers into leaders.',
      aboutMe:
        'Built and led multiple teams at Meta and Stripe. I coach on leadership, promotion strategy, behavioral interviews, and navigating organizational politics with grace.',
      country: 'United Kingdom',
      city: 'London',
      timezone: 'Europe/London',
      yearsOfExperience: 14,
      teachingLevel: 'ALL_LEVELS',
      profileCompletionPercentage: 100,
      profileVisible: true,
      acceptingStudents: true,
      maxStudents: 10,
    },
    expertiseList: [
      { id: 'e-301', categoryName: 'Product & Career', subCategoryName: 'Engineering Leadership', skillName: 'Leadership', yearsOfExperience: 8, teachingLevel: 'EXPERT', proficiencyLevel: 'EXPERT' },
      { id: 'e-302', categoryName: 'Product & Career', subCategoryName: 'Career Coaching', skillName: 'Career Coaching', yearsOfExperience: 7, teachingLevel: 'EXPERT', proficiencyLevel: 'EXPERT' },
    ],
    languages: [
      { id: 'l-301', name: 'English', proficiencyLevel: 'NATIVE', isNative: true },
      { id: 'l-302', name: 'French', proficiencyLevel: 'CONVERSATIONAL' },
    ],
    pricingList: [
      { id: 'p-301', sessionType: 'CAREER_COACHING', price: 110, originalPrice: 140, currency: 'USD', discountPercentage: 21, durationMinutes: 60, isFree: false, description: 'Strategy session for your career & leadership.', active: true },
      { id: 'p-302', sessionType: 'INTERVIEW_PREP', price: 90, currency: 'USD', durationMinutes: 60, isFree: false, description: 'Behavioral & leadership interview prep.', active: true },
    ],
    achievements: [
      { id: 'a-301', title: 'Mentor of the Year 2024', description: 'Outstanding career coaching outcomes.', type: 'AWARD', issuer: 'Skill Infinity' },
    ],
    statistics: { totalSessions: 572, completedSessions: 545, cancelledSessions: 12, upcomingSessions: 14, averageRating: 4.9, totalReviews: 421, totalStudents: 245, totalEarnings: 41800, responseRate: 99, responseTimeMinutes: 8 },
  },
  {
    id: 'm-005',
    userId: 'u-005',
    status: 'ACTIVE',
    verified: false,
    profile: {
      headline: 'Backend Engineer · Java, Spring & Microservices',
      bio: 'Enterprise Java specialist. Microservices, Kafka, and clean code.',
      aboutMe:
        '7 years building resilient microservices on Spring Boot and Kafka. I love untangling monoliths and teaching clean architecture that survives production.',
      country: 'Canada',
      city: 'Toronto',
      timezone: 'America/Toronto',
      yearsOfExperience: 7,
      teachingLevel: 'INTERMEDIATE',
      profileCompletionPercentage: 88,
      profileVisible: true,
      acceptingStudents: true,
      maxStudents: 25,
    },
    expertiseList: [
      { id: 'e-401', categoryName: 'Software Engineering', subCategoryName: 'Backend Architecture', skillName: 'Java', yearsOfExperience: 7, teachingLevel: 'INTERMEDIATE', proficiencyLevel: 'ADVANCED', technologies: 'Spring Boot, Hibernate' },
      { id: 'e-402', categoryName: 'Software Engineering', subCategoryName: 'Backend Architecture', skillName: 'Microservices', yearsOfExperience: 5, teachingLevel: 'INTERMEDIATE', proficiencyLevel: 'ADVANCED', technologies: 'Kafka, Docker, K8s' },
    ],
    languages: [{ id: 'l-401', name: 'English', proficiencyLevel: 'NATIVE', isNative: true }],
    pricingList: [
      { id: 'p-401', sessionType: 'ONE_ON_ONE', price: 55, currency: 'USD', durationMinutes: 60, isFree: false, description: 'Java & Spring mentoring.', active: true },
      { id: 'p-402', sessionType: 'CODE_REVIEW', price: 40, currency: 'USD', durationMinutes: 45, isFree: false, description: 'Backend code review.', active: true },
    ],
    statistics: { totalSessions: 198, completedSessions: 182, cancelledSessions: 7, upcomingSessions: 10, averageRating: 4.7, totalReviews: 96, totalStudents: 74, totalEarnings: 9800, responseRate: 90, responseTimeMinutes: 30 },
  },
  {
    id: 'm-006',
    userId: 'u-006',
    status: 'ACTIVE',
    verified: true,
    profile: {
      headline: 'Data Engineering Lead · Pipelines & Analytics',
      bio: 'Real-time pipelines, warehouses, and the art of trustworthy data.',
      aboutMe:
        'Led data platforms at fintech scale. I mentor on Spark, dbt, Airflow, modern warehouses (Snowflake/BigQuery), and data modeling that scales.',
      country: 'Germany',
      city: 'Berlin',
      timezone: 'Europe/Berlin',
      yearsOfExperience: 11,
      teachingLevel: 'ALL_LEVELS',
      profileCompletionPercentage: 92,
      profileVisible: true,
      acceptingStudents: true,
      maxStudents: 18,
    },
    expertiseList: [
      { id: 'e-501', categoryName: 'Data & AI', subCategoryName: 'Data Engineering', skillName: 'Data Engineering', yearsOfExperience: 9, teachingLevel: 'ADVANCED', proficiencyLevel: 'EXPERT', technologies: 'Spark, Airflow, dbt' },
      { id: 'e-502', categoryName: 'Data & AI', subCategoryName: 'Data Engineering', skillName: 'SQL', yearsOfExperience: 11, teachingLevel: 'ADVANCED', proficiencyLevel: 'EXPERT', technologies: 'Snowflake, BigQuery' },
    ],
    languages: [
      { id: 'l-501', name: 'English', proficiencyLevel: 'FLUENT' },
      { id: 'l-502', name: 'German', proficiencyLevel: 'NATIVE', isNative: true },
    ],
    pricingList: [
      { id: 'p-501', sessionType: 'ONE_ON_ONE', price: 70, currency: 'USD', durationMinutes: 60, isFree: false, description: 'Data engineering mentoring.', active: true },
    ],
    statistics: { totalSessions: 267, completedSessions: 251, cancelledSessions: 4, upcomingSessions: 8, averageRating: 4.8, totalReviews: 143, totalStudents: 98, totalEarnings: 15100, responseRate: 94, responseTimeMinutes: 22 },
  },
];

/** Summary projection used for search cards (mirrors MentorSummaryResponse). */
export const seedMentorSummaries: MentorSummary[] = seedMentors.map((mentor) => ({
  id: mentor.id,
  userId: mentor.userId,
  headline: mentor.profile?.headline,
  bio: mentor.profile?.bio,
  profilePictureUrl: mentor.profile?.profilePictureUrl,
  country: mentor.profile?.country,
  city: mentor.profile?.city,
  yearsOfExperience: mentor.profile?.yearsOfExperience,
  averageRating: mentor.statistics?.averageRating ?? 0,
  totalReviews: mentor.statistics?.totalReviews ?? 0,
  totalSessions: mentor.statistics?.totalSessions ?? 0,
  totalStudents: mentor.statistics?.totalStudents ?? 0,
  profileCompletionPercentage: mentor.profile?.profileCompletionPercentage ?? 0,
  verified: mentor.verified,
}));

/** Categories used to drive the discovery filter rail. */
export const seedCategories = [
  { label: 'Software Engineering', icon: 'code' },
  { label: 'Data & AI', icon: 'data' },
  { label: 'Design & UX', icon: 'design' },
  { label: 'Product & Career', icon: 'product' },
  { label: 'Cloud & DevOps', icon: 'cloud' },
  { label: 'Security', icon: 'security' },
  { label: 'Mobile', icon: 'mobile' },
  { label: 'Blockchain', icon: 'blockchain' },
] as const;

export const seedTrendingSkills = [
  'System Design',
  'React',
  'Machine Learning',
  'Career Coaching',
  'Kubernetes',
  'Data Engineering',
] as const;
