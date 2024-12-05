import { LockUnlockLineIcon } from '@webb-tools/icons';
import { FC } from 'react';

import useVestingInfo from '../../data/vesting/useVestingInfo';
import useVestTx from '../../data/vesting/useVestTx';
import { TxStatus } from '../../hooks/useSubstrateTx';
import BalanceAction from './BalanceAction';

const VestBalanceAction: FC = () => {
  const { execute: executeVestTx, status: vestTxStatus } = useVestTx();
  const { hasClaimableTokens: hasClaimableVestingTokens } = useVestingInfo();

  return (
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
          Use this action to perform a <strong>vest</strong> transaction. This
          will release vested tokens from <strong>all</strong> vesting
          schedules.
        </>
      }
    />
  );
};

export default VestBalanceAction;
