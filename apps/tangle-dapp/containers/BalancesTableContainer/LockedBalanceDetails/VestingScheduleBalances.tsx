import { PalletVestingVestingInfo } from '@polkadot/types/lookup';
import { BN, BN_ZERO, formatDecimal } from '@polkadot/util';
import { FC, useCallback } from 'react';

import useVestingInfo from '../../../data/vesting/useVestingInfo';
import useApiRx from '../../../hooks/useApiRx';
import formatTangleAmount from '../../../utils/formatTangleAmount';
import BalanceCell from '../BalanceCell';

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

const VestingScheduleBalances: FC = () => {
  const { schedulesOpt: vestingSchedulesOpt } = useVestingInfo();

  const { result: currentBlockNumber } = useApiRx(
    useCallback((api) => api.derive.chain.bestNumber(), []),
  );

  if (vestingSchedulesOpt === null || vestingSchedulesOpt.isNone) {
    return;
  }

  return vestingSchedulesOpt
    .unwrap()
    .toSorted(sortVestingSchedulesAscending)
    .map((schedule, index) => {
      // Do not exceed the total locked amount in case that
      // the ending block has already passed, and the difference
      // between the current block number and the starting block
      // number exceeds the total locked amount.
      const amountAlreadyVested = currentBlockNumber?.gt(schedule.startingBlock)
        ? BN.min(
            schedule.locked,
            currentBlockNumber
              .sub(schedule.startingBlock)
              .mul(schedule.perBlock),
          )
        : BN_ZERO;

      const remaining = schedule.locked.sub(amountAlreadyVested);
      const allVested = remaining.isZero();

      // The unlock column already shows a status message about the
      // tokens being fully vested, so don't repeat it here.
      const status = allVested ? undefined : amountAlreadyVested.isZero() ? (
        `No tokens have vested yet. This vesting schedule will start unlocking at block #${formatDecimal(
          schedule.startingBlock.toString(),
        )}.`
      ) : (
        <>
          <strong>{formatTangleAmount(amountAlreadyVested)}</strong> has vested,
          with <strong>{formatTangleAmount(remaining)}</strong> remaining.
        </>
      );

      return (
        <BalanceCell key={index} amount={schedule.locked} status={status} />
      );
    });
};

export default VestingScheduleBalances;
