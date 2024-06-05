import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useEffect, useMemo, useState } from 'react';

export type UseCurrenciesBalancesReturnType = {
  balances: Record<Currency['id'], number>;
  isLoading: boolean;
};

/**
 * Fetch the balances of the currencies list
 * @param currencies the currencies list to fetching the balance
 * @param typedChainId the typed chain id (if not provided, will use the active chain)
 * @param address the address to fetch the balance (if not provided, will use the active account)
 * @returns an object where the key is currency id and the value is currency balance
 */
export const useCurrenciesBalances = (
  currencies: Currency[],
  typedChainId?: number,
  address?: string,
): UseCurrenciesBalancesReturnType => {
  const { activeApi, activeChain, activeAccount } = useWebContext();

  // Balances object map currency id and its balance
  const [balances, setBalances] = useState<Record<number, number>>({});

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isSubscribe = true;

    const typedChainIdToUse =
      typedChainId ??
      (activeChain &&
        calculateTypedChainId(activeChain.chainType, activeChain.id));

    if (!activeApi || typeof typedChainIdToUse !== 'number') {
      setIsLoading(false);
      return;
    }

    const subscriptions = currencies.map((currency) => {
      return activeApi.methods.chainQuery
        .tokenBalanceByCurrencyId(typedChainIdToUse, currency.id, address)
        .subscribe((currencyBalance) => {
          if (isSubscribe) {
            setBalances((prev) => {
              if (prev[currency.id] === Number(currencyBalance)) {
                return prev;
              }

              return {
                ...prev,
                [currency.id]: Number(currencyBalance),
              };
            });
          }
        });
    });

    return () => {
      isSubscribe = false;
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, [activeApi, activeChain, activeAccount, currencies, typedChainId, address]); // prettier-ignore

  const isAllBalancesLoaded = useMemo(
    () =>
      currencies.every((currency) => typeof balances[currency.id] === 'number'),
    [balances, currencies],
  );

  useEffect(() => {
    setIsLoading(!isAllBalancesLoaded);
  }, [isAllBalancesLoaded]);

  return {
    balances,
    isLoading,
  };
};
