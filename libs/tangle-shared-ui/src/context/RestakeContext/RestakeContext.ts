'use client';

import { createContext } from 'react';
import { of } from 'rxjs';
import { AssetBalanceMap, AssetMap } from '../../types/restake';
import { RestakeContextType } from './types';

const RestakeContext = createContext<RestakeContextType>({
  assetMap: {},
  assetMap$: of<AssetMap>({}),
  balances: {},
  balances$: of<AssetBalanceMap>({}),
  assetWithBalances: [],
  assetWithBalances$: of([]),
});

export default RestakeContext;
