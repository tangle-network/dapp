import { useWebContext } from '@nepoche/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

export const useNativeCurrencyBalance = () => {
  const { activeAccount, activeApi, activeChain, isConnecting, loading } = useWebContext();

  const [balance, setBalance] = useState('');

  useEffect(() => {
    let isSubscribed = true;

    const handler = async () => {
      if (!activeChain || !activeApi || isConnecting || loading) {
        return;
      }

      activeApi.methods.chainQuery
        .tokenBalanceByCurrencyId(
          calculateTypedChainId(activeChain.chainType, activeChain.chainId),
          activeChain.nativeCurrencyId
        )
        .then((balance) => {
          if (isSubscribed) {
            setBalance(balance);
          }
        });
    };

    handler();

    return () => {
      isSubscribed = false;
    };
  }, [activeChain, activeApi, activeAccount, isConnecting, loading]);

  return balance;
};
