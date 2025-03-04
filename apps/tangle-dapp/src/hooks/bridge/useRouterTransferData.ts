import { Account } from '@tangle-network/abstract-api-provider/account';
import {
  RouterQuote,
  RouterQuoteParams,
} from '../../data/bridge/useRouterQuote';
import { RouterTransferProps } from '../../data/bridge/useRouterTransfer';

/**
 * Hook to prepare data for a router transfer.
 *
 * @param {RouterQuote | null} routerQuote the router quote
 * @param {RouterQuoteParams | null} routerQuoteParams the router quote params
 * @param {Account<unknown> | null} activeAccount the active account
 * @param {string | null} destinationAddress the destination address
 * @returns {Omit<RouterTransferProps, 'ethersSigner'> | null} the prepared transfer props
 */
export default function useRouterTransferData(
  routerQuote: RouterQuote | null,
  routerQuoteParams: RouterQuoteParams | null,
  activeAccount: Account<unknown> | null,
  destinationAddress: string | null,
): Omit<RouterTransferProps, 'ethersSigner'> | null {
  if (
    !routerQuote ||
    !routerQuoteParams ||
    !activeAccount ||
    !destinationAddress
  ) {
    return null;
  }

  return {
    routerQuoteData: routerQuote,
    fromTokenAddress: routerQuoteParams.fromTokenAddress,
    toTokenAddress: routerQuoteParams.toTokenAddress,
    senderAddress: activeAccount.address,
    receiverAddress: destinationAddress,
    refundAddress: activeAccount.address,
  };
}
