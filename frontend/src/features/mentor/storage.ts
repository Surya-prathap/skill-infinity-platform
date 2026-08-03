import { STORAGE_KEYS } from '@/constants';
import type { Mentor, MentorAvailability } from '@/types';
import { getStoredValue, setStoredValue, removeStoredValue } from '@/utils/storage';
import { seedMentor } from './data';

/* ============================================================
   Registration draft — auto-saved across sessions.
   ============================================================ */

export interface MentorDraft {
  personal: {
    headline: string;
    bio: string;
    aboutMe: string;
    country: string;
    city: string;
    timezone: string;
    yearsOfExperience: number | null;
  };
  experiences: ExperienceDraft[];
  skills: SkillDraft[];
  expertise: ExpertiseDraft[];
  categories: string[];
  pricing: PricingDraft[];
  availability: AvailabilityDraft[];
  certifications: CertificationDraft[];
  verification: {
    documentType: string;
    agreedToTerms: boolean;
  };
  savedAt: string | null;
}

export interface ExperienceDraft {
  id: string;
  company: string;
  title: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
}

export interface SkillDraft {
  id: string;
  name: string;
  proficiencyLevel: string;
  yearsOfExperience: number | null;
}

export interface ExpertiseDraft {
  id: string;
  /** Category UUID, or 'CUSTOM' for a custom skill entry. */
  categoryId: string;
  categoryName: string;
  subCategoryId: string;
  subCategoryName: string;
  skillName: string;
  yearsOfExperience: number | null;
  teachingLevel: string;
  proficiencyLevel: string;
  technologies: string;
  description: string;
}

export interface PricingDraft {
  id: string;
  sessionType: string;
  price: number;
  originalPrice: number | null;
  currency: string;
  discountPercentage: number | null;
  durationMinutes: number;
  isFree: boolean;
  description: string;
}

export interface AvailabilityDraft {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  breakStartTime: string;
  breakEndTime: string;
  slotDurationMinutes: number;
  recurring: boolean;
  timezone: string;
}

export interface CertificationDraft {
  id: string;
  title: string;
  issuingOrganization: string;
  credentialId: string;
  credentialUrl: string;
  issueDate: string;
  doesNotExpire: boolean;
  description: string;
}

export const emptyDraft = (): MentorDraft => ({
  personal: {
    headline: '',
    bio: '',
    aboutMe: '',
    country: '',
    city: '',
    timezone: '',
    yearsOfExperience: null,
  },
  experiences: [],
  skills: [],
  expertise: [],
  categories: [],
  pricing: [],
  availability: [],
  certifications: [],
  verification: {
    documentType: 'PASSPORT',
    agreedToTerms: false,
  },
  savedAt: null,
});

export const loadDraft = (): MentorDraft => getStoredValue<MentorDraft>(STORAGE_KEYS.MENTOR_DRAFT, emptyDraft());

export const persistDraft = (draft: MentorDraft): void => {
  setStoredValue(STORAGE_KEYS.MENTOR_DRAFT, { ...draft, savedAt: new Date().toISOString() });
};

export const clearDraft = (): void => {
  removeStoredValue(STORAGE_KEYS.MENTOR_DRAFT);
};

/* ============================================================
   Cached mentor profile — keeps the mentor UI usable offline.
   ============================================================ */

export const loadCachedMentor = (): Mentor => getStoredValue<Mentor>(STORAGE_KEYS.MENTOR_PROFILE, seedMentor);

export const cacheMentor = (mentor: Mentor): void => {
  setStoredValue(STORAGE_KEYS.MENTOR_PROFILE, mentor);
};

/** Normalizes a server availability slot into the wizard draft shape. */
export const availabilityToDraft = (slot: MentorAvailability): AvailabilityDraft => ({
  id: slot.id ?? '',
  dayOfWeek: slot.dayOfWeek,
  startTime: slot.startTime,
  endTime: slot.endTime,
  breakStartTime: slot.breakStartTime ?? '',
  breakEndTime: slot.breakEndTime ?? '',
  slotDurationMinutes: slot.slotDurationMinutes ?? 60,
  recurring: slot.recurring,
  timezone: slot.timezone ?? '',
});
