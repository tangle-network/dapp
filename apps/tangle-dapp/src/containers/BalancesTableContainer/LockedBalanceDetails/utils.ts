import { PalletVestingVestingInfo } from '@polkadot/types/lookup';

/**
 * Sort by ending block number in ascending order. This will
 * effectively show the vesting schedules that will end/unlock
 * sooner first.
 */
export const sortVestingSchedulesAscending = (
  a: PalletVestingVestingInfo,
  b: PalletVestingVestingInfo,
): 0 | 1 | -1 => {
  const endingBlockNumberOfA = a.startingBlock.add(a.locked.div(a.perBlock));
  const endingBlockNumberOfB = b.startingBlock.add(b.locked.div(b.perBlock));

  return endingBlockNumberOfA.cmp(endingBlockNumberOfB);
};
