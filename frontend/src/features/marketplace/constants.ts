import type { MentorSortOption } from '@/types';

export const SORT_OPTIONS: MentorSortOption[] = [
  { value: 'RATING', label: 'Highest rated' },
  { value: 'REVIEWS', label: 'Most reviewed' },
  { value: 'SESSIONS', label: 'Most sessions' },
  { value: 'EXPERIENCE', label: 'Most experienced' },
  { value: 'PRICE_LOW', label: 'Price: low to high' },
  { value: 'PRICE_HIGH', label: 'Price: high to low' },
];

export const EXPERIENCE_OPTIONS = [
  { label: '1+ years', value: 1 },
  { label: '3+ years', value: 3 },
  { label: '5+ years', value: 5 },
  { label: '8+ years', value: 8 },
  { label: '10+ years', value: 10 },
  { label: '15+ years', value: 15 },
];

export const PRICE_RANGES = [
  { label: 'Under $25', value: 25 },
  { label: 'Under $50', value: 50 },
  { label: 'Under $75', value: 75 },
  { label: 'Under $100', value: 100 },
];

export const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'English' },
  { label: 'Spanish', value: 'Spanish' },
  { label: 'Hindi', value: 'Hindi' },
  { label: 'French', value: 'French' },
  { label: 'German', value: 'German' },
  { label: 'Portuguese', value: 'Portuguese' },
  { label: 'Mandarin', value: 'Mandarin' },
  { label: 'Arabic', value: 'Arabic' },
];

export const COUNTRY_OPTIONS = [
  { label: 'United States', value: 'United States' },
  { label: 'United Kingdom', value: 'United Kingdom' },
  { label: 'India', value: 'India' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Germany', value: 'Germany' },
  { label: 'Singapore', value: 'Singapore' },
  { label: 'Australia', value: 'Australia' },
];

export const MIN_RATING_OPTIONS = [
  { label: '4.5+ stars', value: 4.5 },
  { label: '4.0+ stars', value: 4.0 },
  { label: '3.5+ stars', value: 3.5 },
];

export const TIMEZONE_OPTIONS = [
  { label: 'Americas (UTC-8 to UTC-4)', value: 'Americas' },
  { label: 'Europe (UTC+0 to UTC+2)', value: 'Europe' },
  { label: 'Asia (UTC+5:30 to UTC+9)', value: 'Asia' },
  { label: 'Middle East (UTC+3 to UTC+4)', value: 'Middle East' },
];
