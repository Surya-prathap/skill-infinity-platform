import { describe, expect, it } from 'vitest';
import { buildCompletionSections, computeProfileCompletion } from '@/features/profile/profileCompletion';
import type { UserProfile } from '@/types';

const emptyProfile: UserProfile = { email: 'user@example.com' };

const fullProfile: UserProfile = {
  email: 'user@example.com',
  firstName: 'Alex',
  lastName: 'Morgan',
  headline: 'Senior Engineer',
  bio: 'I build things.',
  profilePictureUrl: 'data:image/png;base64,abc',
  country: 'United States',
  city: 'Austin',
  timezone: 'America/Chicago',
  linkedinUrl: 'https://linkedin.com/in/alex',
  educations: [{ institution: 'UT Austin' }],
  experiences: [{ company: 'Lumina', title: 'Engineer' }],
  skills: [{ name: 'React' }],
  languages: [{ name: 'English' }],
  resumeUrl: 'data:application/pdf;base64,abc',
};

describe('computeProfileCompletion', () => {
  it('returns 0% for an empty profile', () => {
    const result = computeProfileCompletion(emptyProfile);
    expect(result.percentage).toBe(0);
    expect(result.missing.length).toBeGreaterThan(0);
  });

  it('returns 100% for a fully completed profile', () => {
    const result = computeProfileCompletion(fullProfile);
    expect(result.percentage).toBe(100);
    expect(result.missing).toHaveLength(0);
  });

  it('lists exactly the missing sections as suggestions', () => {
    const partial: UserProfile = { email: 'x@y.com', firstName: 'Alex', lastName: 'Morgan' };
    const result = computeProfileCompletion(partial);
    expect(result.missing.some((section) => section.key === 'bio')).toBe(true);
    expect(result.suggestions.length).toBe(result.missing.length);
    expect(result.percentage).toBeGreaterThan(0);
    expect(result.percentage).toBeLessThan(100);
  });

  it('weights name completion higher', () => {
    const sections = buildCompletionSections(emptyProfile);
    const nameSection = sections.find((section) => section.key === 'name');
    expect(nameSection?.weight).toBe(2);
  });
});
