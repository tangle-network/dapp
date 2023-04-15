import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

export const useCurrencyBalance = (
  currency: Currency | null | undefined,
  address?: string
): number | null => {
  const { activeAccount, activeApi, activeChain, loading } = useWebContext();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!activeApi || !activeAccount || !activeChain || !currency || loading) {
      return;
    }

    const subscription = activeApi.methods.chainQuery
      .tokenBalanceByCurrencyId(
        calculateTypedChainId(activeChain.chainType, activeChain.chainId),
        currency.id,
        address
      )
      .subscribe((currencyBalance) => {
        setBalance(Number(currencyBalance));
      });
    return () => subscription.unsubscribe();
  }, [activeAccount, activeApi, activeChain, address, currency, loading]);

  return balance;
};
