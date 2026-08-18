import type { UserProfile } from '@/types';

export interface CompletionSection {
  key: string;
  label: string;
  hint: string;
  weight: number;
  complete: boolean;
}

const hasText = (value: string | undefined | null): boolean =>
  Boolean(value && value.trim().length > 0);

export const buildCompletionSections = (profile: UserProfile | null | undefined): CompletionSection[] => {
  const p = profile ?? {};
  const list = (value: unknown[] | undefined | null): boolean =>
    Array.isArray(value) && value.length > 0;

  return [
    {
      key: 'name',
      label: 'Full name',
      hint: 'Add your first and last name.',
      weight: 2,
      complete: hasText(p.firstName) && hasText(p.lastName),
    },
    {
      key: 'headline',
      label: 'Headline',
      hint: 'A short line about what you do.',
      weight: 1,
      complete: hasText(p.headline),
    },
    {
      key: 'photo',
      label: 'Profile photo',
      hint: 'Upload a clear profile picture.',
      weight: 1,
      complete: hasText(p.profilePictureUrl),
    },
    {
      key: 'bio',
      label: 'Bio',
      hint: 'Tell your story in a few sentences.',
      weight: 1,
      complete: hasText(p.bio),
    },
    {
      key: 'location',
      label: 'Location',
      hint: 'Add your country or city.',
      weight: 1,
      complete: hasText(p.country) || hasText(p.city),
    },
    {
      key: 'timezone',
      label: 'Timezone',
      hint: 'Helps mentors match your schedule.',
      weight: 1,
      complete: hasText(p.timezone),
    },
    {
      key: 'skills',
      label: 'Skills',
      hint: 'List at least one skill.',
      weight: 1,
      complete: list(p.skills),
    },
  ];
};

export interface ProfileCompletion {
  percentage: number;
  sections: CompletionSection[];
  missing: CompletionSection[];
  suggestions: string[];
}

export const computeProfileCompletion = (profile: UserProfile | null | undefined): ProfileCompletion => {
  const sections = buildCompletionSections(profile);
  const totalWeight = sections.reduce((sum, section) => sum + section.weight, 0);
  const completedWeight = sections.reduce(
    (sum, section) => sum + (section.complete ? section.weight : 0),
    0,
  );
  const percentage = totalWeight === 0 ? 0 : Math.round((completedWeight / totalWeight) * 100);
  const missing = sections.filter((section) => !section.complete);

  return {
    percentage,
    sections,
    missing,
    suggestions: missing.map((section) => section.hint),
  };
};
