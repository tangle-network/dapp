import { FC, PropsWithChildren } from 'react';
import BalanceContext from './BalancesContext';
import useBalances from '../../data/balances/useBalances';

const BalancesProvider: FC<PropsWithChildren> = ({ children }) => {
  const balances = useBalances();

  return (
    <BalanceContext.Provider value={balances}>
      {children}
    </BalanceContext.Provider>
  );
};

export default BalancesProvider;
