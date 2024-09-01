export function calculateTimeRemaining(
  currentRound: number,
  requestedRound: number,
  delay: number | null,
) {
  if (typeof delay !== 'number') return -1;

  const roundPassed = currentRound - requestedRound;
  if (roundPassed >= delay) return 0;

  return delay - roundPassed;
}

export function isScheduledRequestReady(timeRemaining: number) {
  return timeRemaining === 0;
}

export function tvlToDisplay(tvl: number) {
  if (Number.isNaN(tvl) || tvl === 0) return '--';

  return `$${tvl}`;
}
