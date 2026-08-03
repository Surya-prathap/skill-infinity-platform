/**
 * Curated dashboard content. These widgets preview data that will stream from
 * the session / wallet / notification services in later milestones; the
 * profile completion widget is wired to the real profile API.
 */

export const UPCOMING_SESSIONS = [
  {
    id: 's1',
    topic: 'System Design Deep Dive',
    mentor: 'Sarah Chen',
    mentorFirstName: 'Sarah',
    mentorLastName: 'Chen',
    date: 'Today',
    time: '4:00 PM',
    color: '#6D5DF6',
  },
  {
    id: 's2',
    topic: 'React Performance Patterns',
    mentor: 'Emily Watson',
    mentorFirstName: 'Emily',
    mentorLastName: 'Watson',
    date: 'Tomorrow',
    time: '6:30 PM',
    color: '#14B8A6',
  },
  {
    id: 's3',
    topic: 'Behavioral Interview Prep',
    mentor: 'David Kim',
    mentorFirstName: 'David',
    mentorLastName: 'Kim',
    date: 'Aug 15',
    time: '11:00 AM',
    color: '#F59E0B',
  },
] as const;

export const ACTIVITY_TIMELINE = [
  { title: 'Session completed with Sarah Chen', description: 'System Design Deep Dive — 60 min', time: '2 hours ago', color: '#6D5DF6' },
  { title: 'Earned 50 credits for a referral', description: 'Referral program bonus', time: 'Yesterday', color: '#14B8A6' },
  { title: 'New reply on your community post', description: '“How do you prepare for system design rounds?”', time: '2 days ago', color: '#F59E0B' },
  { title: 'Booked: React Performance Patterns', description: 'with Emily Watson', time: '3 days ago', color: '#3B82F6' },
] as const;

export const RECENT_REVIEWS = [
  {
    author: 'Marcus Reid',
    role: 'Data Analyst',
    rating: 5,
    text: 'Alex explained database indexing with such clarity — instantly actionable.',
    time: '3 days ago',
  },
  {
    author: 'Priya Sharma',
    role: 'Cloud Architect',
    rating: 5,
    text: 'Great structure and pace. The mock interview feedback was spot on.',
    time: '1 week ago',
  },
  {
    author: 'Jon Bell',
    role: 'Full-stack Developer',
    rating: 4,
    text: 'Very practical. Would love more hands-on whiteboarding next time.',
    time: '2 weeks ago',
  },
] as const;

export const RECOMMENDED_MENTORS = [
  { name: 'Sarah Chen', role: 'Staff Engineer · Ex-Google', color: '#6D5DF6', rating: 5.0 },
  { name: 'Emily Watson', role: 'Principal Engineer · React Core', color: '#14B8A6', rating: 4.9 },
  { name: 'David Kim', role: 'Engineering Manager · Meta', color: '#F59E0B', rating: 4.8 },
  { name: 'Amara Okafor', role: 'ML Engineer · OpenAI', color: '#EC4899', rating: 5.0 },
] as const;

export const RECENT_NOTIFICATIONS = [
  { id: 'n1', title: 'Session reminder in 1 hour', time: 'Just now', unread: true },
  { id: 'n2', title: 'Sarah accepted your session request', time: '2 hours ago', unread: true },
  { id: 'n3', title: 'Your wallet was credited +50', time: 'Yesterday', unread: false },
  { id: 'n4', title: 'New mentor joined: ML Engineering', time: '2 days ago', unread: false },
] as const;

export const LEARNING_PROGRESS = [
  { label: 'W1', value: 4 },
  { label: 'W2', value: 6 },
  { label: 'W3', value: 5 },
  { label: 'W4', value: 9 },
  { label: 'W5', value: 7 },
  { label: 'W6', value: 11 },
  { label: 'W7', value: 8 },
  { label: 'W8', value: 12 },
] as const;

export const COMMUNITY_ACTIVITY = [
  { label: 'Mon', value: 12 },
  { label: 'Tue', value: 18 },
  { label: 'Wed', value: 9 },
  { label: 'Thu', value: 22 },
  { label: 'Fri', value: 16 },
  { label: 'Sat', value: 7 },
  { label: 'Sun', value: 10 },
] as const;

export const DASHBOARD_STATS = [
  { label: 'Sessions Completed', value: 12, suffix: '', delta: '+3 this month', color: '#6D5DF6', icon: 'sessions' },
  { label: 'Learning Hours', value: 46, suffix: 'h', delta: '+8h this week', color: '#14B8A6', icon: 'hours' },
  { label: 'Credits Earned', value: 320, suffix: '', delta: '+50 this month', color: '#F59E0B', icon: 'credits' },
  { label: 'Mentor Rating', value: 4.9, decimals: 1, suffix: '/5', delta: 'From 24 reviews', color: '#EC4899', icon: 'rating' },
] as const;
