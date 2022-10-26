import { Currency } from '@nepoche/abstract-api-provider';
import { useWebContext } from '@nepoche/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

export const useCurrencyBalance = (currency: Currency | null | undefined): number | null => {
  const { activeAccount, activeApi, activeChain, isConnecting, loading } = useWebContext();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const handler = async () => {
      if (!activeApi || !activeAccount || !activeChain || !currency || isConnecting || loading) {
        return;
      }

      activeApi.methods.chainQuery
        .tokenBalanceByCurrencyId(calculateTypedChainId(activeChain.chainType, activeChain.chainId), currency.id)
        .then((currencyBalance) => {
          setBalance(Number(currencyBalance));
        })
        .catch((error) => {
          console.log('error in useCurrencyBalance: ');
          throw error;
        });
    };

    handler();
  }, [activeAccount, activeApi, activeChain, currency, isConnecting, loading]);

  return balance;
};
