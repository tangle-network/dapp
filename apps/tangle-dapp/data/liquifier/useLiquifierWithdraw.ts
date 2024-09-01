import assert from 'assert';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { LS_LIQUIFIER_PROTOCOL_MAP } from '../../constants/liquidStaking/constants';
import LIQUIFIER_ABI from '../../constants/liquidStaking/liquifierAbi';
import { LsLiquifierProtocolId } from '../../constants/liquidStaking/types';
import useEvmAddress20 from '../../hooks/useEvmAddress';
import { NotificationSteps } from '../../hooks/useTxNotification';
import useContractWriteBatch from './useContractWriteBatch';

const useLiquifierWithdraw = () => {
  const activeEvmAddress20 = useEvmAddress20();
  const writeLiquifierBatch = useContractWriteBatch(LIQUIFIER_ABI);

  const isReady = writeLiquifierBatch !== null && activeEvmAddress20 !== null;

  const withdraw = useCallback(
    async (
      tokenId: LsLiquifierProtocolId,
      unlockIds: number[],
      notificationStep?: NotificationSteps,
    ) => {
      // TODO: Should the user balance check be done here or assume that the consumer of the hook will handle that?

      assert(
        isReady,
        'Should not be able to call this function if the requirements are not ready yet',
      );

      const tokenDef = LS_LIQUIFIER_PROTOCOL_MAP[tokenId];

      const batchArgs = unlockIds.map(
        (unlockId) => [activeEvmAddress20, BigInt(unlockId)] as const,
      );

      const withdrawTxSucceeded = await writeLiquifierBatch({
        txName: TxName.LS_LIQUIFIER_WITHDRAW,
        // TODO: Does the adapter contract have a deposit function? It doesn't seem like so. In that case, will need to update the way that Liquifier contract's address is handled.
        address: tokenDef.liquifierContractAddress,
        functionName: 'withdraw',
        args: batchArgs,
        notificationStep,
      });

      return withdrawTxSucceeded;
    },
    [activeEvmAddress20, isReady, writeLiquifierBatch],
  );

  // Wait for the requirements to be ready before
  // returning the withdraw function.
  return !isReady ? null : withdraw;
};

export default useLiquifierWithdraw;
