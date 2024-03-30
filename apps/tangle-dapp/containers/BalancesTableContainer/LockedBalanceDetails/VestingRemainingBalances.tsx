import { BN, BN_ZERO } from '@polkadot/util';
import { FC, useCallback } from 'react';

import useVestingInfo from '../../../data/vesting/useVestingInfo';
import usePolkadotApiRx from '../../../hooks/usePolkadotApiRx';
import BalanceCell from '../BalanceCell';

const VestingRemainingBalances: FC = () => {
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

    return <BalanceCell key={index} amount={remaining} />;
  });
};

export default VestingRemainingBalances;
