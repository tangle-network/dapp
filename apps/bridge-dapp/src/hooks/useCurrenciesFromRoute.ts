import { Currency } from '@webb-tools/abstract-api-provider/currency';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { CurrencyConfig } from '@webb-tools/dapp-config/currencies/currency-config.interface';
import { CurrencyRole } from '@webb-tools/dapp-types/Currency';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { POOL_KEY, SOURCE_CHAIN_KEY, TOKEN_KEY } from '../constants';

function useCurrenciesFromRoute(typedChainId?: number) {
  const {
    apiConfig: { currencies, fungibleToWrappableMap },
  } = useWebContext();

  const [searhParams] = useSearchParams();

  const srcTypedChainId = useMemo(() => {
    const sourceStr = searhParams.get(SOURCE_CHAIN_KEY);
    if (!sourceStr) {
      return undefined;
    }

    if (Number.isNaN(parseInt(sourceStr))) {
      return undefined;
    }

    return parseInt(sourceStr);
  }, [searhParams]);

  const fungibleCfg = useMemo(() => {
    const fungibleId = searhParams.get(POOL_KEY);
    if (!fungibleId) {
      return undefined;
    }

    return currencies[parseInt(fungibleId)];
  }, [currencies, searhParams]);

  const wrappableCfg = useMemo(() => {
    const tokenId = searhParams.get(TOKEN_KEY);
    if (!tokenId) {
      return undefined;
    }

    return currencies[parseInt(tokenId)];
  }, [currencies, searhParams]);

  const fungibleCurrencies = useMemo(() => {
    const currencyCfgs = Object.values(currencies).filter(
      (currencyCfg) => currencyCfg.role === CurrencyRole.Governable
    );

    const typedChainIdToUse = typedChainId ?? srcTypedChainId;
    if (typeof typedChainIdToUse !== 'number') {
      return currencyCfgs;
    }

    return currencyCfgs.filter((currencyCfg) =>
      Array.from(currencyCfg.addresses.keys()).includes(typedChainIdToUse)
    );
  }, [currencies, srcTypedChainId, typedChainId]);

  const wrappableCurrencies = useMemo<Array<CurrencyConfig>>(() => {
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
  }, [currencies, fungibleCfg, fungibleToWrappableMap, srcTypedChainId, typedChainId]); // prettier-ignore

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
