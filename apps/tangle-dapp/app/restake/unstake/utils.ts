export function calculateTimeRemaining(
  currentRound: number,
  requestedRound: number,
  delegationBondLessDelay: number | null,
) {
  if (typeof delegationBondLessDelay !== 'number') return -1;

  const roundPassed = currentRound - requestedRound;
  if (roundPassed >= delegationBondLessDelay) return 0;

  return delegationBondLessDelay - roundPassed;
}

export function isUnstakeRequestReady(timeRemaining: number) {
  return timeRemaining === 0;
}
