import { BridgeToken } from '@tangle-network/tangle-shared-ui/types';
import { FeeDetailProps } from '../../components/bridge/FeeDetail';
import { BN } from '@polkadot/util';
import Decimal from 'decimal.js';
import { formatEther } from 'viem';
import useBridgeStore from '../../context/bridge/useBridgeStore';
import { RouterQuote } from '../../data/bridge/useRouterQuote';
import { useMemo } from 'react';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/ui-components';
import convertBNToDecimal from '@tangle-network/ui-components/utils/convertBnToDecimal';
import convertDecimalToBN from '@tangle-network/tangle-shared-ui/utils/convertDecimalToBn';

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

  const routerFeeDetails = useMemo(() => {
    if (
      !routerQuote ||
      !selectedToken ||
      !amount ||
      !routerQuote?.bridgeFee.amount
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

    const sendingAmount = amount
      ? convertBNToDecimal(amount, selectedToken.decimals)
      : new Decimal(0);

    const receivingAmount = routerQuote.bridgeFee.amount
      ? sendingAmount.minus(
          new Decimal(formatEther(BigInt(routerQuote.bridgeFee.amount))),
        )
      : sendingAmount;

    const formattedReceivingAmount =
      formatDisplayAmount(
        convertDecimalToBN(receivingAmount, selectedToken.decimals),
        selectedToken.decimals,
        AmountFormatStyle.SHORT,
      ) +
      ' ' +
      routerQuote.bridgeFee.symbol;

    const formattedBridgeFee = `${formatEther(BigInt(routerQuote.bridgeFee.amount))} ${routerQuote.bridgeFee.symbol}`;

    setSendingAmount(sendingAmount);
    setReceivingAmount(new Decimal(receivingAmount));

    return {
      token: selectedToken,
      amounts: {
        sending: formattedSendingAmount,
        receiving: formattedReceivingAmount,
        bridgeFee: formattedBridgeFee,
      },
      recipientExplorerUrl: recipientExplorerUrl,
    };
  }, [
    routerQuote,
    selectedToken,
    amount,
    setSendingAmount,
    setReceivingAmount,
    recipientExplorerUrl,
  ]);

  return routerFeeDetails;
}
