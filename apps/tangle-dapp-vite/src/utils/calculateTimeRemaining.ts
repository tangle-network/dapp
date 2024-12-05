import { formatDistance } from 'date-fns';
import capitalize from 'lodash/capitalize';

function calculateTimeRemaining(futureDate: Date, currentDate?: Date): string {
  return capitalize(formatDistance(futureDate, currentDate ?? new Date()));
}

export default calculateTimeRemaining;
