/**
 * User profile types — mirror the user-service DTOs
 * (UserProfileResponse, EducationResponse, ExperienceResponse,
 * SkillResponse, LanguageResponse) so the API contract is exact.
 */

export interface Education {
  id?: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  currentlyStudying?: boolean;
  description?: string;
  grade?: string;
  sortOrder?: number;
}

export interface Experience {
  id?: string;
  company: string;
  title: string;
  location?: string;
  employmentType?: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking?: boolean;
  description?: string;
  sortOrder?: number;
}

export interface Skill {
  id?: string;
  name: string;
  proficiencyLevel?: string;
  yearsOfExperience?: number;
  sortOrder?: number;
}

export interface Language {
  id?: string;
  name: string;
  proficiencyLevel?: string;
  isNative?: boolean;
  sortOrder?: number;
}

export interface UserProfile {
  id?: string;
  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  address?: string;
  timezone?: string;
  profilePictureUrl?: string;
  resumeUrl?: string;
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  /** Client-side only: displayed in the profile & resume views. */
  certifications?: string[];
  profileCompletionPercentage?: number;
  educations?: Education[];
  experiences?: Experience[];
  skills?: Skill[];
  languages?: Language[];
  createdAt?: string;
  updatedAt?: string;
}

/* ---------------- Request payloads (mirror backend) ---------------- */

export type UpdateProfileRequest = Partial<
  Pick<
    UserProfile,
    | 'firstName'
    | 'lastName'
    | 'headline'
    | 'bio'
    | 'phone'
    | 'dateOfBirth'
    | 'country'
    | 'city'
    | 'address'
    | 'timezone'
    | 'website'
    | 'linkedinUrl'
    | 'githubUrl'
    | 'twitterUrl'
    | 'certifications'
    // Client-side only: the backend ignores unknown fields, so photo and
    // resume URLs round-trip through the React Query cache + local storage.
    | 'profilePictureUrl'
    | 'resumeUrl'
  >
>;

export type CreateProfileRequest = Partial<
  Pick<
    UserProfile,
    | 'firstName'
    | 'lastName'
    | 'headline'
    | 'bio'
    | 'phone'
    | 'dateOfBirth'
    | 'country'
    | 'city'
    | 'website'
    | 'linkedinUrl'
    | 'githubUrl'
  >
>;

export type EducationRequest = Omit<Education, 'id'>;
export type ExperienceRequest = Omit<Experience, 'id'>;
export type SkillRequest = Omit<Skill, 'id'>;
export type LanguageRequest = Omit<Language, 'id'>;
