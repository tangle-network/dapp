import { differenceInMilliseconds, isValid } from 'date-fns';
import { ISubQlTime } from '../types';

/**
 * Calculated the percentage of the current date have passed since the start date
 * @param startDateStr The start date string
 * @param endDateStr The end date string
 * @returns `null` when one of the provided string is invalid or the start date is in the future,
 * otherwise returns the percentage of the current date have passed since the start date
 */
export const calculateDateProgress = (
  startDateStr: string | Date | null,
  endDateStr: string | Date | null,
  now?: ISubQlTime
): number | null => {
  if (startDateStr === null || endDateStr === null) {
    return null;
  }

  // If one of two date is invalid -> Return `null`
  if (!isValid(startDateStr) || !isValid(endDateStr)) {
    return null;
  }
  const currentTime = now?.current.getTime() ?? Date.now();
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  // If the start date in to future -> Return `null`
  if (differenceInMilliseconds(currentTime, startDate) < 0) {
    return null;
  }

  const diffBetweenStartAndEnd = Math.abs(
    startDate.getTime() - endDate.getTime()
  );
  const diffBetweenStartAndNow = Math.abs(startDate.getTime() - currentTime);

  if (diffBetweenStartAndEnd === 0) {
    return null;
  }
  if (diffBetweenStartAndNow > diffBetweenStartAndEnd) {
    return 100;
  }
  return parseFloat(
    ((diffBetweenStartAndNow / diffBetweenStartAndEnd) * 100).toFixed(2)
  );
};
