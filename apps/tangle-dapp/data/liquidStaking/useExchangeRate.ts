import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useEffect, useMemo } from 'react';
import { erc20Abi } from 'viem';

import { LsParachainCurrencyKey } from '../../constants/liquidStaking/liquidStakingParachain';
import {
  getLsProtocolDef,
  LsErc20TokenDef,
  LsProtocolId,
} from '../../constants/liquidStaking/types';
import useApiRx from '../../hooks/useApiRx';
import calculateBnRatio from '../../utils/calculateBnRatio';
import useContractReadSubscription from '../liquifier/useContractReadSubscription';
import usePolling, { PollingPrimaryCacheKey } from './usePolling';

export enum ExchangeRateType {
  NativeToLiquid,
  LiquidToNative,
}

// TODO: This NEEDS to be based on subscription for sure, since exchange rates are always changing. Perhaps make it return whether it is re-fetching, so that an effect can be shown on the UI to indicate that it is fetching the latest exchange rate, and also have it be ran in a 3 or 5 second interval. Will also need de-duping logic, error handling, and also prevent spamming requests when the parent component is re-rendered many times (e.g. by using a ref to store the latest fetch timestamp). Might want to extract this pattern into its own hook, similar to a subscription. Also consider having a global store (Zustand) for that custom hook that uses caching to prevent spamming requests when the same hook is used in multiple components, might need to accept a custom 'key' parameter to use as the cache key.
const useExchangeRate = (type: ExchangeRateType, protocolId: LsProtocolId) => {
  const protocol = getLsProtocolDef(protocolId);

  const { result: tokenPoolAmount } = useApiRx((api) => {
    if (protocol.type !== 'parachain') {
      return null;
    }

    const key: LsParachainCurrencyKey =
      type === ExchangeRateType.NativeToLiquid
        ? { Native: protocol.currency }
        : { lst: protocol.currency };

    return api.query.lstMinting.tokenPool(key);
  }, TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint);

  const { result: lstTotalIssuance } = useApiRx((api) => {
    if (protocol.type !== 'parachain') {
      return null;
    }

    return api.query.tokens.totalIssuance({ lst: protocol.currency });
  }, TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint);

  const parachainExchangeRate = useMemo(async () => {
    // Not yet ready.
    if (tokenPoolAmount === null || lstTotalIssuance === null) {
      return null;
    }

    const isEitherZero = tokenPoolAmount.isZero() || lstTotalIssuance.isZero();

    // TODO: Need to review whether this is the right way to handle this edge case.
    // Special case: No native tokens or liquidity available for conversion.
    // Default to 1:1 exchange rate. This also helps prevent division by zero.
    if (isEitherZero) {
      return 1;
    }

    const ratio =
      type === ExchangeRateType.NativeToLiquid
        ? calculateBnRatio(lstTotalIssuance, tokenPoolAmount)
        : calculateBnRatio(tokenPoolAmount, lstTotalIssuance);

    return ratio;
  }, [lstTotalIssuance, tokenPoolAmount, type]);

  const fetchErc20ExchangeRate = useCallback(
    async (_erc20TokenDef: LsErc20TokenDef) => {
      // TODO: Implement.

      return 0;
    },
    [],
  );

  const fetcher = useCallback(() => {
    return protocol.type === 'parachain'
      ? parachainExchangeRate
      : fetchErc20ExchangeRate(protocol);
  }, [fetchErc20ExchangeRate, parachainExchangeRate, protocol]);

  // TODO: Will need one for the LST total issuance, and another for the token pool amount.
  const {
    value: _erc20TotalIssuance,
    setIsPaused: setIsErc20TotalIssuancePaused,
  } = useContractReadSubscription(erc20Abi, {
    address: '0x',
    functionName: 'totalSupply',
    args: [],
  });

  // Pause or resume ERC20-based exchange rate fetching based
  // on whether the requested protocol is a parachain or an ERC20 token.
  // This helps prevent unnecessary requests.
  useEffect(() => {
    const isPaused = protocol.type === 'parachain';

    setIsErc20TotalIssuancePaused(isPaused);
  }, [protocol.type, setIsErc20TotalIssuancePaused]);

  // TODO: Use polling for the ERC20 exchange rate, NOT the parachain exchange rate which is already based on a subscription. Might need a mechanism to 'pause' polling when the selected protocol is a parachain chain, that way it doesn't make unnecessary requests until an ERC20 token is selected.
  const { value: exchangeRate, isRefreshing } = usePolling({
    fetcher,
    // Refresh every 5 seconds.
    refreshInterval: 5_000,
    primaryCacheKey: PollingPrimaryCacheKey.EXCHANGE_RATE,
    cacheKey: ['exchangeRate', protocolId],
  });

  return { exchangeRate, isRefreshing };
};

export default useExchangeRate;
