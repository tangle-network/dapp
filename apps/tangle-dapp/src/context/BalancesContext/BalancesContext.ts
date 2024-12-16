import { createContext } from 'react';

import type useBalances from '../../data/balances/useBalances';

const BalanceContext = createContext<ReturnType<typeof useBalances>>({
  free: null,
  transferable: null,
  locked: null,
  isLoading: false,
  error: null,
});

export default BalanceContext;
