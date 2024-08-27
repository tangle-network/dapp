'use client';

import { useMemo } from 'react';

import { useBridge } from '../../../context/BridgeContext';
import convertBnToDecimal from '../../../utils/convertBnToDecimal';
import useDecimals from './useDecimals';
import useSelectedToken from './useSelectedToken';

export default function useAmountInDecimals() {
  const { amount, feeItems } = useBridge();
  const token = useSelectedToken();
  const decimals = useDecimals();

  const sourceAmountInDecimals = useMemo(() => {
    if (!amount) return null;
    return convertBnToDecimal(amount, decimals);
  }, [amount, decimals]);

  const subtractedAmount = useMemo(() => {
    if (token.symbol === feeItems.bridge?.symbol)
      return feeItems.bridge?.amount;
    if (token.symbol === feeItems.interchain?.symbol)
      return feeItems.interchain?.amount;
    return null;
  }, [
    token.symbol,
    feeItems.bridge?.symbol,
    feeItems.bridge?.amount,
    feeItems.interchain?.symbol,
    feeItems.interchain?.amount,
  ]);

  const destinationAmountInDecimals = useMemo(() => {
    if (!sourceAmountInDecimals) return null;
    return sourceAmountInDecimals.sub(subtractedAmount ?? 0);
  }, [sourceAmountInDecimals, subtractedAmount]);

  return { sourceAmountInDecimals, destinationAmountInDecimals };
}
