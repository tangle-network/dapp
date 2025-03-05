import { BN, BN_ZERO } from '@polkadot/util';
import { PresetTypedChainId } from '@tangle-network/dapp-types/ChainId';
import { BridgeTokenWithBalance } from '@tangle-network/tangle-shared-ui/types';
import useBridgeAssets from './useBridgeAssets';
import { useMemo } from 'react';
import useBridgeStore from '../context/useBridgeStore';
import { useShallow } from 'zustand/react/shallow';

/**
 * Hook to get the balance of the selected token on the source chain.
 *
 * @param {number} sourceTypedChainId The typed chain ID of the source chain
 * @param {Partial<Record<PresetTypedChainId, BridgeTokenWithBalance[]>>} balances Record of token balances by chain ID
 * @returns {BN | null} The balance of the selected token on the source chain, or null if no balance is available.
 */
export default function useBridgeTokenBalance(
  sourceTypedChainId: number,
  balances: Partial<Record<PresetTypedChainId, BridgeTokenWithBalance[]>>,
): BN | null {
  const selectedToken = useBridgeStore(
    useShallow((store) => store.selectedToken),
  );

  const isTangleChain =
    sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM ||
    sourceTypedChainId === PresetTypedChainId.TangleTestnetEVM;

  const assets = useBridgeAssets(sourceTypedChainId, balances);

  const tokenAddress = useMemo(() => {
    if (!selectedToken) return null;

    return isTangleChain
      ? selectedToken.hyperlaneSyntheticAddress
      : selectedToken.address;
  }, [isTangleChain, selectedToken]);

  return useMemo(() => {
    if (!selectedToken) return BN_ZERO;

    return (
      assets.find((asset) => asset.address === tokenAddress)?.balance ?? BN_ZERO
    );
  }, [assets, tokenAddress, selectedToken]);
}
