'use client';

import { createContext, FC, PropsWithChildren, useContext } from 'react';

import useBalances from '../data/balances/useBalances';

const BalanceContext = createContext<ReturnType<typeof useBalances>>({
  free: null,
  transferable: null,
  locked: null,
  isLoading: false,
  error: null,
});

export const useBalancesContext = () => useContext(BalanceContext);

export const BalancesProvider: FC<PropsWithChildren> = ({ children }) => {
  const balances = useBalances();

  return (
    <BalanceContext.Provider value={balances}>
      {children}
    </BalanceContext.Provider>
  );
};
