import { isValid, parseISO } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';

/**
 * Format a `date` to UTC string
 * @param dateArg Represents the `value` to parse to UTC format
 * @returns the string represents the utc format of the given date
 */
export const formatDateToUtc = (dateArg: string | Date | null): string => {
  if (!dateArg) {
    return 'TBD';
  }

  if (!isValid(dateArg)) {
    throw new Error('Please provide valid date object');
  }

  let dateISO: Date;
  if (typeof dateArg === 'string') {
    dateISO = parseISO(new Date(dateArg).toISOString());
  } else {
    dateISO = parseISO(dateArg.toISOString());
  }
  return format(utcToZonedTime(dateISO, 'UTC'), "MMM dd (HH:mm:ss a 'UTC')", { timeZone: 'UTC' });
};
