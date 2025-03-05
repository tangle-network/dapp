import { BN, BN_ZERO } from '@polkadot/util';
import { PresetTypedChainId } from '@tangle-network/dapp-types/ChainId';
import {
  BridgeToken,
  BridgeTokenWithBalance,
} from '@tangle-network/tangle-shared-ui/types';
import useBridgeAssets from './useBridgeAssets';
import { ChainConfig } from '@tangle-network/dapp-config/chains';
import { useMemo } from 'react';

/**
 * Hook to get the balance of the selected token on the source chain.
 *
 * @param {BridgeToken | null} selectedToken The currently selected bridge token (or null if none selected)
 * @param {ChainConfig} selectedSourceChain The currently selected source chain
 * @param {number} sourceTypedChainId The typed chain ID of the source chain
 * @param {Partial<Record<PresetTypedChainId, BridgeTokenWithBalance[]>>} balances Record of token balances by chain ID
 * @returns {BN | null} The balance of the selected token on the source chain, or null if no balance is available.
 */
export default function useBridgeTokenBalance(
  selectedToken: BridgeToken | null,
  selectedSourceChain: ChainConfig,
  sourceTypedChainId: number,
  balances: Partial<Record<PresetTypedChainId, BridgeTokenWithBalance[]>>,
): BN | null {
  const isTangleChain = useMemo(
    () =>
      sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM ||
      sourceTypedChainId === PresetTypedChainId.TangleTestnetEVM,
    [sourceTypedChainId],
  );

  const assets = useBridgeAssets(
    selectedToken,
    selectedSourceChain,
    sourceTypedChainId,
    balances,
  );

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
