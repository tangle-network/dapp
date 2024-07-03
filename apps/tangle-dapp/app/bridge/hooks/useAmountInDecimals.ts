'use client';

import { useMemo } from 'react';

import { useBridge } from '../../../context/BridgeContext';
import convertBnToDecimal from '../../../utils/convertBnToDecimal';
import useBridgeFee from './useBridgeFee';
import useDecimals from './useDecimals';

export default function useAmountInDecimals() {
  const { amount } = useBridge();
  const decimals = useDecimals();
  const { fee: bridgeFee } = useBridgeFee();

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
