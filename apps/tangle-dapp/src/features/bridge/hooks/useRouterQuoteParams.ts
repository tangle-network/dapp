import { BN } from '@polkadot/util';
import { RouterQuoteParams } from '../hooks/useRouterQuote';
import { BridgeToken } from '@tangle-network/tangle-shared-ui/types';
import { ChainConfig } from '@tangle-network/dapp-config/chains';
import { PresetTypedChainId } from '@tangle-network/dapp-types/ChainId';
import { ROUTER_NATIVE_TOKEN_ADDRESS } from '@tangle-network/tangle-shared-ui/constants/bridge';

/**
 * Hook to create the parameters for a router quote request.
 *
 * @param {BN | null} amount the amount to transfer
 * @param {BridgeToken | null} selectedToken the selected bridge token (or null if none selected)
 * @param {ChainConfig} selectedSourceChain the currently selected source chain
 * @param {ChainConfig} selectedDestinationChain the currently selected destination chain
 * @param {number} sourceTypedChainId the typed chain ID of the source chain
 * @param {number} destinationTypedChainId the typed chain ID of the destination chain
 * @param {boolean} isSolanaDestination is the destination chain a solana chain
 * @returns {RouterQuoteParams | null} the parameters for a router quote request, or null if any of the required values are missing.
 */
export default function useRouterQuoteParams(
  amount: BN | null,
  selectedToken: BridgeToken | null,
  selectedSourceChain: ChainConfig,
  selectedDestinationChain: ChainConfig,
  sourceTypedChainId: number,
  destinationTypedChainId: number,
  isSolanaDestination: boolean,
): RouterQuoteParams | null {
  if (!amount || !selectedToken) {
    return null;
  }

  const fromTokenAddress =
    sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM
      ? ROUTER_NATIVE_TOKEN_ADDRESS
      : selectedToken.address;

  const toTokenAddress =
    destinationTypedChainId === PresetTypedChainId.TangleMainnetEVM
      ? ROUTER_NATIVE_TOKEN_ADDRESS
      : selectedToken.address;

  const toTokenChainId = isSolanaDestination
    ? 'solana'
    : selectedDestinationChain.id.toString();

  const routerQuoteParams = {
    fromTokenAddress,
    toTokenAddress,
    amountInWei: amount.toString(),
    fromTokenChainId: selectedSourceChain.id.toString(),
    toTokenChainId,
  };

  return routerQuoteParams;
}
