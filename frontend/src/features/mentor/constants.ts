import type { SelectOption } from '@/components/form';

/* ---------------- Days of the week ---------------- */

export const DAYS_OF_WEEK: SelectOption[] = [
  { label: 'Monday', value: 'MONDAY' },
  { label: 'Tuesday', value: 'TUESDAY' },
  { label: 'Wednesday', value: 'WEDNESDAY' },
  { label: 'Thursday', value: 'THURSDAY' },
  { label: 'Friday', value: 'FRIDAY' },
  { label: 'Saturday', value: 'SATURDAY' },
  { label: 'Sunday', value: 'SUNDAY' },
];

export const DAY_LABELS: Record<string, string> = Object.fromEntries(
  DAYS_OF_WEEK.map((day) => [String(day.value), day.label]),
);

/** Short labels used on the weekly calendar grid. */
export const DAY_SHORT_LABELS: Record<string, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
};

/* ---------------- Currencies ---------------- */

/** The platform operates in INR (₹) — no multi-currency pricing. */
export const CURRENCIES: SelectOption[] = [
  { label: 'INR — Indian Rupee (₹)', value: 'INR' },
];

/* ---------------- Session durations ---------------- */

export const SESSION_DURATIONS: SelectOption[] = [
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '60 minutes (1 hour)', value: 60 },
  { label: '90 minutes (1.5 hours)', value: 90 },
  { label: '120 minutes (2 hours)', value: 120 },
];

/* ---------------- Slot durations ---------------- */

export const SLOT_DURATIONS: SelectOption[] = [
  { label: '30 min slots', value: 30 },
  { label: '45 min slots', value: 45 },
  { label: '60 min slots', value: 60 },
  { label: '90 min slots', value: 90 },
];

/* ---------------- Teaching & proficiency levels ---------------- */

export const TEACHING_LEVELS: SelectOption[] = [
  { label: 'Beginner', value: 'BEGINNER' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Advanced', value: 'ADVANCED' },
  { label: 'Expert', value: 'EXPERT' },
  { label: 'All levels', value: 'ALL_LEVELS' },
];

export const PROFICIENCY_LEVELS: SelectOption[] = [
  { label: 'Fundamental', value: 'FUNDAMENTAL' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Advanced', value: 'ADVANCED' },
  { label: 'Expert', value: 'EXPERT' },
];

/* ---------------- Session types ---------------- */

export const SESSION_TYPES: SelectOption[] = [
  { label: '1:1 Mentoring', value: 'ONE_ON_ONE' },
  { label: 'Group Session', value: 'GROUP_SESSION' },
  { label: 'Interview Prep', value: 'INTERVIEW_PREP' },
  { label: 'Code Review', value: 'CODE_REVIEW' },
  { label: 'Resume Review', value: 'RESUME_REVIEW' },
  { label: 'Portfolio Review', value: 'PORTFOLIO_REVIEW' },
  { label: 'Career Coaching', value: 'CAREER_COACHING' },
  { label: 'Project Support', value: 'PROJECT_SUPPORT' },
];

/* ---------------- Achievement types ---------------- */

export const ACHIEVEMENT_TYPES: SelectOption[] = [
  { label: 'Badge', value: 'BADGE' },
  { label: 'Award', value: 'AWARD' },
  { label: 'Milestone', value: 'MILESTONE' },
  { label: 'Highlight', value: 'HIGHLIGHT' },
];

/* ---------------- Skill suggestions ---------------- */

export const SKILL_SUGGESTIONS = [
  'System Design',
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'Machine Learning',
  'Cloud Architecture',
  'DevOps',
  'Kubernetes',
  'SQL & Databases',
  'Data Structures & Algorithms',
  'Rust',
  'Go',
  'Java / Spring',
  'Frontend Performance',
  'UI / UX Design',
  'Product Management',
  'Career Strategy',
] as const;

/* ---------------- Timezones ---------------- */

export const TIMEZONES: SelectOption[] = [
  { label: '(UTC-08:00) Pacific Time (US & Canada)', value: 'America/Los_Angeles' },
  { label: '(UTC-07:00) Mountain Time (US & Canada)', value: 'America/Denver' },
  { label: '(UTC-06:00) Central Time (US & Canada)', value: 'America/Chicago' },
  { label: '(UTC-05:00) Eastern Time (US & Canada)', value: 'America/New_York' },
  { label: '(UTC+00:00) London / Dublin', value: 'Europe/London' },
  { label: '(UTC+01:00) Central European Time', value: 'Europe/Berlin' },
  { label: '(UTC+02:00) Eastern European Time', value: 'Europe/Athens' },
  { label: '(UTC+03:00) Moscow / Istanbul', value: 'Europe/Istanbul' },
  { label: '(UTC+05:30) India Standard Time', value: 'Asia/Kolkata' },
  { label: '(UTC+08:00) Singapore / Hong Kong', value: 'Asia/Singapore' },
  { label: '(UTC+09:00) Japan / Korea', value: 'Asia/Tokyo' },
  { label: '(UTC+10:00) Sydney / Melbourne', value: 'Australia/Sydney' },
  { label: '(UTC+04:00) Dubai / Gulf', value: 'Asia/Dubai' },
];

/* ---------------- Wizard steps ---------------- */

export const WIZARD_STEPS = [
  { id: 'personal', label: 'Personal', icon: 'person' },
  { id: 'experience', label: 'Experience', icon: 'work' },
  { id: 'skills', label: 'Skills', icon: 'bolt' },
  { id: 'expertise', label: 'Expertise', icon: 'lightbulb' },
  { id: 'categories', label: 'Categories', icon: 'category' },
  { id: 'pricing', label: 'Pricing', icon: 'price' },
  { id: 'availability', label: 'Availability', icon: 'calendar' },
  { id: 'certificates', label: 'Certificates', icon: 'award' },
  { id: 'verification', label: 'Verification', icon: 'shield' },
  { id: 'preview', label: 'Preview', icon: 'preview' },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]['id'];
