/**
 * Pure (wagmi-free) `ExitStatus` enum + label helper.
 *
 * Split out of `useExitStatus.ts` so the enum can be imported by pure,
 * unit-testable modules (e.g. `canScheduleExit.ts`) without pulling wagmi /
 * react-query into the jest module graph — the same split precedent as
 * `binaryVersion.ts`. `useExitStatus.ts` re-exports these, so existing importers
 * (and the `data/services` barrel) resolve them unchanged.
 *
 * The enum order is load-bearing: it is the on-chain uint8 encoding of
 * tnt-core `Types.ExitStatus`.
 *   None = 0        — not in the exit queue
 *   Scheduled = 1   — exit scheduled, waiting out the queue duration
 *   Executable = 2  — queue duration elapsed, exit can be executed
 *   Completed = 3   — exit completed (operator has left)
 */
export enum ExitStatus {
  None = 0,
  Scheduled = 1,
  Executable = 2,
  Completed = 3,
}

export const getExitStatusLabel = (status: ExitStatus): string => {
  switch (status) {
    case ExitStatus.None:
      return 'None';
    case ExitStatus.Scheduled:
      return 'Scheduled';
    case ExitStatus.Executable:
      return 'Executable';
    case ExitStatus.Completed:
      return 'Completed';
    default:
      return 'Unknown';
  }
};
