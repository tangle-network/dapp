import { formatDuration, intervalToDuration } from 'date-fns';
import { capitalize } from 'lodash';

const formatMsDuration = (ms: number): string => {
  const duration = formatDuration(intervalToDuration({ start: 0, end: ms }));

  return capitalize(duration);
};

export default formatMsDuration;
