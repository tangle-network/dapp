'use client';

import { formatBn } from '@webb-tools/webb-ui-components';
import { useMemo } from 'react';
import { parseUnits } from 'viem';

import { useBridge } from '../../../context/BridgeContext';
import useDecimals from './useDecimals';

export default function useAmountInStr() {
  const { amount } = useBridge();
  const decimals = useDecimals();

  const amountToString = useMemo(
    () =>
      amount !== null
        ? parseUnits(
            formatBn(amount, decimals, {
              includeCommas: false,
              fractionMaxLength: undefined,
            }),
            decimals,
          ).toString()
        : '0',
    [amount, decimals],
  );

  return amountToString;
}
