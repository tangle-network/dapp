import { BN, BN_ZERO } from '@polkadot/util';
import { FC, useCallback } from 'react';

import useVestingInfo from '../../../data/vesting/useVestingInfo';
import usePolkadotApiRx from '../../../hooks/usePolkadotApiRx';
import { formatTokenBalance } from '../../../utils/polkadot';
import BalanceCell from '../BalanceCell';

const VestingScheduleBalances: FC = () => {
  const { schedulesOpt: vestingSchedulesOpt } = useVestingInfo();

  const { data: currentBlockNumber } = usePolkadotApiRx(
    useCallback((api) => api.derive.chain.bestNumber(), [])
  );

  if (vestingSchedulesOpt === null || vestingSchedulesOpt.isNone) {
    return;
  }

  return vestingSchedulesOpt.unwrap().map((schedule, index) => {
    // Do not exceed the total locked amount in case that
    // the ending block has already passed, and the difference
    // between the current block number and the starting block
    // number exceeds the total locked amount.
    const amountAlreadyVested = currentBlockNumber?.gt(schedule.startingBlock)
      ? BN.min(
          schedule.locked,
          currentBlockNumber.sub(schedule.startingBlock).mul(schedule.perBlock)
        )
      : BN_ZERO;

    const remaining = schedule.locked.sub(amountAlreadyVested);
    const allVested = remaining.isZero();

    const status = allVested ? (
      'All tokens have vested and are ready to be claimed.'
    ) : amountAlreadyVested.isZero() ? (
      'No tokens have vested yet.'
    ) : (
      <>
        <strong>{formatTokenBalance(amountAlreadyVested)}</strong> has vested,
        with <strong>{formatTokenBalance(remaining)}</strong> remaining.
      </>
    );

    return (
      <div key={index} className="flex flex-row justify-start items-center">
        <BalanceCell amount={schedule.locked} status={status} />
      </div>
    );
  });
};

export default VestingScheduleBalances;
