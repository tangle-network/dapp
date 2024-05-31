import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

export const useCurrencyBalance = (
  currencyId: Currency['id'] | null | undefined,
  address?: string,
  typedChainId?: number,
): number | null => {
  const { activeAccount, activeApi, activeChain, loading } = useWebContext();

  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!activeApi || !activeAccount || !activeChain || !currencyId || loading) {
      return;
    }

    const typedChainIdToUse =
      typedChainId ??
      calculateTypedChainId(activeChain.chainType, activeChain.id);

    const subscription = activeApi.methods.chainQuery
      .tokenBalanceByCurrencyId(typedChainIdToUse, currencyId, address)
      .subscribe((currencyBalance) => {
        setBalance(Number(currencyBalance));
      });
    return () => subscription.unsubscribe();
  }, [activeAccount, activeApi, activeChain, address, currencyId, loading, typedChainId]); // prettier-ignore

  return balance;
};
