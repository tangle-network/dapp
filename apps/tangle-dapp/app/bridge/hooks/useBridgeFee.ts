'use client';

import { useEffect } from 'react';

import { useBridge } from '../../../context/BridgeContext';
import { BridgeFeeType, BridgeType } from '../../../types/bridge';
import useSelectedToken from './useSelectedToken';

export default function useBridgeFee() {
  const { bridgeType, selectedSourceChain, updateFeeItem } = useBridge();
  const selectedToken = useSelectedToken();

  const fee = (() => {
    switch (bridgeType) {
      case BridgeType.HYPERLANE_EVM_TO_EVM:
        return null;
      default:
        return null;
    }
  })();

  const isLoading = (() => {
    switch (bridgeType) {
      case BridgeType.HYPERLANE_EVM_TO_EVM:
        return false;
      default:
        return false;
    }
  })();

  useEffect(() => {
    updateFeeItem(
      BridgeFeeType.HyperlaneInterchain,
      fee !== null
        ? {
            amount: fee,
            isLoading,
            symbol: selectedSourceChain.nativeCurrency.symbol,
          }
        : null,
    );
  }, [
    fee,
    isLoading,
    selectedSourceChain.nativeCurrency.symbol,
    selectedToken.symbol,
    updateFeeItem,
  ]);
}
