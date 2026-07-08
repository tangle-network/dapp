/**
 * Schedule-exit eligibility mapping coverage.
 *
 * tnt-core 0.19 removed the boolean `canScheduleExit` view, so on v019 chains
 * `useCanScheduleExit` derives eligibility from `getExitStatus` via
 * `mapExitStatusToEligibility`. These tests pin the enum -> eligibility mapping:
 * only `ExitStatus.None` is schedule-eligible; every already-in-queue /
 * completed status gates the Schedule-Exit action off. A slip here would either
 * hide the action from operators who can exit, or offer it to operators already
 * mid-exit (the chain would then revert their tx).
 *
 * Imports the pure `canScheduleExit` module directly so the test never pulls
 * wagmi / react-query into the jest module graph — same split as the
 * `binaryVersion` / `slashProposal` revision specs.
 */

import { mapExitStatusToEligibility } from './canScheduleExit';
import { ExitStatus } from './exitStatus';

describe('mapExitStatusToEligibility', () => {
  it('allows scheduling only when the operator is not in the exit queue (None)', () => {
    const result = mapExitStatusToEligibility(ExitStatus.None);
    expect(result.canExit).toBe(true);
    expect(result.reason).toBe('');
  });

  it('blocks scheduling when an exit is already Scheduled', () => {
    const result = mapExitStatusToEligibility(ExitStatus.Scheduled);
    expect(result.canExit).toBe(false);
    expect(result.reason).toMatch(/already scheduled/i);
  });

  it('blocks scheduling when the exit is Executable', () => {
    const result = mapExitStatusToEligibility(ExitStatus.Executable);
    expect(result.canExit).toBe(false);
    expect(result.reason).toMatch(/ready to execute/i);
  });

  it('blocks scheduling when the exit is already Completed', () => {
    const result = mapExitStatusToEligibility(ExitStatus.Completed);
    expect(result.canExit).toBe(false);
    expect(result.reason).toMatch(/already exited/i);
  });

  it('fails closed on an unknown status', () => {
    const result = mapExitStatusToEligibility(99 as ExitStatus);
    expect(result.canExit).toBe(false);
    expect(result.reason).toMatch(/could not be determined/i);
  });

  it('is exhaustive over the on-chain enum: exactly None is eligible', () => {
    const statuses = [
      ExitStatus.None,
      ExitStatus.Scheduled,
      ExitStatus.Executable,
      ExitStatus.Completed,
    ];
    const eligible = statuses.filter(
      (s) => mapExitStatusToEligibility(s).canExit,
    );
    expect(eligible).toEqual([ExitStatus.None]);
  });
});
