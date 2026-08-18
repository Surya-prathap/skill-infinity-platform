import dayjs, { type Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * The platform's canonical application timezone. Sessions, availability and
 * timestamps are interpreted in Asia/Kolkata end-to-end (DB wall-clock,
 * backend JVM, serialized JSON). The frontend parses backend timestamps as
 * this zone and only converts to the browser's local zone when displaying
 * relative times — never re-interpreting them as naive local strings.
 */
export const APP_TIMEZONE = 'Asia/Kolkata';

/**
 * Parses a backend timestamp into an instant anchored at Asia/Kolkata.
 *
 * Backend entities use LocalDateTime and serialize WITHOUT an offset
 * (e.g. "2026-08-16T15:30:00"). Parsing such a string as browser-local time
 * misreads it by the UTC→IST gap — a record created "right now" would show
 * "6 hours ago". Anchoring at the application timezone fixes the display
 * while `.fromNow()`/`.format()` still convert to the browser's zone.
 */
export const parseApiTime = (value: string | Date | null | undefined): Dayjs | null => {
  if (!value) return null;
  return dayjs.tz(value, APP_TIMEZONE);
};

/** Current wall-clock instant in the application timezone (Asia/Kolkata). */
export const nowInAppZone = (): Dayjs => dayjs.tz(dayjs(), APP_TIMEZONE);

/**
 * Converts a browser-local wall-clock datetime (e.g. from a date/time picker)
 * into the application timezone's wall-clock string "YYYY-MM-DDTHH:mm:ss" —
 * the exact shape the backend persists as LocalDateTime.
 */
export const toAppZoneString = (localWallClock: string): string =>
  dayjs(localWallClock).tz(APP_TIMEZONE).format('YYYY-MM-DDTHH:mm:ss');
