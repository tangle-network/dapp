import { RouterQuoteParams } from '../hooks/useRouterQuote';
import { PresetTypedChainId } from '@tangle-network/dapp-types/ChainId';
import { ROUTER_NATIVE_TOKEN_ADDRESS } from '@tangle-network/tangle-shared-ui/constants/bridge';
import useBridgeStore from '../context/useBridgeStore';
import { useShallow } from 'zustand/react/shallow';

/**
 * Hook to create the parameters for a router quote request.
 *
 * @param {number} sourceTypedChainId the typed chain ID of the source chain
 * @param {number} destinationTypedChainId the typed chain ID of the destination chain
 * @param {boolean} isSolanaDestination is the destination chain a solana chain
 * @returns {RouterQuoteParams | null} the parameters for a router quote request, or null if any of the required values are missing.
 */
export default function useRouterQuoteParams(
  sourceTypedChainId: number,
  destinationTypedChainId: number,
  isSolanaDestination: boolean,
): RouterQuoteParams | null {
  const selectedToken = useBridgeStore(
    useShallow((store) => store.selectedToken),
  );
  const selectedSourceChain = useBridgeStore(
    useShallow((store) => store.selectedSourceChain),
  );
  const selectedDestinationChain = useBridgeStore(
    useShallow((store) => store.selectedDestinationChain),
  );
  const amount = useBridgeStore(useShallow((store) => store.amount));

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
