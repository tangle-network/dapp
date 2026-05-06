export const calculateTimeRemaining = (
  currentRound: number,
  requestedRound: number,
  delay: number | null,
): number => {
  // Not enough information available yet.
  if (typeof delay !== 'number') {
    return -1;
  }

  const roundPassed = currentRound - requestedRound;

  if (roundPassed >= delay) {
    return 0;
  }

  return delay - roundPassed;
};

export const isScheduledRequestReady = (timeRemaining: number): boolean => {
  return timeRemaining === 0;
};
