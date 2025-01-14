'use client';

import { createContext } from 'react';
import { of } from 'rxjs';
import { AssetBalanceMap, RestakeVaultAssetMap } from '../../types/restake';
import { RestakeContextType } from './types';

const RestakeContext = createContext<RestakeContextType>({
  assetMap: {},
  assetMap$: of<RestakeVaultAssetMap>({}),
  balances: {},
  balances$: of<AssetBalanceMap>({}),
  assetWithBalances: [],
  assetWithBalances$: of([]),
});

export default RestakeContext;
