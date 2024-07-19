'use client';

import { useMemo } from 'react';

import { useBridge } from '../../../context/BridgeContext';
import convertBnToDecimal from '../../../utils/convertBnToDecimal';
import useDecimals from './useDecimals';

export default function useAmountInDecimals() {
  const { amount, bridgeFee } = useBridge();
  const decimals = useDecimals();

  const sourceAmountInDecimals = useMemo(() => {
    if (!amount) return null;
    return convertBnToDecimal(amount, decimals);
  }, [amount, decimals]);

  const destinationAmountInDecimals = useMemo(() => {
    if (!sourceAmountInDecimals) return null;
    return sourceAmountInDecimals.sub(bridgeFee ?? 0);
  }, [sourceAmountInDecimals, bridgeFee]);

  return { sourceAmountInDecimals, destinationAmountInDecimals };
}
