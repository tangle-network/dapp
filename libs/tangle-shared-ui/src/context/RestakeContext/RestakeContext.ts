'use client';

import { createContext } from 'react';
import { RestakeContextType } from './types';

const RestakeContext = createContext<RestakeContextType>({
  assets: {},
  balances: {},
  assetWithBalances: [],
  isLoading: false,
  error: null,
});

export default RestakeContext;
