'use client';

import FeeDetailsCmp from '@webb-tools/webb-ui-components/components/FeeDetails';
import type { FeeItem } from '@webb-tools/webb-ui-components/components/FeeDetails/types';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import Decimal from 'decimal.js';
import { FC, useMemo } from 'react';

import { useBridge } from '../../context/BridgeContext';
import useBridgeFee from './hooks/useBridgeFee';
import useEstimatedGasFee from './hooks/useEstimatedGasFee';
import useSelectedToken from './hooks/useSelectedToken';
import useTypedChainId from './hooks/useTypedChainId';

const FeeDetails = () => {
  const { selectedSourceChain } = useBridge();
  const { fee: bridgeFee, isLoading: isLoadingBridgeFee } = useBridgeFee();
  const { fee: estimatedGasFee, isLoading: isLoadingEstimatedGasFee } =
    useEstimatedGasFee();
  const selectedToken = useSelectedToken();
  const { destinationTypedChainId } = useTypedChainId();

  const destChainTransactionFee = useMemo(
    () =>
      selectedToken.destChainTransactionFee[destinationTypedChainId] ?? null,
    [destinationTypedChainId, selectedToken.destChainTransactionFee],
  );

  const totalFeeCmp = useMemo(() => {
    if (bridgeFee === null || estimatedGasFee === null) return null;

    const allTokenFee = bridgeFee.add(
      destChainTransactionFee ?? new Decimal(0),
    );

    if (
      selectedToken.symbol.toLowerCase() ===
      selectedSourceChain.nativeCurrency.symbol.toLowerCase()
    ) {
      const totalFee = allTokenFee.add(estimatedGasFee);
      if (totalFee.isZero()) return null;
      return `${totalFee.toString()} ${selectedToken.symbol}`;
    }

    return `${allTokenFee.toString()} ${selectedToken.symbol} + ${estimatedGasFee.toString()} ${selectedSourceChain.nativeCurrency.symbol}`;
  }, [
    bridgeFee,
    destChainTransactionFee,
    selectedToken.symbol,
    estimatedGasFee,
    selectedSourceChain.nativeCurrency.symbol,
  ]);

  return (
    <FeeDetailsCmp
      title="Total Fees"
      totalFeeCmp={totalFeeCmp}
      isTotalLoading={isLoadingBridgeFee || isLoadingEstimatedGasFee}
      items={
        [
          bridgeFee !== null
            ? {
                name: 'Bridge Fee',
                value: (
                  <FeeValueCmp fee={bridgeFee} symbol={selectedToken.symbol} />
                ),
                isLoading: isLoadingBridgeFee,
                info: 'This transaction will charge a bridge fee to cover the destination chain’s gas fee.',
              }
            : undefined,
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
          estimatedGasFee !== null
            ? {
                name: 'Estimated Gas Fee',
                value: (
                  <FeeValueCmp
                    fee={estimatedGasFee}
                    symbol={selectedSourceChain.nativeCurrency.symbol}
                  />
                ),
                isLoading: isLoadingEstimatedGasFee,
              }
            : undefined,
        ].filter((item) => Boolean(item)) as Array<FeeItem>
      }
      className="!bg-mono-20 dark:!bg-mono-160"
      titleClassName="!text-mono-100 dark:!text-mono-80"
      itemTitleClassName="!text-mono-100 dark:!text-mono-80"
    />
  );
};

export default FeeDetails;

const FeeValueCmp: FC<{ fee: Decimal; symbol: string }> = ({ fee, symbol }) => {
  return (
    <Typography
      variant="body1"
      className="!text-mono-120 dark:!text-mono-100"
    >{`${fee.toString()} ${symbol}`}</Typography>
  );
};
