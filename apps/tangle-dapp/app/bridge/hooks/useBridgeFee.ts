'use client';

import Decimal from 'decimal.js';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useBridge } from '../../../context/BridgeContext';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import { BridgeType } from '../../../types/bridge';
import sygmaEvm from '../lib/transfer/sygmaEvm';
import sygmaSubstrate from '../lib/transfer/sygmaSubstrate';
import useAmountToTransfer from './useAmountToTransfer';
import useDecimals from './useDecimals';
import useEthersProvider from './useEthersProvider';
import useSelectedToken from './useSelectedToken';
import useSubstrateApi from './useSubstrateApi';

export default function useBridgeFee() {
  const activeAccountAddress = useActiveAccountAddress();
  const {
    destinationAddress,
    bridgeType,
    selectedSourceChain,
    selectedDestinationChain,
  } = useBridge();
  const selectedToken = useSelectedToken();
  const ethersProvider = useEthersProvider();
  const api = useSubstrateApi();
  const amountToTransfer = useAmountToTransfer();
  const decimals = useDecimals();

  const { data: evmSygmaFee, isLoading: isLoadingEvmSygmaFee } = useSWR(
    [
      activeAccountAddress !== null &&
      bridgeType !== null &&
      ethersProvider !== null
        ? {
            senderAddress: activeAccountAddress,
            recipientAddress: destinationAddress,
            provider: ethersProvider,
            sourceChain: selectedSourceChain,
            destinationChain: selectedDestinationChain,
            token: selectedToken,
            amount: amountToTransfer,
          }
        : undefined,
    ],
    async ([...args]) => {
      const sygmaEvmTransfer = await sygmaEvm(...args);
      if (sygmaEvmTransfer === null) return null;
      return new Decimal(sygmaEvmTransfer.fee.fee.toString()).div(
        Decimal.pow(10, decimals),
      );
    },
  );

  const { data: substrateSygmaFee, isLoading: isLoadingSubstrateSygmaFee } =
    useSWR(
      [
        activeAccountAddress !== null && bridgeType !== null && api !== null
          ? {
              senderAddress: activeAccountAddress,
              recipientAddress: destinationAddress,
              api,
              sourceChain: selectedSourceChain,
              destinationChain: selectedDestinationChain,
              token: selectedToken,
              amount: amountToTransfer,
            }
          : undefined,
      ],
      async ([...args]) => {
        const sygmaSubstrateTransfer = await sygmaSubstrate(...args);
        if (sygmaSubstrateTransfer === null) return null;
        return new Decimal(sygmaSubstrateTransfer.fee.fee.toString()).div(
          Decimal.pow(10, decimals),
        );
      },
    );

  const fee = useMemo(() => {
    switch (bridgeType) {
      case BridgeType.SYGMA_EVM_TO_EVM:
      case BridgeType.SYGMA_SUBSTRATE_TO_SUBSTRATE:
        return evmSygmaFee ?? null;
      case BridgeType.SYGMA_EVM_TO_SUBSTRATE:
      case BridgeType.SYGMA_SUBSTRATE_TO_EVM:
        return substrateSygmaFee ?? null;
      default:
        return null;
    }
  }, [bridgeType, evmSygmaFee, substrateSygmaFee]);

  const isLoading = useMemo(() => {
    switch (bridgeType) {
      case BridgeType.SYGMA_EVM_TO_EVM:
      case BridgeType.SYGMA_SUBSTRATE_TO_SUBSTRATE:
        return isLoadingEvmSygmaFee;
      case BridgeType.SYGMA_EVM_TO_SUBSTRATE:
      case BridgeType.SYGMA_SUBSTRATE_TO_EVM:
        return isLoadingSubstrateSygmaFee;
      default:
        return false;
    }
  }, [bridgeType, isLoadingEvmSygmaFee, isLoadingSubstrateSygmaFee]);

  return { fee, isLoading };
}
