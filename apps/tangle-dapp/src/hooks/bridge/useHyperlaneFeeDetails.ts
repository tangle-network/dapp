import { BridgeToken } from '@tangle-network/tangle-shared-ui/types';
import { FeeDetailProps } from '../../components/bridge/FeeDetail';
import { Account } from '@tangle-network/abstract-api-provider/account';
import { BN } from '@polkadot/util';
import { HyperlaneQuote } from '../../data/bridge/useHyperlaneQuote';
import Decimal from 'decimal.js';
import { formatEther } from 'viem';
import useBridgeStore from '../../context/bridge/useBridgeStore';

/**
 * Hook to get the fee details for a hyperlane transfer.
 *
 * @param {Account<unknown> | null} activeAccount the active account
 * @param {BridgeToken | null} selectedToken the selected token
 * @param {string | null} destinationAddress the destination address
 * @param {BN | null} amount the amount
 * @param {HyperlaneQuote | null} hyperlaneQuote the hyperlane quote
 * @param {string | undefined} recipientExplorerUrl the recipient explorer url
 * @returns {FeeDetailProps | null} the fee details props
 */
export default function useHyperlaneFeeDetails(
  activeAccount: Account<unknown> | null,
  selectedToken: BridgeToken | null,
  destinationAddress: string | null,
  amount: BN | null,
  hyperlaneQuote: HyperlaneQuote | null,
  recipientExplorerUrl?: string,
): FeeDetailProps | null {
  const setSendingAmount = useBridgeStore((store) => store.setSendingAmount);
  const setReceivingAmount = useBridgeStore(
    (store) => store.setReceivingAmount,
  );

  if (
    !activeAccount ||
    !activeAccount.address ||
    !destinationAddress ||
    !selectedToken ||
    !amount ||
    !hyperlaneQuote ||
    !selectedToken
  ) {
    return null;
  }

  const sendingAmount = new Decimal(amount.toString())
    .div(new Decimal(10).pow(selectedToken.decimals))
    .toString();

  const formattedSendingAmount = `${sendingAmount} ${selectedToken.symbol}`;

  const formattedGasFee =
    formatEther(hyperlaneQuote.fees.local.amount) +
    ' ' +
    hyperlaneQuote.fees.local.symbol;

  const formattedBridgeFee =
    formatEther(hyperlaneQuote.fees.interchain.amount) +
    ' ' +
    hyperlaneQuote.fees.interchain.symbol;

  setSendingAmount(new Decimal(sendingAmount));
  setReceivingAmount(new Decimal(sendingAmount));

  return {
    token: selectedToken,
    amounts: {
      sending: formattedSendingAmount,
      receiving: formattedSendingAmount,
      bridgeFee: formattedBridgeFee,
      gasFee: formattedGasFee,
    },
    estimatedTime: '',
    bridgeFeeTokenType: hyperlaneQuote.fees.local.symbol,
    gasFeeTokenType: hyperlaneQuote.fees.interchain.symbol,
    sendingAmount: new Decimal(sendingAmount),
    receivingAmount: new Decimal(sendingAmount),
    recipientExplorerUrl: recipientExplorerUrl,
  };
}
