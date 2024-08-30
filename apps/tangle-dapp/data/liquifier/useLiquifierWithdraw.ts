import assert from 'assert';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { LS_LIQUIFIER_PROTOCOL_MAP } from '../../constants/liquidStaking/constants';
import LIQUIFIER_ABI from '../../constants/liquidStaking/liquifierAbi';
import { LsLiquifierProtocolId } from '../../constants/liquidStaking/types';
import useEvmAddress20 from '../../hooks/useEvmAddress';
import { NotificationSteps } from '../../hooks/useTxNotification';
import useContractWrite from './useContractWrite';

const useLiquifierWithdraw = () => {
  const activeEvmAddress20 = useEvmAddress20();
  const writeLiquifier = useContractWrite(LIQUIFIER_ABI);

  const isReady = writeLiquifier !== null && activeEvmAddress20 !== null;

  const withdraw = useCallback(
    async (
      tokenId: LsLiquifierProtocolId,
      unlockId: number,
      notificationStep?: NotificationSteps,
    ) => {
      // TODO: Should the user balance check be done here or assume that the consumer of the hook will handle that?

      assert(
        isReady,
        'Should not be able to call this function if the requirements are not ready yet',
      );

      const tokenDef = LS_LIQUIFIER_PROTOCOL_MAP[tokenId];

      const withdrawTxSucceeded = await writeLiquifier({
        txName: TxName.LS_LIQUIFIER_WITHDRAW,
        // TODO: Does the adapter contract have a deposit function? It doesn't seem like so. In that case, will need to update the way that Liquifier contract's address is handled.
        address: tokenDef.liquifierContractAddress,
        functionName: 'withdraw',
        args: [activeEvmAddress20, BigInt(unlockId)],
        notificationStep,
      });

      return withdrawTxSucceeded;
    },
    [activeEvmAddress20, isReady, writeLiquifier],
  );

  // Wait for the requirements to be ready before
  // returning the withdraw function.
  return !isReady ? null : withdraw;
};

export default useLiquifierWithdraw;
