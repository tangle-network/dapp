'use client';

import { useMemo } from 'react';
import { parseUnits } from 'viem';

import { useBridge } from '../../../context/BridgeContext';
import formatBn from '../../../utils/formatBn';
import useDecimals from './useDecimals';

export default function useAmountToTransfer() {
  const { amount } = useBridge();
  const decimals = useDecimals();

  // TODO: handle calculate real amount to bridge when user choose max amount,
  // most likely we need to create a modal to show the real amount will be bridged to the user
  const amountToString = useMemo(
    () =>
      amount !== null
        ? parseUnits(
            formatBn(amount, decimals, {
              includeCommas: false,
              fractionLength: undefined,
            }),
            decimals,
          ).toString()
        : '0',
    [amount, decimals],
  );

  return amountToString;
}
