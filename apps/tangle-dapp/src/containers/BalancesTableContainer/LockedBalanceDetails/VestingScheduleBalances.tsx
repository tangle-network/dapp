import { BN, BN_ZERO, formatDecimal } from '@polkadot/util';
import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import { FC, useCallback } from 'react';

import useVestingInfo from '../../../data/vesting/useVestingInfo';
import formatTangleBalance from '../../../utils/formatTangleBalance';
import BalanceCell from '../BalanceCell';
import { sortVestingSchedulesAscending } from './utils';

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
          <strong>{formatTangleBalance(amountAlreadyVested)}</strong> has
          vested, with <strong>{formatTangleBalance(remaining)}</strong>{' '}
          remaining.
        </>
      );

      return (
        <BalanceCell key={index} amount={schedule.locked} status={status} />
      );
    });
};

export default VestingScheduleBalances;
