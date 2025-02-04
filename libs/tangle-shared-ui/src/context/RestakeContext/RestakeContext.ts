'use client';

import { createContext } from 'react';
import { of } from 'rxjs';
import { AssetBalanceMap, RestakeAssetMap } from '../../types/restake';
import { RestakeContextType } from './types';

const RestakeContext = createContext<RestakeContextType>({
  assets: {},
  assets$: of<RestakeAssetMap>({}),
  balances: {},
  balances$: of<AssetBalanceMap>({}),
  assetWithBalances: [],
  assetWithBalances$: of([]),
  isLoading: false,
  error: null,
});

export default RestakeContext;
