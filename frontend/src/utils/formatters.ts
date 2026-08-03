import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

export const formatDate = (value: string | Date | null | undefined, format = 'MMM D, YYYY'): string =>
  value ? dayjs(value).format(format) : '—';

export const formatDateTime = (value: string | Date | null | undefined): string =>
  value ? dayjs(value).format('MMM D, YYYY h:mm A') : '—';

export const formatTime = (value: string | Date | null | undefined): string =>
  value ? dayjs(value).format('h:mm A') : '—';

export const formatRelativeTime = (value: string | Date | null | undefined): string =>
  value ? dayjs(value).fromNow() : '—';

export const formatCurrency = (amount: number, currency = 'USD', locale = 'en-US'): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);

export const formatNumber = (value: number, locale = 'en-US'): string =>
  new Intl.NumberFormat(locale).format(value);

export const formatCompactNumber = (value: number, locale = 'en-US'): string =>
  new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value);

export const truncate = (value: string, maxLength = 60): string =>
  value.length > maxLength ? `${value.slice(0, maxLength - 3)}…` : value;

export const initials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.trim().charAt(0) ?? '';
  const last = lastName?.trim().charAt(0) ?? '';
  if (first || last) return `${first}${last}`.toUpperCase();
  return '?';
};

export const initialsFromEmail = (email?: string): string => {
  if (!email) return '?';
  const [localPart] = email.split('@');
  const name = (localPart ?? '?').slice(0, 2).toUpperCase();
  return name || '?';
};

export const isToday = (value: string | Date): boolean => dayjs(value).isSame(dayjs(), 'day');
