import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { parseApiTime } from './dateTime';

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

/**
 * All formatters parse backend timestamps through parseApiTime so the
 * serialized LocalDateTime wall-clock (Asia/Kolkata) is never misread as
 * browser-local time. Relative times are converted to the browser's zone.
 */
export const formatDate = (value: string | Date | null | undefined, format = 'MMM D, YYYY'): string =>
  value ? (parseApiTime(value)?.format(format) ?? '—') : '—';

export const formatDateTime = (value: string | Date | null | undefined): string =>
  value ? (parseApiTime(value)?.format('MMM D, YYYY h:mm A') ?? '—') : '—';

export const formatTime = (value: string | Date | null | undefined): string =>
  value ? (parseApiTime(value)?.format('h:mm A') ?? '—') : '—';

export const formatRelativeTime = (value: string | Date | null | undefined): string =>
  value ? (parseApiTime(value)?.fromNow() ?? '—') : '—';

/* Intl.NumberFormat instances are expensive to construct (~1ms each) and are
   recreated on every call here. Data-heavy pages (subscription, wallet, admin
   and mentor dashboards) format dozens of values per render — caching the
   formatter per (locale, currency, digits) keeps formatting cheap. */
const currencyFormatterCache = new Map<string, Intl.NumberFormat>();
const numberFormatterCache = new Map<string, Intl.NumberFormat>();

const currencyFormatter = (locale: string, currency: string, integer: boolean): Intl.NumberFormat => {
  const key = `${locale}:${currency}:${integer ? 'int' : 'dec'}`;
  let formatter = currencyFormatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: integer ? 0 : 2,
      maximumFractionDigits: 2,
    });
    currencyFormatterCache.set(key, formatter);
  }
  return formatter;
};

export const formatCurrency = (amount: number, currency = 'INR', locale = 'en-IN'): string =>
  currencyFormatter(locale, currency, Number.isInteger(amount)).format(amount);

export const formatNumber = (value: number, locale = 'en-US'): string => {
  let formatter = numberFormatterCache.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale);
    numberFormatterCache.set(locale, formatter);
  }
  return formatter.format(value);
};

export const formatCompactNumber = (value: number, locale = 'en-US'): string => {
  const key = `${locale}:compact`;
  let formatter = numberFormatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 });
    numberFormatterCache.set(key, formatter);
  }
  return formatter.format(value);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let size = bytes / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[unitIndex]}`;
};

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

export const isToday = (value: string | Date): boolean =>
  Boolean(parseApiTime(value)?.isSame(dayjs(), 'day'));
