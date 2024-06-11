'use client';

import { useMemo } from 'react';
import { parseUnits } from 'viem';

import { useBridge } from '../../../context/BridgeContext';
import formatBnToDisplayAmount from '../../../utils/formatBnToDisplayAmount';
import useDecimals from './useDecimals';

export default function useAmountToTransfer() {
  const { amount } = useBridge();
  const decimals = useDecimals();

  // TODO: handle calculate real amount to bridge when user choose max amount
  const amountToString = useMemo(
    () =>
      amount !== null
        ? parseUnits(
            formatBnToDisplayAmount(amount, decimals, {
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
