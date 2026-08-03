import { describe, expect, it } from 'vitest';
import { EMAIL_PATTERN, PASSWORD_PATTERN, isEmail, isStrongPassword, isUsername } from '@/utils';
import { formatCurrency, formatDate, initials, truncate } from '@/utils';

describe('validators', () => {
  it('validates emails', () => {
    expect(isEmail('user@example.com')).toBe(true);
    expect(isEmail('not-an-email')).toBe(false);
    expect(EMAIL_PATTERN.test('a@b.co')).toBe(true);
  });

  it('validates strong passwords', () => {
    expect(isStrongPassword('StrongPass1!')).toBe(true);
    expect(isStrongPassword('weak')).toBe(false);
    expect(PASSWORD_PATTERN.test('NoNumber!')).toBe(false);
  });

  it('validates usernames', () => {
    expect(isUsername('john_doe-123')).toBe(true);
    expect(isUsername('a')).toBe(false);
    expect(isUsername('has space')).toBe(false);
  });
});

describe('formatters', () => {
  it('formats currency', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50');
  });

  it('formats dates', () => {
    expect(formatDate('2026-08-06')).toBe('Aug 6, 2026');
    expect(formatDate(null)).toBe('—');
  });

  it('derives initials', () => {
    expect(initials('Sarah', 'Chen')).toBe('SC');
    expect(initials(undefined, undefined)).toBe('?');
  });

  it('truncates long strings', () => {
    const long = 'x'.repeat(100);
    expect(truncate(long, 10)).toBe('xxxxxxx…');
    expect(truncate('short')).toBe('short');
  });
});
