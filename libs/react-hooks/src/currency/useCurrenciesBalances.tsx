import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

/**
 * Fetch the balances of the currencies list
 * @param currencies the currencies list to fetching the balance
 * @param typedChainId the typed chain id (if not provided, will use the active chain)
 * @returns an object where the key is currency id and the value is currency balance
 */
export const useCurrenciesBalances = (
  currencies: Currency[],
  typedChainId?: number
): Record<Currency['id'], number> => {
  const { activeApi, activeChain, activeAccount } = useWebContext();

  // Balances object map currency id and its balance
  const [balances, setBalances] = useState<Record<number, number>>({});

  useEffect(() => {
    let isSubscribe = true;

    const typedChainIdToUse =
      typedChainId ??
      (activeChain &&
        calculateTypedChainId(activeChain.chainType, activeChain.id));

    if (!activeApi || typeof typedChainIdToUse !== 'number') {
      return;
    }

    const subscriptions = currencies.map((currency) => {
      return activeApi.methods.chainQuery
        .tokenBalanceByCurrencyId(typedChainIdToUse, currency.id)
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
  }, [activeApi, activeChain, activeAccount, currencies, typedChainId]);

  return balances;
};
