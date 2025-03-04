import { BridgeToken } from '@tangle-network/tangle-shared-ui/types';
import { FeeDetailProps } from '../../components/bridge/FeeDetail';
import { BN } from '@polkadot/util';
import Decimal from 'decimal.js';
import { formatEther } from 'viem';
import useBridgeStore from '../../context/bridge/useBridgeStore';
import { RouterQuote } from '../../data/bridge/useRouterQuote';

/**
 * Hook to get the fee details for a router transfer.
 *
 * @param {BridgeToken | null} selectedToken the selected token
 * @param {BN | null} amount the amount
 * @param {RouterQuote | null} routerQuote the router quote
 * @param {string | undefined} recipientExplorerUrl the recipient explorer url
 * @returns {FeeDetailProps | null} the fee details props
 */
export default function useRouterFeeDetails(
  selectedToken: BridgeToken | null,
  amount: BN | null,
  routerQuote: RouterQuote | null,
  recipientExplorerUrl?: string,
): FeeDetailProps | null {
  const setSendingAmount = useBridgeStore((store) => store.setSendingAmount);
  const setReceivingAmount = useBridgeStore(
    (store) => store.setReceivingAmount,
  );

  if (
    !routerQuote ||
    !selectedToken ||
    !amount ||
    !routerQuote?.bridgeFee.amount
  ) {
    return null;
  }

  const sendingAmount = amount
    ? parseFloat(formatEther(BigInt(amount.toString())))
    : 0;

  const formattedSendingAmount =
    sendingAmount.toString() + ' ' + routerQuote?.bridgeFee.symbol;

  const receivingAmount = routerQuote.bridgeFee.amount
    ? sendingAmount -
      parseFloat(formatEther(BigInt(routerQuote.bridgeFee.amount)))
    : sendingAmount;

  const formattedReceivingAmount =
    receivingAmount.toString() + ' ' + routerQuote?.bridgeFee.symbol;

  const formattedBridgeFee =
    formatEther(BigInt(routerQuote.bridgeFee.amount)) +
    ' ' +
    routerQuote?.bridgeFee.symbol;

  const estimatedTime = routerQuote?.estimatedTime
    ? `${Math.ceil(Number(routerQuote.estimatedTime) / 60)} min`
    : '';

  setSendingAmount(new Decimal(sendingAmount));
  setReceivingAmount(new Decimal(receivingAmount));

  return {
    token: selectedToken,
    amounts: {
      sending: formattedSendingAmount,
      receiving: formattedReceivingAmount,
      bridgeFee: formattedBridgeFee,
    },
    estimatedTime: estimatedTime,
    bridgeFeeTokenType: routerQuote.bridgeFee.symbol,
    sendingAmount: new Decimal(sendingAmount),
    receivingAmount: new Decimal(receivingAmount),
    recipientExplorerUrl: recipientExplorerUrl,
  };
}
