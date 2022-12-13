import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

export const useCurrencyBalance = (
  currency: Currency | null | undefined
): number | null => {
  const { activeAccount, activeApi, activeChain, isConnecting, loading } =
    useWebContext();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (
      !activeApi ||
      !activeAccount ||
      !activeChain ||
      !currency ||
      isConnecting ||
      loading
    ) {
      return;
    }

    const subscription = activeApi.methods.chainQuery
      .tokenBalanceByCurrencyId(
        calculateTypedChainId(activeChain.chainType, activeChain.chainId),
        currency.id
      )
      .subscribe((currencyBalance) => {
        setBalance(Number(currencyBalance));
      });
    return () => subscription.unsubscribe();
  }, [activeAccount, activeApi, activeChain, currency, isConnecting, loading]);

  return balance;
};
