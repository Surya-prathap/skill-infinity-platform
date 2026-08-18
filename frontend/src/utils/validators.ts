/**
 * Client-side validation helpers. Rules mirror the identity-service
 * RegisterRequest constraints so the UI and API agree.
 */

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Matches backend: at least one digit, lowercase, uppercase and special char, min 8.
export const PASSWORD_PATTERN = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,}$/;

export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,50}$/;

export const isEmail = (value: string): boolean => EMAIL_PATTERN.test(value);

export const isStrongPassword = (value: string): boolean => PASSWORD_PATTERN.test(value);

export const isUsername = (value: string): boolean => USERNAME_PATTERN.test(value);

export const passwordRequirements = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'One number', test: (v: string) => /[0-9]/.test(v) },
  { label: 'One special character (@#$%^&+=!)', test: (v: string) => /[@#$%^&+=!]/.test(v) },
] as const;
