import { useContext } from 'react';
import BalanceContext from './BalancesContext';

const useBalancesContext = () => useContext(BalanceContext);

export default useBalancesContext;
