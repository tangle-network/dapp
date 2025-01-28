import { formatDistance } from 'date-fns';
import { capitalize } from 'lodash';

const formatSessionDistance = (
  sessionsRemaining: number,
  sessionDurationMs: number,
): string => {
  const now = Date.now();
  const futureDate = new Date(now + sessionsRemaining * sessionDurationMs);

  return capitalize(formatDistance(futureDate, now));
};

export default formatSessionDistance;
