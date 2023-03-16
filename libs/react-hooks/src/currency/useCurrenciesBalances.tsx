import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Fetch the balances of the currencies list
 * @param currencies the currencies list to fetching the balance
 * @returns an object where the key is currency id and the value is currency balance
 */
export const useCurrenciesBalances = (
  currencies: Currency[]
): Record<Currency['id'], number> => {
  const { activeApi, activeChain, activeAccount } = useWebContext();

  const currencyIds = useRef(
    new Set<number>(currencies.map((currency) => currency.id))
  );

  // Balances object map currency id and its balance
  const [balances, setBalances] = useState<Record<number, number>>({});

  // Filter the currencies that already in the currencyIds
  const newCurrencies = useMemo(() => {
    return currencies.filter((c) => !currencyIds.current.has(c.id));
  }, [currencies]);

  useEffect(() => {
    let isSubscribe = true;

    if (!activeApi || !activeChain || !newCurrencies.length) {
      return;
    }

    const subscriptions = newCurrencies.map((currency) => {
      // Add the new currency id to the currencyIds
      currencyIds.current.add(currency.id);

      return activeApi.methods.chainQuery
        .tokenBalanceByCurrencyId(
          calculateTypedChainId(activeChain.chainType, activeChain.chainId),
          currency.id
        )
        .subscribe((currencyBalance) => {
          if (isSubscribe) {
            setBalances((prev) => ({
              ...prev,
              [currency.id]: Number(currencyBalance),
            }));
          }
        });
    });

    return () => {
      isSubscribe = false;
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!activeApi || !activeChain || !newCurrencies.length, activeAccount]);

  return balances;
};
