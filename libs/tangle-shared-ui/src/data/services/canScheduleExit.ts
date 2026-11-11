/**
 * Pure (wagmi-free) schedule-exit eligibility mapping.
 *
 * Split out of `useCanScheduleExit.ts` so it can be unit-tested without pulling
 * wagmi / react-query (ESM) into the jest module graph — the same split as
 * `binaryVersion.ts` / `slashProposal.ts`. The hook module re-exports these, so
 * consumers see no change.
 *
 * tnt-core 0.19 removed the boolean `canScheduleExit(uint64,address)` view but
 * keeps `getExitStatus`, which returns the operator's position in the exit
 * lifecycle. Schedule-exit eligibility is derivable from it: only an operator
 * not already in the queue (`ExitStatus.None`) may schedule a new exit.
 */

import { ExitStatus } from './exitStatus';

export interface CanScheduleExitResult {
  canExit: boolean;
  reason: string;
}

/**
 * Maps an on-chain `ExitStatus` to schedule-exit eligibility. An operator can
 * schedule an exit only when they are not already somewhere in the exit
 * lifecycle; any other status means a request already exists (or has completed)
 * so the Schedule-Exit action must stay gated off. The chain still enforces
 * this at `scheduleExit` time — this read only drives the UI affordance.
 */
export const mapExitStatusToEligibility = (
  status: ExitStatus,
): CanScheduleExitResult => {
  switch (status) {
    case ExitStatus.None:
      return { canExit: true, reason: '' };
    case ExitStatus.Scheduled:
      return {
        canExit: false,
        reason: 'An exit is already scheduled for this service.',
      };
    case ExitStatus.Executable:
      return {
        canExit: false,
        reason: 'An exit is already scheduled and ready to execute.',
      };
    case ExitStatus.Completed:
      return {
        canExit: false,
        reason: 'You have already exited this service.',
      };
    default:
      return {
        canExit: false,
        reason: 'Exit eligibility could not be determined.',
      };
  }
};
