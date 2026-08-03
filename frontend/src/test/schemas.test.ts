import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema, forgotPasswordSchema } from '@/features/auth/schemas';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'secret', rememberMe: true });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = loginSchema.safeParse({ email: 'nope', password: 'secret', rememberMe: false });
    expect(result.success).toBe(false);
  });

  it('rejects a missing password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: '', rememberMe: false });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('accepts a valid registration', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      username: 'jane_doe',
      password: 'StrongPass1!',
      confirmPassword: 'StrongPass1!',
    });
    expect(result.success).toBe(true);
  });

  it('rejects weak passwords', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'short',
      confirmPassword: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      email: 'user@example.com',
      password: 'StrongPass1!',
      confirmPassword: 'Different1!',
    });
    expect(result.success).toBe(false);
  });
});

describe('forgotPasswordSchema', () => {
  it('rejects an empty email', () => {
    const result = forgotPasswordSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });
});
