'use client';

import { isAddress, isEthereumAddress } from '@polkadot/util-crypto';
import Decimal from 'decimal.js';
import { useEffect } from 'react';
import useSWR from 'swr';

import { useBridge } from '../../../context/BridgeContext';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import { hyperlaneTransfer } from '../../../lib/hyperlane/transfer';
import {
  BridgeFeeItem,
  BridgeFeeType,
  BridgeType,
} from '../../../types/bridge';
import { getEthersGasPrice } from '../lib/fee';
import sygmaEvm from '../lib/transfer/sygmaEvm';
import sygmaSubstrate from '../lib/transfer/sygmaSubstrate';
import useAmountInStr from './useAmountInStr';
import useDecimals from './useDecimals';
import useEthersProvider from './useEthersProvider';
import useEthersSigner from './useEthersSigner';
import useSelectedToken from './useSelectedToken';
import useSubstrateApi from './useSubstrateApi';
import useTypedChainId from './useTypedChainId';

export default function useFees() {
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
  const api = useSubstrateApi();
  const amountInStr = useAmountInStr();
  const decimals = useDecimals();
  const { sourceTypedChainId, destinationTypedChainId } = useTypedChainId();

  // Sygma EVM Fee
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
            amount: amountInStr,
          }
        : null,
    ],
    async ([args]) => {
      if (!args) return null;
      const sygmaEvmTransfer = await sygmaEvm(args);
      if (sygmaEvmTransfer === null) return null;
      return new Decimal(sygmaEvmTransfer.fee.fee.toString()).div(
        Decimal.pow(10, decimals),
      );
    },
  );

  // Sygma Substrate Fee
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
              amount: amountInStr,
            }
          : null,
      ],
      async ([args]) => {
        if (!args) return null;
        const sygmaSubstrateTransfer = await sygmaSubstrate(args);
        if (sygmaSubstrateTransfer === null) return null;
        return new Decimal(sygmaSubstrateTransfer.fee.fee.toString()).div(
          Decimal.pow(10, decimals),
        );
      },
    );

  // Ethers Gas Price
  const { data: ethersGasPrice, isLoading: isLoadingEthersGasPrice } = useSWR(
    [ethersProvider !== null ? { provider: ethersProvider } : null],
    async ([args]) => {
      if (!args) return null;
      return await getEthersGasPrice(args);
    },
  );

  // EVM Estimated Gas Price
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
        : null,
    ],
    async ([args]) => {
      if (!args || !ethersSigner) return null;
      const sygmaEvmTransfer = await sygmaEvm(args);
      if (sygmaEvmTransfer === null) return null;
      const { tx } = sygmaEvmTransfer;
      return new Decimal((await ethersSigner.estimateGas(tx)).toString());
    },
  );

  // Substrate Estimated Gas Fee
  const {
    data: substrateEstimatedGasFee,
    isLoading: isLoadingSubstrateEstimatedGasFee,
  } = useSWR(
    [
      activeAccountAddress !== null &&
      isAddress(activeAccountAddress) &&
      bridgeType !== null &&
      api !== null
        ? {
            senderAddress: activeAccountAddress,
            recipientAddress: destinationAddress,
            api,
            sourceChain: selectedSourceChain,
            destinationChain: selectedDestinationChain,
            token: selectedToken,
            amount: amountInStr,
          }
        : null,
    ],
    async ([args]) => {
      if (!args || !activeAccountAddress) return null;
      const sygmaSubstrateTransfer = await sygmaSubstrate(args);
      if (sygmaSubstrateTransfer === null) return null;
      const { tx } = sygmaSubstrateTransfer;
      const { partialFee } = await tx.paymentInfo(activeAccountAddress);
      return new Decimal(partialFee.toString()).div(Decimal.pow(10, decimals));
    },
  );

  // Hyperlane Fees
  const { data: hyperlaneFees, isLoading: isLoadingHyperlaneFees } = useSWR(
    [
      activeAccountAddress !== null &&
      isEthereumAddress(activeAccountAddress) &&
      bridgeType === BridgeType.HYPERLANE_EVM_TO_EVM &&
      destinationAddress
        ? {
            sourceTypedChainId,
            destinationTypedChainId,
            senderAddress: activeAccountAddress,
            recipientAddress: destinationAddress,
            token: selectedToken,
            amount: amountInStr,
          }
        : null,
    ],
    async ([args]) => {
      if (!args) return null;
      const result = await hyperlaneTransfer(args);
      if (!result) return null;
      return {
        gasFee: {
          amount: new Decimal(result.fees.local.amount.toString()).div(
            new Decimal(10).pow(decimals),
          ),
          symbol: result.fees.local.symbol,
        },
        interchainFee: {
          amount: new Decimal(result.fees.interchain.amount.toString()).div(
            new Decimal(10).pow(decimals),
          ),
          symbol: result.fees.interchain.symbol,
        },
      };
    },
  );

  useEffect(() => {
    function calculateBridgeFee(): BridgeFeeItem | null {
      let fee = null;
      let isLoading = false;

      switch (bridgeType) {
        case BridgeType.SYGMA_EVM_TO_EVM:
        case BridgeType.SYGMA_EVM_TO_SUBSTRATE:
          fee = evmSygmaFee ?? null;
          isLoading = isLoadingEvmSygmaFee;
          break;
        case BridgeType.SYGMA_SUBSTRATE_TO_SUBSTRATE:
        case BridgeType.SYGMA_SUBSTRATE_TO_EVM:
          fee = substrateSygmaFee ?? null;
          isLoading = isLoadingSubstrateSygmaFee;
          break;
      }

      if (fee === null) {
        return null;
      }

      return {
        amount: fee,
        isLoading,
        symbol: selectedSourceChain.nativeCurrency.symbol,
      };
    }

    function calculateGasFee(): BridgeFeeItem | null {
      let fee = null;
      let isLoading = false;

      switch (bridgeType) {
        case BridgeType.HYPERLANE_EVM_TO_EVM:
          fee = hyperlaneFees?.gasFee.amount ?? null;
          isLoading = isLoadingHyperlaneFees;
          break;
        case BridgeType.SYGMA_EVM_TO_EVM:
        case BridgeType.SYGMA_EVM_TO_SUBSTRATE:
          if (ethersGasPrice && evmEstimatedGasPrice) {
            fee = ethersGasPrice.times(evmEstimatedGasPrice);
          }
          isLoading = isLoadingEthersGasPrice || isLoadingEvmEstimatedGasPrice;
          break;
        case BridgeType.SYGMA_SUBSTRATE_TO_SUBSTRATE:
        case BridgeType.SYGMA_SUBSTRATE_TO_EVM:
          fee = substrateEstimatedGasFee ?? null;
          isLoading = isLoadingSubstrateEstimatedGasFee;
          break;
      }

      if (fee === null) {
        return null;
      }

      return {
        amount: fee,
        isLoading,
        symbol: selectedSourceChain.nativeCurrency.symbol,
      };
    }

    function calculateInterchainFee(): BridgeFeeItem | null {
      if (bridgeType !== BridgeType.HYPERLANE_EVM_TO_EVM || !hyperlaneFees) {
        return null;
      }

      return {
        amount: hyperlaneFees.interchainFee.amount,
        isLoading: isLoadingHyperlaneFees,
        symbol: hyperlaneFees.interchainFee.symbol,
      };
    }

    // Bridge Fee
    const bridgeFee = calculateBridgeFee();
    updateFeeItem(BridgeFeeType.SygmaBridge, bridgeFee);

    // Gas Fee
    const gasFee = calculateGasFee();
    updateFeeItem(BridgeFeeType.Gas, gasFee);

    // Interchain Fee (only for Hyperlane)
    const interchainFee = calculateInterchainFee();
    updateFeeItem(BridgeFeeType.HyperlaneInterchain, interchainFee);
  }, [
    bridgeType,
    evmSygmaFee,
    substrateSygmaFee,
    ethersGasPrice,
    evmEstimatedGasPrice,
    substrateEstimatedGasFee,
    hyperlaneFees,
    updateFeeItem,
    selectedSourceChain.nativeCurrency.symbol,
    isLoadingEvmSygmaFee,
    isLoadingSubstrateSygmaFee,
    isLoadingHyperlaneFees,
    isLoadingEthersGasPrice,
    isLoadingEvmEstimatedGasPrice,
    isLoadingSubstrateEstimatedGasFee,
  ]);

  const isLoading =
    isLoadingEvmSygmaFee ||
    isLoadingSubstrateSygmaFee ||
    isLoadingEthersGasPrice ||
    isLoadingEvmEstimatedGasPrice ||
    isLoadingSubstrateEstimatedGasFee ||
    isLoadingHyperlaneFees;

  return isLoading;
}
