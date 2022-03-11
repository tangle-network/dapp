import { useWebContext } from '@webb-dapp/react-environment/webb-context';
import { useEffect, useState } from 'react';

export const useNativeCurrencyBalance = () => {
  const { activeApi, activeChain } = useWebContext();

  const [balance, setBalance] = useState('');

  useEffect(() => {
    if (activeChain && activeApi) {
      activeApi.methods.chainQuery.tokenBalanceByCurrencyId(activeChain.nativeCurrencyId).then((balance) => {
        setBalance(balance);
      });
    }
  }, [activeChain, activeApi]);

  return balance;
};
