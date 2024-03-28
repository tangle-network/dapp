import { LockUnlockLineIcon } from '@webb-tools/icons';
import { FC } from 'react';

import useDemocracy from '../../../data/democracy/useDemocracy';
import useDemocracyUnlockTx from '../../../data/democracy/useDemocracyUnlockTx';
import { TxStatus } from '../../../hooks/useSubstrateTx';
import BalanceAction from '../BalanceAction';
import BalanceCell from '../BalanceCell';

const DemocracyBalance: FC = () => {
  const { lockedBalance: lockedDemocracyBalance, isInDemocracy } =
    useDemocracy();

  // TODO: Need to remove all expired democracy votes, and THEN perform the unlock transaction.
  const { execute: executeDemocracyUnlockTx, status: democracyUnlockTxStatus } =
    useDemocracyUnlockTx();

  if (!isInDemocracy || lockedDemocracyBalance === null) {
    return;
  }

  return (
    <div className="flex flex-row justify-between items-center">
      <BalanceCell amount={lockedDemocracyBalance} />

      <BalanceAction
        Icon={LockUnlockLineIcon}
        tooltip="Clear expired democracy locks."
        isDisabled={
          executeDemocracyUnlockTx === null ||
          democracyUnlockTxStatus === TxStatus.PROCESSING
        }
        onClick={
          executeDemocracyUnlockTx !== null
            ? executeDemocracyUnlockTx
            : undefined
        }
      />
    </div>
  );
};

export default DemocracyBalance;
