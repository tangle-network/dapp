import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

export const useNativeCurrencyBalance = () => {
  const { activeAccount, activeApi, activeChain, isConnecting, loading } =
    useWebContext();

  const [balance, setBalance] = useState('');

  useEffect(() => {
    if (!activeChain || !activeApi || isConnecting || loading) {
      return;
    }

    const subscription = activeApi.methods.chainQuery
      .tokenBalanceByCurrencyId(
        calculateTypedChainId(activeChain.chainType, activeChain.chainId),
        activeChain.nativeCurrencyId
      )
      .subscribe((balance) => {
        setBalance(balance);
      });
    return () => subscription.unsubscribe();
  }, [
    activeChain,
    activeApi,
    activeAccount,
    isConnecting,
    loading,
    setBalance,
  ]);

  return balance;
};
