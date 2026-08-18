import { z } from 'zod';
import { EMAIL_PATTERN, PASSWORD_PATTERN, USERNAME_PATTERN } from '@/utils';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(EMAIL_PATTERN, 'Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    firstName: z.string().max(50, 'First name must be 50 characters or fewer').optional(),
    lastName: z.string().max(50, 'Last name must be 50 characters or fewer').optional(),
    username: z
      .string()
      .regex(USERNAME_PATTERN, '3–50 characters: letters, numbers, underscores or hyphens')
      .optional()
      .or(z.literal('')),
    email: z
      .string()
      .min(1, 'Email is required')
      .regex(EMAIL_PATTERN, 'Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        PASSWORD_PATTERN,
        'Must include uppercase, lowercase, a number and a special character (@#$%^&+=!)',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .regex(EMAIL_PATTERN, 'Enter a valid email address'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        PASSWORD_PATTERN,
        'Must include uppercase, lowercase, a number and a special character (@#$%^&+=!)',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
