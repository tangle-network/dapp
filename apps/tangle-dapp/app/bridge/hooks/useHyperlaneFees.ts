'use client';

import { isEthereumAddress } from '@polkadot/util-crypto';
import Decimal from 'decimal.js';
import { useEffect } from 'react';
import useSWR from 'swr';

import { useBridge } from '../../../context/BridgeContext';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import { hyperlaneTransfer } from '../../../lib/hyperlane/transfer';
import { BridgeType } from '../../../types/bridge';
import useAmountInStr from './useAmountInStr';
import useDecimals from './useDecimals';
import useSelectedToken from './useSelectedToken';
import useTypedChainId from './useTypedChainId';

export default function useHyperlaneFees() {
  const { destinationAddress, bridgeType, updateFeeItem } = useBridge();
  const activeAccountAddress = useActiveAccountAddress();
  const { sourceTypedChainId, destinationTypedChainId } = useTypedChainId();
  const selectedToken = useSelectedToken();
  const amountInStr = useAmountInStr();
  const decimals = useDecimals();

  const { data: fees, isLoading } = useSWR(
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
        : undefined,
    ],
    async ([...args]) => {
      const result = await hyperlaneTransfer(...args);
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
    if (fees) {
      const { gasFee, interchainFee } = fees;
      updateFeeItem('gas', {
        amount: gasFee.amount,
        symbol: gasFee.symbol,
        isLoading,
      });
      updateFeeItem('interchain', {
        amount: interchainFee.amount,
        symbol: interchainFee.symbol,
        isLoading,
      });
    }
  }, [fees, isLoading, updateFeeItem, bridgeType]);
}
