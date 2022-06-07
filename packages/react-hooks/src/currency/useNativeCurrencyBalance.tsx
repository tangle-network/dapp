import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useEffect, useState } from 'react';

export const useNativeCurrencyBalance = () => {
  const { activeApi, activeChain } = useWebContext();

  const [balance, setBalance] = useState('');

  useEffect(() => {
    let isSubscribed = true;

    if (activeChain && activeApi) {
      activeApi.methods.chainQuery
        .tokenBalanceByCurrencyId(activeChain.id, activeChain.nativeCurrencyId)
        .then((balance) => {
          if (isSubscribed) {
            setBalance(balance);
          }
        });
    }

    return () => {
      isSubscribed = false;
    };
  }, [activeChain, activeApi, activeApi?.accounts.activeOrDefault]);

  return balance;
};
