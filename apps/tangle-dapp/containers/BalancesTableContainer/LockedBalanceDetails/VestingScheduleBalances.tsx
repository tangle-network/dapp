import { LockUnlockLineIcon } from '@webb-tools/icons';
import { FC } from 'react';

import useVestingInfo from '../../../data/vesting/useVestingInfo';
import useVestTx from '../../../data/vesting/useVestTx';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import BalanceAction from '../BalanceAction';
import BalanceCell from '../BalanceCell';

const VestingScheduleBalances: FC = () => {
  const { execute: executeVestTx, status: vestTxStatus } = useVestTx();

  const {
    schedulesOpt: vestingSchedulesOpt,
    hasClaimableTokens: hasClaimableVestingTokens,
  } = useVestingInfo();

  return (
    vestingSchedulesOpt !== null &&
    !vestingSchedulesOpt.isNone &&
    vestingSchedulesOpt.unwrap().map((schedule, index) => (
      // TODO: For the balance, calculate how much is LEFT to claim, not the entire, original locked amount.
      <div key={index} className="flex flex-row justify-between items-center">
        <BalanceCell amount={schedule.locked} />

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
    ))
  );
};

export default VestingScheduleBalances;
