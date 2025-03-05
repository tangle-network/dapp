import { BN } from '@polkadot/util';
import { BridgeToken } from '@tangle-network/tangle-shared-ui/types';
import { HyperlaneQuoteProps } from './useHyperlaneQuote';
import { Account } from '@tangle-network/abstract-api-provider/account';

/**
 * Hook to create the parameters for the Hyperlane quote query.
 *
 * @param {BN | null} amount The amount of tokens to bridge.
 * @param {BridgeToken | null} selectedToken The selected token to bridge.
 * @param {Account<unknown> | null} activeAccount The active account.
 * @param {string | null} destinationAddress The destination address.
 * @param {number} sourceTypedChainId The typed chain ID of the source chain.
 * @param {number} destinationTypedChainId The typed chain ID of the destination chain.
 * @returns {HyperlaneQuoteProps | null} The Hyperlane quote query parameters, or null if the parameters are not valid.
 */
export default function useHyperlaneQuoteParams(
  amount: BN | null,
  selectedToken: BridgeToken | null,
  activeAccount: Account<unknown> | null,
  destinationAddress: string | null,
  sourceTypedChainId: number,
  destinationTypedChainId: number,
): HyperlaneQuoteProps | null {
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
