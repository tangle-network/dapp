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
): Record<number, number> => {
  const { activeAccount, activeApi, activeChain, isConnecting, loading } =
    useWebContext();

  // Balances object map currency id and its balance
  const [balances, setBalances] = useState<Record<number, number>>({});

  useEffect(() => {
    let isSubscribe = true;

    const handler = async () => {
      if (
        !activeApi ||
        !activeAccount ||
        !activeChain ||
        isConnecting ||
        loading
      ) {
        return;
      }

      currencies.forEach((currency) => {
        if (!balances[currency.id]) {
          activeApi.methods.chainQuery
            .tokenBalanceByCurrencyId(
              calculateTypedChainId(activeChain.chainType, activeChain.chainId),
              currency.id
            )
            .then((currencyBalance) => {
              if (isSubscribe) {
                setBalances((prev) => ({
                  ...prev,
                  [currency.id]: Number(currencyBalance),
                }));
              }
            })
            .catch((error) => {
              console.log('error in useCurrencyBalance: ');
              console.log(error);
            });
        }
      });
    };

    handler();

    return () => {
      isSubscribe = false;
    };
  }, [
    activeAccount,
    activeApi,
    activeChain,
    currencies.length,
    isConnecting,
    loading,
  ]);

  return balances;
};
