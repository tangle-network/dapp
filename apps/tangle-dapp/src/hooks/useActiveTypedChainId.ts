import {
  calculateTypedChainId,
  ChainType,
} from '@tangle-network/dapp-types/TypedChainId';
import { useMemo } from 'react';
import { useAccount, useChainId } from 'wagmi';

/**
 * Retrieve the active typed chain id state
 * from wagmi's active EVM chain.
 *
 * @returns the active typed chain id state or null
 * if there is no connected wallet.
 */
export default function useActiveTypedChainId() {
  const { isConnected } = useAccount();
  const chainId = useChainId();

  return useMemo(() => {
    if (!isConnected || !chainId) {
      return null;
    }

    return calculateTypedChainId(ChainType.EVM, chainId);
  }, [chainId, isConnected]);
}
