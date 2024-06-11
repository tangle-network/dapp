'use client';

import Decimal from 'decimal.js';
import useSWR from 'swr';

import { useBridge } from '../../../context/BridgeContext';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import { BridgeType } from '../../../types/bridge';
import sygmaEvm from '../lib/transfer/sygmaEvm';
import sygmaSubstrate from '../lib/transfer/sygmaSubstrate';
import useAmountToTransfer from './useAmountToTransfer';
import useDecimals from './useDecimals';
import useEvmViemClient from './useEvmViemClient';
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
  const viemClient = useEvmViemClient();
  const api = useSubstrateApi();
  const amountToTransfer = useAmountToTransfer();
  const decimals = useDecimals();

  const { data: evmSygmaFee } = useSWR(
    [
      activeAccountAddress !== null &&
      bridgeType !== null &&
      viemClient !== null
        ? {
            senderAddress: activeAccountAddress,
            recipientAddress: destinationAddress,
            viemClient,
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

  const { data: substrateSygmaFee } = useSWR(
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
}
