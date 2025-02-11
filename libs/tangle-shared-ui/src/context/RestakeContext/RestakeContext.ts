'use client';

import { createContext } from 'react';
import { RestakeContextType } from './types';
import noop from 'lodash/noop';

const RestakeContext = createContext<RestakeContextType>({
  assets: {},
  balances: {},
  assetWithBalances: {},
  refetchErc20Balances: noop as () => Promise<void>,
  isLoading: false,
  error: null,
});

export default RestakeContext;
