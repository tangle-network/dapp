import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

/**
 * Fetch the balances of the currencies list
 * @param currencies the currencies list to fetching the balance
 * @returns an object where the key is currency id and the value is currency balance
 */
export const useCurrenciesBalances = (
  currencies: Currency[]
): Record<Currency['id'], number> => {
  const { activeApi, activeChain, activeAccount } = useWebContext();

  // Balances object map currency id and its balance
  const [balances, setBalances] = useState<Record<number, number>>({});

  useEffect(() => {
    let isSubscribe = true;

    if (!activeApi || !activeChain) {
      return;
    }

    const subscriptions = currencies.map((currency) => {
      return activeApi.methods.chainQuery
        .tokenBalanceByCurrencyId(
          calculateTypedChainId(activeChain.chainType, activeChain.id),
          currency.id
        )
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
  }, [activeApi, activeChain, activeAccount, currencies]);

  return balances;
};
