'use client';

import { isEthereumAddress } from '@polkadot/util-crypto';
import Decimal from 'decimal.js';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';

import { useBridge } from '../../../context/BridgeContext';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import { BridgeFeeType, BridgeType } from '../../../types/bridge';
import { getEthersGasPrice } from '../lib/fee';
import useAmountInStr from './useAmountInStr';
import useEthersProvider from './useEthersProvider';
import useEthersSigner from './useEthersSigner';
import useSelectedToken from './useSelectedToken';

export default function useEstimatedGasFee() {
  const activeAccountAddress = useActiveAccountAddress();
  const {
    destinationAddress,
    bridgeType,
    selectedSourceChain,
    selectedDestinationChain,
    updateFeeItem,
  } = useBridge();
  const selectedToken = useSelectedToken();
  const ethersProvider = useEthersProvider();
  const ethersSigner = useEthersSigner();
  const amountInStr = useAmountInStr();

  const { data: ethersGasPrice, isLoading: isLoadingEthersGasPrice } = useSWR(
    [ethersProvider !== null ? { provider: ethersProvider } : undefined],
    async ([...args]) => {
      return await getEthersGasPrice(...args);
    },
  );

  const {
    data: evmEstimatedGasPrice,
    isLoading: isLoadingEvmEstimatedGasPrice,
  } = useSWR(
    [
      activeAccountAddress !== null &&
      isEthereumAddress(activeAccountAddress) &&
      bridgeType !== null &&
      ethersProvider !== null &&
      ethersSigner !== null &&
      destinationAddress
        ? {
            senderAddress: activeAccountAddress,
            recipientAddress: destinationAddress,
            provider: ethersProvider,
            sourceChain: selectedSourceChain,
            destinationChain: selectedDestinationChain,
            token: selectedToken,
            amount: amountInStr,
          }
        : undefined,
    ],
    async () => {
      // Implement EVM gas estimation logic here
      // This is a placeholder and should be replaced with actual implementation
      return new Decimal('21000'); // Placeholder value
    },
  );

  const fee = useMemo(() => {
    switch (bridgeType) {
      case BridgeType.HYPERLANE_EVM_TO_EVM: {
        if (ethersGasPrice == null || evmEstimatedGasPrice == null) return null;
        return ethersGasPrice.times(evmEstimatedGasPrice);
      }
      default:
        return null;
    }
  }, [bridgeType, ethersGasPrice, evmEstimatedGasPrice]);

  const isLoading = useMemo(() => {
    switch (bridgeType) {
      case BridgeType.HYPERLANE_EVM_TO_EVM:
        return isLoadingEthersGasPrice || isLoadingEvmEstimatedGasPrice;
      default:
        return false;
    }
  }, [bridgeType, isLoadingEthersGasPrice, isLoadingEvmEstimatedGasPrice]);

  useEffect(() => {
    updateFeeItem(BridgeFeeType.Gas, {
      amount: fee,
      isLoading,
    });
  }, [fee, isLoading, updateFeeItem]);
}
