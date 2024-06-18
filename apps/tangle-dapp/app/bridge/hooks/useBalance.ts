'use client';

import { isAddress } from '@polkadot/util-crypto';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { useWebbUI } from '@webb-tools/webb-ui-components/hooks/useWebbUI';
import Decimal from 'decimal.js';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';

import { useBridge } from '../../../context/BridgeContext';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import ensureError from '../../../utils/ensureError';
import { isEvmAddress } from '../../../utils/isEvmAddress';
import {
  getEvmContractBalance,
  getEvmNativeBalance,
  getSubstrateAssetBalance,
  getSubstrateNativeTransferable,
} from '../lib/balance';
import useDecimals from './useDecimals';
import useEthersProvider from './useEthersProvider';
import useSelectedToken from './useSelectedToken';
import useSubstrateApi from './useSubstrateApi';
import useTypedChainId from './useTypedChainId';

type UseBalanceReturnType = {
  balance: Decimal | null;
  isLoading: boolean;
};

export default function useBalance() {
  const { notificationApi } = useWebbUI();
  const activeAccountAddress = useActiveAccountAddress();
  const { selectedSourceChain, walletError } = useBridge();
  const selectedToken = useSelectedToken();
  const { sourceTypedChainId } = useTypedChainId();
  const ethersProvider = useEthersProvider();
  const substrateApi = useSubstrateApi();
  const decimals = useDecimals();

  const isNativeToken = useMemo(
    () => checkNativeToken(selectedToken.symbol, selectedSourceChain),
    [selectedToken.symbol, selectedSourceChain],
  );

  const erc20TokenContractAddress = useMemo(() => {
    return selectedToken.erc20TokenContractAddress?.[sourceTypedChainId];
  }, [selectedToken.erc20TokenContractAddress, sourceTypedChainId]);

  const substrateAssetId = useMemo(
    () => selectedToken.substrateAssetId?.[sourceTypedChainId],
    [selectedToken.substrateAssetId, sourceTypedChainId],
  );

  const {
    data: evmNativeBalance,
    isLoading: isLoadingEvmNativeBalance,
    error: errorEvmNativeBalance,
  } = useSWR(
    [
      walletError === null &&
      activeAccountAddress !== null &&
      ethersProvider !== null &&
      isEvmAddress(activeAccountAddress) &&
      isNativeToken
        ? { provider: ethersProvider, accAddress: activeAccountAddress }
        : undefined,
    ],
    ([...args]) => getEvmNativeBalance(...args),
  );

  const {
    data: evmErc20Balance,
    isLoading: isLoadingEvmErc20Balance,
    error: errorEvmErc20Balance,
  } = useSWR(
    [
      walletError === null &&
      activeAccountAddress !== null &&
      ethersProvider !== null &&
      isEvmAddress(activeAccountAddress) &&
      !isNativeToken &&
      erc20TokenContractAddress !== undefined
        ? {
            provider: ethersProvider,
            contractAddress: erc20TokenContractAddress,
            accAddress: activeAccountAddress,
            decimals,
          }
        : undefined,
    ],
    ([...args]) => getEvmContractBalance(...args),
  );

  const {
    data: substrateNativeBalance,
    isLoading: isLoadingSubstrateNativeBalance,
    error: errorSubstrateNativeBalance,
  } = useSWR(
    [
      walletError === null &&
      activeAccountAddress !== null &&
      substrateApi !== null &&
      isAddress(activeAccountAddress) &&
      isNativeToken
        ? {
            api: substrateApi,
            accAddress: activeAccountAddress,
          }
        : undefined,
    ],
    ([...args]) => getSubstrateNativeTransferable(...args),
  );

  const {
    data: substrateAssetBalance,
    isLoading: isLoadingSubstrateAssetBalance,
    error: errorSubstrateAssetBalance,
  } = useSWR(
    [
      walletError === null &&
      activeAccountAddress !== null &&
      substrateApi !== null &&
      isAddress(activeAccountAddress) &&
      !isNativeToken &&
      substrateAssetId !== undefined
        ? {
            api: substrateApi,
            accAddress: activeAccountAddress,
            assetId: substrateAssetId,
            decimals,
          }
        : undefined,
    ],
    ([...args]) => getSubstrateAssetBalance(...args),
  );

  useEffect(() => {
    if (errorEvmNativeBalance) {
      notificationApi({
        message: ensureError(errorEvmNativeBalance).message,
        variant: 'error',
      });
    }
  }, [notificationApi, errorEvmNativeBalance]);

  useEffect(() => {
    if (errorEvmErc20Balance) {
      notificationApi({
        message: ensureError(errorEvmErc20Balance).message,
        variant: 'error',
      });
    }
  }, [notificationApi, errorEvmErc20Balance]);

  useEffect(() => {
    if (errorSubstrateNativeBalance) {
      notificationApi({
        message: ensureError(errorSubstrateNativeBalance).message,
        variant: 'error',
      });
    }
  }, [notificationApi, errorSubstrateNativeBalance]);

  useEffect(() => {
    if (errorSubstrateAssetBalance) {
      notificationApi({
        message: ensureError(errorSubstrateAssetBalance).message,
        variant: 'error',
      });
    }
  }, [notificationApi, errorSubstrateAssetBalance]);

  return {
    balance:
      evmNativeBalance ??
      evmErc20Balance ??
      substrateNativeBalance ??
      substrateAssetBalance ??
      null,
    isLoading:
      isLoadingEvmNativeBalance ||
      isLoadingEvmErc20Balance ||
      isLoadingSubstrateNativeBalance ||
      isLoadingSubstrateAssetBalance,
  } satisfies UseBalanceReturnType;
}

function checkNativeToken(tokenSymbol: string, chainConfig: ChainConfig) {
  return (
    tokenSymbol.toLowerCase() ===
    chainConfig.nativeCurrency.symbol.toLowerCase()
  );
}
