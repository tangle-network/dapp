'use client';

import FeeDetailsCmp from '@webb-tools/webb-ui-components/components/FeeDetails';
import type { FeeItem } from '@webb-tools/webb-ui-components/components/FeeDetails/types';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import Decimal from 'decimal.js';
import { FC, useMemo } from 'react';

import { useBridge } from '../../context/BridgeContext';
import useSelectedToken from './hooks/useSelectedToken';
import useTypedChainId from './hooks/useTypedChainId';

const FeeDetails = () => {
  const { selectedSourceChain, feeItems } = useBridge();
  const selectedToken = useSelectedToken();
  const { destinationTypedChainId } = useTypedChainId();

  const destChainTransactionFee = useMemo(
    () =>
      selectedToken.destChainTransactionFee[destinationTypedChainId] ?? null,
    [destinationTypedChainId, selectedToken.destChainTransactionFee],
  );

  const totalFeeCmp = useMemo(
    () =>
      formatTotalAmount({
        ...feeItems,
        destChainTransactionFee:
          destChainTransactionFee !== null
            ? { amount: destChainTransactionFee, symbol: selectedToken.symbol }
            : null,
      }),
    [feeItems, destChainTransactionFee, selectedToken.symbol],
  );

  return (
    <FeeDetailsCmp
      title="Fees"
      totalFeeCmp={totalFeeCmp}
      collapsible={true}
      isDefaultOpen={true}
      items={
        [
          feeItems.hyperlaneInterchain !== null && {
            name: 'Interchain Fee',
            value: (
              <FeeValueCmp
                fee={feeItems.hyperlaneInterchain.amount}
                symbol={feeItems.hyperlaneInterchain.symbol}
              />
            ),
            isLoading: feeItems.hyperlaneInterchain.isLoading,
            info: "This transaction will charge a bridge fee to cover the destination chain's gas fee.",
          },
          destChainTransactionFee !== null
            ? {
                name: 'Bridge Fee',
                value: (
                  <FeeValueCmp
                    fee={destChainTransactionFee}
                    symbol={selectedToken.symbol}
                  />
                ),
                info: 'This fee is used to pay the XCM fee of the destination chain.',
              }
            : undefined,
          {
            name: 'Estimated Gas Fee',
            value: (
              <FeeValueCmp
                fee={feeItems.gas?.amount ?? null}
                symbol={selectedSourceChain.nativeCurrency.symbol}
              />
            ),
            isLoading: feeItems.gas?.isLoading ?? false,
          },
        ].filter((item) => Boolean(item)) as Array<FeeItem>
      }
      className="!bg-mono-20 dark:!bg-mono-170"
      titleClassName="!text-mono-100 dark:!text-mono-80"
      itemTitleClassName="!text-mono-100 dark:!text-mono-80"
    />
  );
};

export default FeeDetails;

const FeeValueCmp: FC<{ fee: Decimal | null; symbol: string }> = ({
  fee,
  symbol,
}) => {
  return (
    <Typography variant="body1" className="!text-mono-120 dark:!text-mono-100">
      {fee ? `${fee.toDecimalPlaces(5).toString()} ${symbol}` : 'N/A'}
    </Typography>
  );
};

function formatTotalAmount(
  feeItems: Record<string, { amount: Decimal | null; symbol: string } | null>,
): string {
  const symbolTotals: Record<string, Decimal> = {};

  for (const [, item] of Object.entries(feeItems)) {
    if (item === null) continue;
    const { amount, symbol } = item;
    if (!amount) continue;
    symbolTotals[symbol] = (symbolTotals[symbol] ?? new Decimal(0)).plus(
      amount,
    );
  }

  const formattedTotals = Object.entries(symbolTotals)
    .map(
      ([symbol, amount]) => `${amount.toDecimalPlaces(5).toString()} ${symbol}`,
    )
    .join(' + ');

  return formattedTotals;
}
