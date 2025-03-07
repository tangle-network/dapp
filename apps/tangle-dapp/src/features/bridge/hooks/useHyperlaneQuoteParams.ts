import { HyperlaneQuoteProps } from './useHyperlaneQuote';
import { Account } from '@tangle-network/abstract-api-provider/account';
import useBridgeStore from '../context/useBridgeStore';
import { useShallow } from 'zustand/react/shallow';

/**
 * Hook to create the parameters for the Hyperlane quote query.
 *
 * @param {Account<unknown> | null} activeAccount The active account.
 * @param {number} sourceTypedChainId The typed chain ID of the source chain.
 * @param {number} destinationTypedChainId The typed chain ID of the destination chain.
 * @returns {HyperlaneQuoteProps | null} The Hyperlane quote query parameters, or null if the parameters are not valid.
 */
export default function useHyperlaneQuoteParams(
  activeAccount: Account<unknown> | null,
  sourceTypedChainId: number,
  destinationTypedChainId: number,
): HyperlaneQuoteProps | null {
  const selectedToken = useBridgeStore(
    useShallow((store) => store.selectedToken),
  );
  const destinationAddress = useBridgeStore(
    useShallow((store) => store.destinationAddress),
  );
  const amount = useBridgeStore(useShallow((store) => store.amount));

  if (
    !activeAccount ||
    !activeAccount.address ||
    !destinationAddress ||
    !selectedToken ||
    !amount
  ) {
    return null;
  }

  return {
    token: selectedToken,
    amount: Number(amount.toString()),
    sourceTypedChainId,
    destinationTypedChainId,
    senderAddress: activeAccount.address,
    recipientAddress: destinationAddress,
  };
}
