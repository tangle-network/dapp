import { useWebContext } from '@webb-tools/api-provider-environment';
import { getNativeCurrencyFromConfig } from '@webb-tools/dapp-config';
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

    const typedChainId = calculateTypedChainId(
      activeChain.chainType,
      activeChain.chainId
    );

    const nativeCurrency = getNativeCurrencyFromConfig(
      activeApi.config.currencies,
      typedChainId
    );
    if (!nativeCurrency) {
      console.log('Not native currency found for chain ', activeChain);
      return;
    }

    const subscription = activeApi.methods.chainQuery
      .tokenBalanceByCurrencyId(typedChainId, nativeCurrency.id)
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
