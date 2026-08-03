import { z } from 'zod';

/* Optional string that may be empty (URL fields etc). */
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

const optionalDate = z.string().optional().or(z.literal(''));

/* ---------------- Edit profile ---------------- */

export const editProfileSchema = z.object({
  firstName: z.string().trim().max(50, 'First name must be 50 characters or fewer').optional().or(z.literal('')),
  lastName: z.string().trim().max(50, 'Last name must be 50 characters or fewer').optional().or(z.literal('')),
  headline: z.string().trim().max(200, 'Headline must be 200 characters or fewer').optional().or(z.literal('')),
  bio: z.string().trim().max(2000, 'Bio must be 2000 characters or fewer').optional().or(z.literal('')),
  phone: z.string().trim().max(20, 'Phone must be 20 characters or fewer').optional().or(z.literal('')),
  dateOfBirth: optionalDate,
  country: optionalText('Country must be 100 characters or fewer', 100),
  city: optionalText('City must be 100 characters or fewer', 100),
  address: optionalText('Address must be 255 characters or fewer', 255),
  timezone: optionalText('Select a valid timezone', 50),
  website: optionalUrl('Website'),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;

/* ---------------- Education ---------------- */

export const educationSchema = z
  .object({
    institution: z.string().trim().min(1, 'Institution is required').max(200, 'Institution must be 200 characters or fewer'),
    degree: z.string().trim().max(200, 'Degree must be 200 characters or fewer').optional().or(z.literal('')),
    fieldOfStudy: z.string().trim().max(200, 'Field of study must be 200 characters or fewer').optional().or(z.literal('')),
    startDate: optionalDate,
    endDate: optionalDate,
    currentlyStudying: z.boolean(),
    description: z.string().trim().max(2000, 'Description must be 2000 characters or fewer').optional().or(z.literal('')),
    grade: z.string().trim().max(50, 'Grade must be 50 characters or fewer').optional().or(z.literal('')),
  })
  .refine((data) => !data.currentlyStudying || !data.endDate, {
    message: 'Remove the end date when you are currently studying',
    path: ['endDate'],
  });

export type EducationFormValues = z.infer<typeof educationSchema>;

/* ---------------- Experience ---------------- */

export const experienceSchema = z
  .object({
    company: z.string().trim().min(1, 'Company is required').max(200, 'Company must be 200 characters or fewer'),
    title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or fewer'),
    location: z.string().trim().max(200, 'Location must be 200 characters or fewer').optional().or(z.literal('')),
    employmentType: z.string().max(50).optional().or(z.literal('')),
    startDate: optionalDate,
    endDate: optionalDate,
    currentlyWorking: z.boolean(),
    description: z.string().trim().max(2000, 'Description must be 2000 characters or fewer').optional().or(z.literal('')),
  })
  .refine((data) => !data.currentlyWorking || !data.endDate, {
    message: 'Remove the end date when this is your current role',
    path: ['endDate'],
  });

export type ExperienceFormValues = z.infer<typeof experienceSchema>;

/* ---------------- Skill ---------------- */

export const skillSchema = z.object({
  name: z.string().trim().min(1, 'Skill name is required').max(100, 'Skill must be 100 characters or fewer'),
  proficiencyLevel: z.string().max(50).optional().or(z.literal('')),
  yearsOfExperience: z.coerce
    .number()
    .min(0, 'Cannot be negative')
    .max(60, 'Enter a realistic number')
    .optional()
    .nullable(),
});

/**
 * Form values use the schema *input* type: `z.coerce.number()` accepts raw
 * form strings, so the input type is the source of truth for react-hook-form.
 */
export type SkillFormValues = z.input<typeof skillSchema>;

/* ---------------- Language ---------------- */

export const languageSchema = z.object({
  name: z.string().trim().min(1, 'Language is required').max(100, 'Language must be 100 characters or fewer'),
  proficiencyLevel: z.string().min(1, 'Select a proficiency level').max(50),
  isNative: z.boolean(),
});

export type LanguageFormValues = z.infer<typeof languageSchema>;

/* ---------------- Social links ---------------- */

export const socialLinksSchema = z.object({
  website: optionalUrl('Website'),
  linkedinUrl: optionalUrl('LinkedIn URL'),
  githubUrl: optionalUrl('GitHub URL'),
  twitterUrl: optionalUrl('X / Twitter URL'),
});

export type SocialLinksFormValues = z.infer<typeof socialLinksSchema>;
