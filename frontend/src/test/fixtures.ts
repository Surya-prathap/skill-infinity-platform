/**
 * Shared test fixtures — realistic, typed data for component and page tests.
 *
 * These are *test-only* fixtures kept out of the app runtime. The production
 * app renders only what the backend returns; tests use these to exercise the
 * UI deterministically without a live API.
 */
import type { Mentor, UserProfile } from '@/types';

const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();

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
      currency: 'INR',
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
      currency: 'INR',
      durationMinutes: 90,
      isFree: false,
      description: 'Small group workshop',
      active: true,
    },
  ],
};

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
