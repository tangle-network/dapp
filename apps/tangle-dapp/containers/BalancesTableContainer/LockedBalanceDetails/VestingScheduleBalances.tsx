import { BN, BN_ZERO } from '@polkadot/util';
import { LockUnlockLineIcon } from '@webb-tools/icons';
import { FC, useCallback } from 'react';

import useVestingInfo from '../../../data/vesting/useVestingInfo';
import useVestTx from '../../../data/vesting/useVestTx';
import usePolkadotApiRx from '../../../hooks/usePolkadotApiRx';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import { formatTokenBalance } from '../../../utils/polkadot';
import BalanceAction from '../BalanceAction';
import BalanceCell from '../BalanceCell';

const VestingScheduleBalances: FC = () => {
  const { execute: executeVestTx, status: vestTxStatus } = useVestTx();

  const { data: currentBlockNumber } = usePolkadotApiRx(
    useCallback((api) => api.derive.chain.bestNumber(), [])
  );

  const {
    schedulesOpt: vestingSchedulesOpt,
    hasClaimableTokens: hasClaimableVestingTokens,
  } = useVestingInfo();

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
        <strong>{formatTokenBalance(amountAlreadyVested)}</strong> has already
        vested, with <strong>{formatTokenBalance(remaining)}</strong> remaining.
      </>
    );

    return (
      <div key={index} className="flex flex-row justify-between items-center">
        <BalanceCell amount={schedule.locked} status={status} />

        <BalanceAction
          Icon={LockUnlockLineIcon}
          onClick={executeVestTx !== null ? executeVestTx : undefined}
          isDisabled={
            executeVestTx === null ||
            // Cannot vest tokens if there is a pending vest transaction.
            vestTxStatus === TxStatus.PROCESSING ||
            // Prevent the user from attempting to claim tokens when none
            // have vested yet. Otherwise, it would have no effect and possibly
            // incur unnecessary transaction fees.
            !hasClaimableVestingTokens
          }
          tooltip={
            <>
              Unlock this balance by performing a <strong>vest</strong>{' '}
              transaction.
            </>
          }
        />
      </div>
    );
  });
};

export default VestingScheduleBalances;
