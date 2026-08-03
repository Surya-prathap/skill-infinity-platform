import type { UserProfile } from '@/types';

/**
 * Fallback profile used when the user-service is unreachable (e.g. local dev
 * without the backend running). The API replaces this as soon as it responds.
 */
export const SEED_PROFILE: UserProfile = {
  id: 'seed-profile',
  userId: 'seed-user',
  email: 'alex.morgan@example.com',
  firstName: 'Alex',
  lastName: 'Morgan',
  headline: 'Senior Frontend Engineer · Design Systems & Performance',
  bio: 'I help product teams ship fast, accessible interfaces. Currently exploring system design and cloud architecture — and mentoring developers who want to level up their careers. When I am not coding you will find me writing about frontend performance or hiking.',
  phone: '+1 555 014 2233',
  dateOfBirth: '1994-03-12',
  country: 'United States',
  city: 'Austin',
  address: '221B Riverside Drive',
  timezone: 'America/Chicago',
  website: 'https://alexmorgan.dev',
  linkedinUrl: 'https://linkedin.com/in/alexmorgan',
  githubUrl: 'https://github.com/alexmorgan',
  twitterUrl: 'https://twitter.com/alexmorgan',
  certifications: ['AWS Certified Developer', 'Meta Front-End Professional Certificate'],
  educations: [
    {
      id: 'seed-edu-1',
      institution: 'University of Texas at Austin',
      degree: "Bachelor's Degree",
      fieldOfStudy: 'Computer Science',
      startDate: '2012-08-01',
      endDate: '2016-05-01',
      currentlyStudying: false,
      description: 'Focused on software engineering, distributed systems and human-computer interaction.',
      grade: '3.8 GPA',
      sortOrder: 0,
    },
    {
      id: 'seed-edu-2',
      institution: 'Meta',
      degree: 'Professional Certificate',
      fieldOfStudy: 'Front-End Development',
      startDate: '2023-01-01',
      endDate: '2023-09-01',
      currentlyStudying: false,
      description: 'Advanced React, performance optimization and accessibility.',
      sortOrder: 1,
    },
  ],
  experiences: [
    {
      id: 'seed-exp-1',
      company: 'Lumina Labs',
      title: 'Senior Frontend Engineer',
      location: 'Austin, TX',
      employmentType: 'Full-time',
      startDate: '2021-03-01',
      endDate: undefined,
      currentlyWorking: true,
      description:
        'Leading the design system team. Cut time-to-ship by 30% with a token-driven component library and improved Lighthouse scores from 72 to 98.',
      sortOrder: 0,
    },
    {
      id: 'seed-exp-2',
      company: 'Nimbus Analytics',
      title: 'Frontend Engineer',
      location: 'Remote',
      employmentType: 'Full-time',
      startDate: '2018-06-01',
      endDate: '2021-02-01',
      currentlyWorking: false,
      description:
        'Built real-time data dashboards serving 200k+ monthly users with React, TypeScript and WebSockets.',
      sortOrder: 1,
    },
  ],
  skills: [
    { id: 'seed-skill-1', name: 'React', proficiencyLevel: 'Expert', yearsOfExperience: 7, sortOrder: 0 },
    { id: 'seed-skill-2', name: 'TypeScript', proficiencyLevel: 'Expert', yearsOfExperience: 6, sortOrder: 1 },
    { id: 'seed-skill-3', name: 'Node.js', proficiencyLevel: 'Advanced', yearsOfExperience: 5, sortOrder: 2 },
    { id: 'seed-skill-4', name: 'System Design', proficiencyLevel: 'Advanced', yearsOfExperience: 4, sortOrder: 3 },
    { id: 'seed-skill-5', name: 'UI/UX Design', proficiencyLevel: 'Intermediate', yearsOfExperience: 3, sortOrder: 4 },
  ],
  languages: [
    { id: 'seed-lang-1', name: 'English', proficiencyLevel: 'Native', isNative: true, sortOrder: 0 },
    { id: 'seed-lang-2', name: 'Spanish', proficiencyLevel: 'Intermediate', isNative: false, sortOrder: 1 },
  ],
  profileCompletionPercentage: 86,
  createdAt: '2025-01-10T09:00:00Z',
  updatedAt: '2026-07-28T14:22:00Z',
};
