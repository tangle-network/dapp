import { BN } from '@polkadot/util';
import assert from 'assert';
import { useCallback } from 'react';

import { TxName } from '../../constants';
import { LS_ERC20_TOKEN_MAP } from '../../constants/liquidStaking/constants';
import LIQUIFIER_ABI from '../../constants/liquidStaking/liquifierAbi';
import { LsErc20TokenId } from '../../constants/liquidStaking/types';
import useEvmAddress20 from '../../hooks/useEvmAddress';
import useContractWrite from './useContractWrite';

const useLiquifierUnlock = () => {
  const activeEvmAddress20 = useEvmAddress20();
  const writeLiquifier = useContractWrite(LIQUIFIER_ABI);

  const isReady = writeLiquifier !== null && activeEvmAddress20 !== null;

  const unlock = useCallback(
    async (tokenId: LsErc20TokenId, amount: BN) => {
      // TODO: Should the user balance check be done here or assume that the consumer of the hook will handle that?

      assert(
        isReady,
        'Should not be able to call this function if the requirements are not ready yet',
      );

      const tokenDef = LS_ERC20_TOKEN_MAP[tokenId];

      const unlockTxReceipt = await writeLiquifier({
        txName: TxName.LS_LIQUIFIER_UNLOCK,
        // TODO: Does the adapter contract have a unlock function? It doesn't seem like so. In that case, will need to update the way that Liquifier contract's address is handled.
        address: tokenDef.liquifierAdapterAddress,
        functionName: 'unlock',
        args: [BigInt(amount.toString())],
      });

      return unlockTxReceipt.status !== 'reverted';
    },
    [isReady, writeLiquifier],
  );

  // Wait for the requirements to be ready before
  // returning the unlock function.
  return !isReady ? null : unlock;
};

export default useLiquifierUnlock;
