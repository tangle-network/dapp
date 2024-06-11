import { Currency } from '@webb-tools/abstract-api-provider/currency';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import { CurrencyRole } from '@webb-tools/dapp-types/Currency';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { POOL_KEY, SOURCE_CHAIN_KEY, TOKEN_KEY } from '../constants';
import { getParam } from '../utils';
import { NumberParam } from 'use-query-params';

function useCurrenciesFromRoute(typedChainId?: number) {
  const {
    apiConfig: { currencies, fungibleToWrappableMap },
  } = useWebContext();

  const [searhParams] = useSearchParams();

  const srcTypedChainId = useMemo(() => {
    return getParam(searhParams, SOURCE_CHAIN_KEY, NumberParam);
  }, [searhParams]);

  const fungibleCfg = useMemo(() => {
    const fungibleId = getParam(searhParams, POOL_KEY, NumberParam);
    if (typeof fungibleId !== 'number') {
      return undefined;
    }

    return currencies[fungibleId];
  }, [currencies, searhParams]);

  const wrappableCfg = useMemo(() => {
    const tokenId = getParam(searhParams, TOKEN_KEY, NumberParam);
    if (typeof tokenId !== 'number') {
      return undefined;
    }

    return currencies[tokenId];
  }, [currencies, searhParams]);

  const fungibleCurrencies = useMemo(() => {
    const currencyCfgs = Object.values(currencies).filter(
      (currencyCfg) => currencyCfg.role === CurrencyRole.Governable,
    );

    const typedChainIdToUse = typedChainId ?? srcTypedChainId;
    if (typeof typedChainIdToUse !== 'number') {
      return currencyCfgs;
    }

    return currencyCfgs.filter((currencyCfg) =>
      Array.from(currencyCfg.addresses.keys()).includes(typedChainIdToUse),
    );
  }, [currencies, srcTypedChainId, typedChainId]);

  const wrappableCurrencies = useMemo<Array<CurrencyConfig>>(
    () => {
      if (!fungibleCfg) {
        return [];
      }

      const wrappableMap = fungibleToWrappableMap.get(fungibleCfg.id);
      if (!wrappableMap) {
        return [];
      }

      const typedChainIdToUse = typedChainId ?? srcTypedChainId;
      if (typeof typedChainIdToUse !== 'number') {
        return [];
      }

      const wrappableSet = wrappableMap.get(typedChainIdToUse);
      if (!wrappableSet) {
        return [];
      }

      return Array.from(wrappableSet.values()).map((id) => currencies[id]);
    },
    // prettier-ignore
    [currencies, fungibleCfg, fungibleToWrappableMap, srcTypedChainId, typedChainId],
  );

  const allCurrencyCfgs = useMemo(() => {
    return [...fungibleCurrencies, ...wrappableCurrencies];
  }, [fungibleCurrencies, wrappableCurrencies]);

  const allCurrencies = useMemo(() => {
    return allCurrencyCfgs.map((currencyCfg) => new Currency(currencyCfg));
  }, [allCurrencyCfgs]);

  return {
    allCurrencies,
    allCurrencyCfgs,
    fungibleCfg,
    fungibleCurrencies,
    wrappableCfg,
    wrappableCurrencies,
  };
}

export default useCurrenciesFromRoute;
