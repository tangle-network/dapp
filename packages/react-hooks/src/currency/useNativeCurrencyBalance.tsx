import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useEffect, useState } from 'react';

export const useNativeCurrencyBalance = () => {
  const { activeAccount, activeApi, activeChain } = useWebContext();

  const [balance, setBalance] = useState('');

  useEffect(() => {
    let isSubscribed = true;

    if (activeChain && activeApi) {
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
    }

    return () => {
      isSubscribed = false;
    };
  }, [activeChain, activeApi, activeAccount, activeApi?.accounts.activeOrDefault]);

  return balance;
};
