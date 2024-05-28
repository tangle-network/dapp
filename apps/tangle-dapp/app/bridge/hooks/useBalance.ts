'use client';

import { isAddress } from '@polkadot/util-crypto';
import { ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import Decimal from 'decimal.js';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useBridge } from '../../../context/BridgeContext';
import useActiveAccountAddress from '../../../hooks/useActiveAccountAddress';
import { isEvmAddress } from '../../../utils/isEvmAddress';
import { getEvmContractBalance, getEvmNativeBalance } from '../lib/evm';
import { getSubstrateNativeTransferable } from '../lib/substrate';
import useDecimals from './useDecimals';
import useError from './useError';
import useEvmViemClient from './useEvmViemClient';
import useIsWrongEvmNetwork from './useIsWrongEvmNetwork';
import useSelectedToken from './useSelectedToken';
import useSubstrateApi from './useSubstrateApi';
import useTypedChainId from './useTypedChainId';

type UseBalanceReturnType = {
  balance: Decimal | null;
  isTransferable: boolean;
};

export default function useBalance() {
  const activeAccountAddress = useActiveAccountAddress();
  const { selectedSourceChain } = useBridge();
  const error = useError();
  const selectedToken = useSelectedToken();
  const { sourceTypedChainId } = useTypedChainId();
  const evmViemClient = useEvmViemClient();
  const substrateApi = useSubstrateApi();
  const decimals = useDecimals();
  const isWrongEvmNetwork = useIsWrongEvmNetwork();

  const isNativeToken = useMemo(
    () =>
      !isWrongEvmNetwork &&
      checkNativeToken(selectedToken.symbol, selectedSourceChain),
    [isWrongEvmNetwork, selectedToken.symbol, selectedSourceChain]
  );

  const erc20TokenContractAddress = useMemo(() => {
    return selectedToken.erc20TokenContractAddress?.[sourceTypedChainId];
  }, [selectedToken.erc20TokenContractAddress, sourceTypedChainId]);

  const { data: evmNativeBalance } = useSWR(
    [
      !isWrongEvmNetwork &&
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

  const { data: evmErc20Balance } = useSWR(
    [
      !isWrongEvmNetwork &&
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

  const { data: substrateNativeBalance } = useSWR(
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

  return {
    balance:
      evmNativeBalance ?? evmErc20Balance ?? substrateNativeBalance ?? null,
    isTransferable: substrateNativeBalance != null,
  } satisfies UseBalanceReturnType;
}

function checkNativeToken(tokenSymbol: string, chainConfig: ChainConfig) {
  return (
    tokenSymbol.toLowerCase() ===
    chainConfig.nativeCurrency.symbol.toLowerCase()
  );
}
