import { z } from 'zod';

/**
 * Converts a raw form value (string | number | null | undefined) into a
 * number or null. `z.coerce.number()` exposes an `unknown` input type, so
 * editors funnel optional numbers through this before persisting.
 */
export const toOptionalNumber = (value: unknown): number | null => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

/* Optional string that may be empty. */
const optionalText = (message: string, max: number) =>
  z.string().trim().max(max, message).optional().or(z.literal(''));

const optionalUrl = (label: string) =>
  z
    .string()
    .trim()
    .max(500, `${label} must be 500 characters or fewer`)
    .refine((value) => value === '' || /^https?:\/\/.+/.test(value), {
      message: 'Enter a valid URL starting with http(s)://',
    })
    .optional()
    .or(z.literal(''));

/** Backend expects 24h HH:mm (e.g. "09:00"). */
const timePattern = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24h format, e.g. 09:00');

/* ============================================================
   Wizard step schemas
   ============================================================ */

export const personalSchema = z.object({
  headline: z
    .string()
    .trim()
    .min(8, 'Write a headline of at least 8 characters')
    .max(200, 'Headline must be 200 characters or fewer'),
  bio: optionalText('Bio must be 2000 characters or fewer', 2000),
  aboutMe: optionalText('About me must be 5000 characters or fewer', 5000),
  country: optionalText('Country must be 50 characters or fewer', 50),
  city: optionalText('City must be 50 characters or fewer', 50),
  timezone: optionalText('Select a valid timezone', 50),
  yearsOfExperience: z.coerce
    .number()
    .min(0, 'Cannot be negative')
    .max(60, 'Enter a realistic number')
    .optional()
    .nullable(),
});

export type PersonalFormValues = z.input<typeof personalSchema>;

export const experienceSchema = z
  .object({
    company: z.string().trim().min(1, 'Company is required').max(200, 'Company must be 200 characters or fewer'),
    title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
    location: optionalText('Location must be 200 characters or fewer', 200),
    employmentType: z.string().max(50).optional().or(z.literal('')),
    startDate: z.string().optional().or(z.literal('')),
    endDate: z.string().optional().or(z.literal('')),
    currentlyWorking: z.boolean(),
    description: optionalText('Description must be 2000 characters or fewer', 2000),
  })
  .refine((data) => !data.currentlyWorking || !data.endDate, {
    message: 'Remove the end date when this is your current role',
    path: ['endDate'],
  });

export type ExperienceFormValues = z.input<typeof experienceSchema>;

export const skillSchema = z.object({
  name: z.string().trim().min(1, 'Skill name is required').max(100, 'Skill must be 100 characters or fewer'),
  proficiencyLevel: z.string().min(1, 'Select a proficiency level').max(50),
  yearsOfExperience: z.coerce
    .number()
    .min(0, 'Cannot be negative')
    .max(60, 'Enter a realistic number')
    .optional()
    .nullable(),
});

export type SkillFormValues = z.input<typeof skillSchema>;

export const expertiseSchema = z.object({
  categoryId: z.string().min(1, 'Select a category'),
  subCategoryId: z.string().optional().or(z.literal('')),
  skillName: z.string().trim().min(1, 'Add a skill you teach').max(100, 'Skill must be 100 characters or fewer'),
  yearsOfExperience: z.coerce
    .number()
    .min(0, 'Cannot be negative')
    .max(60, 'Enter a realistic number')
    .optional()
    .nullable(),
  teachingLevel: z.string().min(1, 'Select a teaching level').max(30),
  proficiencyLevel: z.string().min(1, 'Select your proficiency').max(30),
  technologies: optionalText('Technologies must be 500 characters or fewer', 500),
  description: optionalText('Description must be 1000 characters or fewer', 1000),
});

export type ExpertiseFormValues = z.input<typeof expertiseSchema>;

export const pricingSchema = z
  .object({
    sessionType: z.string().min(1, 'Select a session type'),
    price: z.coerce.number().min(1, 'Price must be greater than 0').max(10000, 'Enter a realistic price'),
    originalPrice: z.coerce.number().min(0).max(10000).optional().nullable(),
    currency: z.string().min(1, 'Select a currency').max(3),
    discountPercentage: z.coerce
      .number()
      .min(0, 'Cannot be negative')
      .max(90, 'Discount cannot exceed 90%')
      .optional()
      .nullable(),
    durationMinutes: z.coerce.number().min(15, 'Minimum 15 minutes').max(480, 'Maximum 8 hours'),
    isFree: z.boolean(),
    description: optionalText('Description must be 500 characters or fewer', 500),
  })
  .superRefine((data, ctx) => {
    if (!data.isFree && (!data.price || data.price <= 0)) {
      ctx.addIssue({ code: 'custom', path: ['price'], message: 'Set a price or mark the session as free' });
    }
  });

export type PricingFormValues = z.input<typeof pricingSchema>;

export const availabilitySchema = z
  .object({
    dayOfWeek: z.string().min(1, 'Select a day'),
    startTime: timePattern,
    endTime: timePattern,
    breakStartTime: z.string().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24h format').optional().or(z.literal('')),
    breakEndTime: z.string().regex(/^$|^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24h format').optional().or(z.literal('')),
    slotDurationMinutes: z.coerce.number().min(15, 'Minimum 15 minutes').max(180, 'Maximum 3 hours'),
    recurring: z.boolean(),
    timezone: optionalText('Select a timezone', 50),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export type AvailabilityFormValues = z.input<typeof availabilitySchema>;

export const certificationSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
    issuingOrganization: z
      .string()
      .trim()
      .min(1, 'Issuing organization is required')
      .max(200, 'Organization must be 200 characters or fewer'),
    credentialId: optionalText('Credential ID must be 200 characters or fewer', 200),
    credentialUrl: optionalUrl('Credential URL'),
    issueDate: z.string().optional().or(z.literal('')),
    doesNotExpire: z.boolean(),
    description: optionalText('Description must be 1000 characters or fewer', 1000),
  })
  .refine((data) => data.doesNotExpire || data.issueDate !== '', {
    message: 'Add an issue date when the certification expires',
    path: ['issueDate'],
  });

export type CertificationFormValues = z.input<typeof certificationSchema>;

/* ============================================================
   Draft validation — used on the preview step before submit.
   ============================================================ */

export const draftValidation = z.object({
  personal: z.object({
    headline: z.string().trim().min(1, 'Add your headline'),
  }),
  experiences: z.array(experienceSchema).min(1, 'Add at least one professional experience'),
  skills: z.array(skillSchema).min(1, 'Add at least one skill'),
  expertise: z.array(expertiseSchema).min(1, 'Add at least one expertise entry'),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  pricing: z.array(pricingSchema).min(1, 'Add at least one pricing plan'),
  availability: z.array(availabilitySchema).min(1, 'Add at least one availability slot'),
});
