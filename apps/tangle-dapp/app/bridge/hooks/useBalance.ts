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
import { getEvmContractBalance, getEvmNativeBalance } from '../lib/evm';
import { getSubstrateNativeTransferable } from '../lib/substrate';
import useDecimals from './useDecimals';
import useError from './useError';
import useEvmViemClient from './useEvmViemClient';
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
  const { selectedSourceChain } = useBridge();
  const error = useError();
  const selectedToken = useSelectedToken();
  const { sourceTypedChainId } = useTypedChainId();
  const evmViemClient = useEvmViemClient();
  const substrateApi = useSubstrateApi();
  const decimals = useDecimals();

  const isNativeToken = useMemo(
    () => checkNativeToken(selectedToken.symbol, selectedSourceChain),
    [selectedToken.symbol, selectedSourceChain]
  );

  const erc20TokenContractAddress = useMemo(() => {
    return selectedToken.erc20TokenContractAddress?.[sourceTypedChainId];
  }, [selectedToken.erc20TokenContractAddress, sourceTypedChainId]);

  const {
    data: evmNativeBalance,
    isLoading: isLoadingEvmNativeBalance,
    error: errorLoadingEvmNativeBalance,
  } = useSWR(
    [
      error === null &&
      activeAccountAddress !== null &&
      evmViemClient !== null &&
      isEvmAddress(activeAccountAddress) &&
      isNativeToken
        ? { client: evmViemClient, accAddress: activeAccountAddress }
        : undefined,
    ],
    ([...args]) => getEvmNativeBalance(...args)
  );

  const {
    data: evmErc20Balance,
    isLoading: isLoadingEvmErc20Balance,
    error: errorLoadingEvmErc20Balance,
  } = useSWR(
    [
      error === null &&
      activeAccountAddress !== null &&
      evmViemClient !== null &&
      isEvmAddress(activeAccountAddress) &&
      !isNativeToken &&
      erc20TokenContractAddress !== undefined
        ? {
            client: evmViemClient,
            contractAddress: erc20TokenContractAddress,
            accAddress: activeAccountAddress,
            decimals,
          }
        : undefined,
    ],
    ([...args]) => getEvmContractBalance(...args)
  );

  const {
    data: substrateNativeBalance,
    isLoading: isLoadingSubstrateNativeBalance,
    error: errorLoadingSubstrateNativeBalance,
  } = useSWR(
    [
      error === null &&
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
    ([...args]) => getSubstrateNativeTransferable(...args)
  );

  useEffect(() => {
    if (errorLoadingEvmNativeBalance) {
      notificationApi({
        message: ensureError(errorLoadingEvmNativeBalance).message,
        variant: 'error',
      });
    }
  }, [notificationApi, errorLoadingEvmNativeBalance]);

  useEffect(() => {
    if (errorLoadingEvmErc20Balance) {
      notificationApi({
        message: ensureError(errorLoadingEvmErc20Balance).message,
        variant: 'error',
      });
    }
  }, [notificationApi, errorLoadingEvmErc20Balance]);

  useEffect(() => {
    if (errorLoadingSubstrateNativeBalance) {
      notificationApi({
        message: ensureError(errorLoadingSubstrateNativeBalance).message,
        variant: 'error',
      });
    }
  }, [notificationApi, errorLoadingSubstrateNativeBalance]);

  return {
    balance:
      evmNativeBalance ?? evmErc20Balance ?? substrateNativeBalance ?? null,
    isLoading:
      isLoadingEvmNativeBalance ||
      isLoadingEvmErc20Balance ||
      isLoadingSubstrateNativeBalance,
  } satisfies UseBalanceReturnType;
}

function checkNativeToken(tokenSymbol: string, chainConfig: ChainConfig) {
  return (
    tokenSymbol.toLowerCase() ===
    chainConfig.nativeCurrency.symbol.toLowerCase()
  );
}
