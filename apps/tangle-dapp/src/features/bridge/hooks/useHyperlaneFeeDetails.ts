import { BridgeFeeDetailProps } from '../components/BridgeFeeDetail';
import { Account } from '@tangle-network/abstract-api-provider/account';
import { HyperlaneQuote } from './useHyperlaneQuote';
import Decimal from 'decimal.js';
import { formatEther } from 'viem';
import useBridgeStore from '../context/useBridgeStore';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/ui-components';
import convertBNToDecimal from '@tangle-network/ui-components/utils/convertBnToDecimal';
import { useMemo, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

/**
 * Hook to get the fee details for a hyperlane transfer.
 *
 * @param {Account<unknown> | null} activeAccount the active account
 * @param {HyperlaneQuote | null} hyperlaneQuote the hyperlane quote
 * @param {string | undefined} recipientExplorerUrl the recipient explorer url
 * @returns {BridgeFeeDetailProps | null} the fee details props
 */
export default function useHyperlaneFeeDetails(
  activeAccount: Account<unknown> | null,
  hyperlaneQuote: HyperlaneQuote | null,
  recipientExplorerUrl: string | null,
): Omit<BridgeFeeDetailProps, 'sendingAmount'> | null {
  const selectedToken = useBridgeStore(
    useShallow((store) => store.selectedToken),
  );
  const destinationAddress = useBridgeStore(
    useShallow((store) => store.destinationAddress),
  );
  const setSendingAmount = useBridgeStore((store) => store.setSendingAmount);
  const setReceivingAmount = useBridgeStore(
    (store) => store.setReceivingAmount,
  );
  const amount = useBridgeStore(useShallow((store) => store.amount));

  const hyperlaneFeeDetails = useMemo(() => {
    if (
      !activeAccount ||
      !activeAccount.address ||
      !destinationAddress ||
      !selectedToken ||
      !amount ||
      !hyperlaneQuote
    ) {
      return null;
    }

    const formattedSendingAmount =
      formatDisplayAmount(
        amount,
        selectedToken.decimals,
        AmountFormatStyle.SHORT,
      ) +
      ' ' +
      selectedToken.symbol;

    const formattedGasFee = `${formatEther(hyperlaneQuote.fees.local.amount)} ${hyperlaneQuote.fees.local.symbol}`;

    const formattedBridgeFee = `${formatEther(hyperlaneQuote.fees.interchain.amount)} ${hyperlaneQuote.fees.interchain.symbol}`;

    return {
      token: selectedToken,
      amounts: {
        sending: formattedSendingAmount,
        receiving: formattedSendingAmount,
        bridgeFee: formattedBridgeFee,
        gasFee: formattedGasFee,
      },
      recipientExplorerUrl: recipientExplorerUrl,
      sendingAmount: amount
        ? convertBNToDecimal(amount, selectedToken.decimals)
        : new Decimal(0),
    };
  }, [
    activeAccount,
    destinationAddress,
    amount,
    selectedToken,
    hyperlaneQuote,
    recipientExplorerUrl,
  ]);

  useEffect(() => {
    if (hyperlaneFeeDetails) {
      setSendingAmount(hyperlaneFeeDetails.sendingAmount);
      setReceivingAmount(hyperlaneFeeDetails.sendingAmount);
    }
  }, [hyperlaneFeeDetails, setSendingAmount, setReceivingAmount]);

  return hyperlaneFeeDetails;
}
