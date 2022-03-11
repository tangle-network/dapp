import { useState, useEffect } from 'react';
import { useWebContext } from '@webb-dapp/react-environment/webb-context';

export const getNativeCurrencyBalance = () => {
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
