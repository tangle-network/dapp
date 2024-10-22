'use client';

import { isEthereumAddress } from '@polkadot/util-crypto';
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
import useAmountInStr from './useAmountInStr';
import useDecimals from './useDecimals';
import useEthersProvider from './useEthersProvider';
import useEthersSigner from './useEthersSigner';
import useSelectedToken from './useSelectedToken';
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
  const amountInStr = useAmountInStr();
  const decimals = useDecimals();
  const { sourceTypedChainId, destinationTypedChainId } = useTypedChainId();

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
      // Implement EVM gas estimation logic here
      // This is a placeholder and should be replaced with actual implementation
      return new Decimal('21000'); // Placeholder value
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
      const result = await hyperlaneTransfer({ ...args });
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
    function calculateGasFee(): BridgeFeeItem | null {
      let fee = null;
      let isLoading = false;

      if (bridgeType === BridgeType.HYPERLANE_EVM_TO_EVM) {
        fee = hyperlaneFees?.gasFee.amount ?? null;
        isLoading = isLoadingHyperlaneFees;
      } else if (ethersGasPrice && evmEstimatedGasPrice) {
        fee = ethersGasPrice.times(evmEstimatedGasPrice);
        isLoading = isLoadingEthersGasPrice || isLoadingEvmEstimatedGasPrice;
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

    // Gas Fee
    const gasFee = calculateGasFee();
    updateFeeItem(BridgeFeeType.Gas, gasFee);

    // Interchain Fee (only for Hyperlane)
    const interchainFee = calculateInterchainFee();
    updateFeeItem(BridgeFeeType.HyperlaneInterchain, interchainFee);
  }, [
    bridgeType,
    ethersGasPrice,
    evmEstimatedGasPrice,
    hyperlaneFees,
    updateFeeItem,
    selectedSourceChain.nativeCurrency.symbol,
    isLoadingHyperlaneFees,
    isLoadingEthersGasPrice,
    isLoadingEvmEstimatedGasPrice,
  ]);

  const isLoading =
    isLoadingEthersGasPrice ||
    isLoadingEvmEstimatedGasPrice ||
    isLoadingHyperlaneFees;

  return isLoading;
}
