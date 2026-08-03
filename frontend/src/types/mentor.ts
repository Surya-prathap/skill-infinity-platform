/**
 * Mentor domain types — mirror the mentor-service DTOs
 * (MentorResponse, MentorProfileResponse, ExpertiseResponse,
 * AvailabilityResponse, PricingResponse, CertificationResponse,
 * DashboardResponse, CategoryResponse) so the API contract is exact.
 */

/* ---------------- Taxonomy ---------------- */

export interface SubCategory {
  id: string;
  categoryId?: string;
  name: string;
  slug?: string;
  description?: string;
  displayOrder?: number;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  iconUrl?: string;
  displayOrder?: number;
  subCategories: SubCategory[];
}

/* ---------------- Profile ---------------- */

export interface MentorProfile {
  id?: string;
  bio?: string;
  headline?: string;
  aboutMe?: string;
  profilePictureUrl?: string;
  coverImageUrl?: string;
  country?: string;
  city?: string;
  timezone?: string;
  phone?: string;
  website?: string;
  yearsOfExperience?: number;
  teachingLevel?: string;
  profileCompletionPercentage?: number;
  profileVisible?: boolean;
  acceptingStudents?: boolean;
  maxStudents?: number;
  createdAt?: string;
  updatedAt?: string;
}

/* ---------------- Expertise ---------------- */

export interface MentorExpertise {
  id?: string;
  categoryId?: string;
  categoryName?: string;
  subCategoryId?: string;
  subCategoryName?: string;
  skillId?: string;
  skillName?: string;
  customSkillName?: string;
  yearsOfExperience?: number;
  teachingLevel?: string;
  proficiencyLevel?: string;
  description?: string;
  learningDomains?: string;
  technologies?: string;
  displayOrder?: number;
}

/* ---------------- Availability ---------------- */

export interface TimeSlot {
  id?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  sessionId?: string;
}

export interface MentorAvailability {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  slotDurationMinutes?: number;
  recurring: boolean;
  specificDate?: string;
  active?: boolean;
  timezone?: string;
  timeSlots?: TimeSlot[];
}

/* ---------------- Pricing ---------------- */

export interface MentorPricing {
  id?: string;
  sessionType: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  discountPercentage?: number;
  durationMinutes?: number;
  isFree: boolean;
  description?: string;
  active?: boolean;
}

/* ---------------- Certifications & achievements ---------------- */

export interface MentorCertification {
  id?: string;
  title: string;
  issuingOrganization: string;
  credentialId?: string;
  credentialUrl?: string;
  issueDate?: string;
  expiryDate?: string;
  doesNotExpire: boolean;
  description?: string;
  verificationStatus?: string;
  fileUrl?: string;
  sortOrder?: number;
}

export interface MentorAchievement {
  id?: string;
  title: string;
  description?: string;
  type?: string;
  dateAchieved?: string;
  issuer?: string;
  url?: string;
  sortOrder?: number;
}

export interface MentorLanguage {
  id?: string;
  name: string;
  proficiencyLevel?: string;
  isNative?: boolean;
  sortOrder?: number;
}

/* ---------------- Statistics & preferences ---------------- */

export interface MentorStatistics {
  id?: string;
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  upcomingSessions: number;
  averageRating: number;
  totalReviews: number;
  totalStudents: number;
  totalEarnings: number;
  responseRate: number;
  responseTimeMinutes?: number;
}

export interface MentorPreference {
  id?: string;
  autoApproveSessions: boolean;
  advanceBookingDays?: number;
  cancellationHours?: number;
  maxStudentsPerSession?: number;
  sessionPreparationMinutes?: number;
  bufferMinutesBetweenSessions?: number;
  notificationOnBooking: boolean;
  notificationOnCancellation: boolean;
}

/* ---------------- Mentor (full response) ---------------- */

export interface Mentor {
  id: string;
  userId: string;
  status?: string;
  verified: boolean;
  verifiedAt?: string;
  profile: MentorProfile;
  expertiseList?: MentorExpertise[];
  availabilities?: MentorAvailability[];
  pricingList?: MentorPricing[];
  languages?: MentorLanguage[];
  certifications?: MentorCertification[];
  achievements?: MentorAchievement[];
  experiences?: ExperienceEntry[];
  educationList?: EducationEntry[];
  preference?: MentorPreference;
  statistics?: MentorStatistics;
  createdAt?: string;
  updatedAt?: string;
}

/** Reuses the user-service experience shape (company/title etc.). */
export interface ExperienceEntry {
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

export interface EducationEntry {
  id?: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  currentlyStudying?: boolean;
  description?: string;
  sortOrder?: number;
}

/* ---------------- Dashboard ---------------- */

export interface DashboardData {
  profile?: MentorProfile;
  statistics?: MentorStatistics;
  preferences?: MentorPreference;
  upcomingSessions: number;
  pendingRequests: number;
  availabilitySummary?: MentorAvailability[];
  missingProfileFields?: string[];
}

/* ---------------- Request payloads (mirror backend) ---------------- */

export interface BecomeMentorRequest {
  headline: string;
  bio?: string;
  aboutMe?: string;
  country?: string;
  city?: string;
  timezone?: string;
  yearsOfExperience?: number;
}

export type UpdateMentorProfileRequest = Partial<
  Pick<
    MentorProfile,
    | 'headline'
    | 'bio'
    | 'aboutMe'
    | 'country'
    | 'city'
    | 'timezone'
    | 'phone'
    | 'website'
    | 'yearsOfExperience'
    | 'teachingLevel'
    | 'profileVisible'
    | 'acceptingStudents'
    | 'maxStudents'
  >
>;

export type AvailabilityRequest = Omit<MentorAvailability, 'id' | 'timeSlots' | 'active'>;

export interface PricingRequest {
  sessionType: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  discountPercentage?: number;
  durationMinutes?: number;
  isFree: boolean;
  description?: string;
}

export type CertificationRequest = Omit<MentorCertification, 'id' | 'verificationStatus'>;

export type ExpertiseRequest = Omit<MentorExpertise, 'id' | 'categoryName' | 'subCategoryName' | 'skillName'>;
