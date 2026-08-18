import type { SelectOption } from '@/components/form';

export const PROFICIENCY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
] as const;

export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number];

export const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
  'Apprenticeship',
] as const;

export const EDUCATION_DEGREES = [
  "Associate's Degree",
  "Bachelor's Degree",
  "Master's Degree",
  'Doctorate (PhD)',
  'MBA',
  'High School Diploma',
  'Bootcamp Certificate',
  'Professional Certification',
  'Other',
] as const;

export const proficiencyOptions: SelectOption[] = PROFICIENCY_LEVELS.map((level) => ({
  label: level,
  value: level,
}));

export const employmentTypeOptions: SelectOption[] = EMPLOYMENT_TYPES.map((type) => ({
  label: type,
  value: type,
}));

export const degreeOptions: SelectOption[] = EDUCATION_DEGREES.map((degree) => ({
  label: degree,
  value: degree,
}));

export const LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'French',
  'German',
  'Mandarin',
  'Hindi',
  'Arabic',
  'Portuguese',
  'Russian',
  'Japanese',
  'Korean',
  'Italian',
  'Dutch',
  'Turkish',
  'Polish',
  'Bengali',
  'Vietnamese',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Greek',
  'Hebrew',
  'Indonesian',
  'Thai',
] as const;

export const languageOptions: SelectOption[] = LANGUAGE_OPTIONS.map((language) => ({
  label: language,
  value: language,
}));

export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Amsterdam',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Stockholm',
  'Europe/Warsaw',
  'Europe/Kyiv',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Bangkok',
  'Australia/Sydney',
  'Pacific/Auckland',
] as const;

export const timezoneOptions: SelectOption[] = TIMEZONES.map((timezone) => ({
  label: timezone.replace('_', ' '),
  value: timezone,
}));

export const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Spain',
  'Italy',
  'Netherlands',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Ireland',
  'Poland',
  'Portugal',
  'Switzerland',
  'Belgium',
  'Austria',
  'India',
  'Singapore',
  'Japan',
  'South Korea',
  'China',
  'Vietnam',
  'Thailand',
  'Indonesia',
  'Philippines',
  'Malaysia',
  'United Arab Emirates',
  'Saudi Arabia',
  'Israel',
  'Turkey',
  'Brazil',
  'Mexico',
  'Argentina',
  'Chile',
  'Colombia',
  'South Africa',
  'Nigeria',
  'Kenya',
  'Egypt',
  'Morocco',
  'New Zealand',
] as const;

export const countryOptions: SelectOption[] = COUNTRIES.map((country) => ({
  label: country,
  value: country,
}));

export const SKILL_SUGGESTIONS = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'Java',
  'Spring Boot',
  'System Design',
  'Data Structures',
  'Algorithms',
  'SQL',
  'Docker',
  'Kubernetes',
  'AWS',
  'UI/UX Design',
  'Product Management',
  'Machine Learning',
  'Public Speaking',
  'Leadership',
  'Agile / Scrum',
  'DevOps',
  'GraphQL',
  'Figma',
  'Storytelling',
  'Negotiation',
] as const;
